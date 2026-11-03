import { useEffect, useRef, useState } from 'react';

const vertexSource = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentSource = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform vec2 pointer;

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float line(vec2 p, vec2 a, vec2 b, float w) {
  vec2 pa = p-a, ba = b-a;
  float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
  return smoothstep(w, 0.0, length(pa-ba*h));
}
float box(vec2 p, vec2 c, vec2 s) {
  vec2 d = abs(p-c)-s;
  return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 p = uv;
  p.y = 1.0-p.y;
  p.x += pointer.x * 0.012;
  p.y += pointer.y * 0.009;
  float t = time;
  vec3 col = vec3(0.027,0.035,0.052);

  // Quiet technical grid and horizon glow.
  float grid = max(step(0.992, fract(p.x*22.0)), step(0.992, fract(p.y*15.0)));
  col += vec3(0.045,0.075,0.095)*grid*0.19;
  col += vec3(0.018,0.12,0.16)*exp(-abs(p.y-0.52)*9.0)*0.10;

  // Three connected processing lanes.
  float route = line(p, vec2(.06,.54), vec2(.92,.54), .0015);
  col += vec3(.06,.19,.23)*route*.58;
  for (int i=0; i<2; i++) {
    float x = i==0 ? .39 : .66;
    float beam = line(p, vec2(x,.54), vec2(x+.025,.54), .002);
    col += vec3(.22,.48,.53)*beam*.45;
  }

  // Isometric table blocks, each with a distinct medallion material.
  for (int i=0; i<3; i++) {
    float cx = i==0 ? .43 : (i==1 ? .69 : .88);
    float cy = .54;
    float w = i==2 ? .052 : .061;
    float d = box(p, vec2(cx,cy), vec2(w,.105));
    float inside = 1.0-smoothstep(-.001,.002,d);
    vec3 base = i==0 ? vec3(.37,.19,.085) : (i==1 ? vec3(.33,.43,.48) : vec3(.57,.38,.10));
    float vertical = clamp((p.y-(cy-.105))/.21,0.0,1.0);
    col = mix(col, base*(.70+.48*vertical), inside*.88);
    float edge = 1.0-smoothstep(.001,.004,abs(d));
    col += base*edge*.50;
    // Stacked horizontal data layers.
    for(int k=0;k<4;k++) {
      float yy = cy-.065+float(k)*.039;
      float layer = line(p, vec2(cx-w*.72,yy), vec2(cx+w*.72,yy), .0013);
      col += (i==1 ? vec3(.45,.68,.76) : (i==2 ? vec3(.93,.69,.23) : vec3(.81,.43,.18)))*layer*.38;
    }
    // Small indexed cells imply columnar storage.
    for(int k=0;k<3;k++) {
      float xx = cx-w*.48+float(k)*w*.48;
      float tick = line(p, vec2(xx,cy-.088), vec2(xx,cy+.088), .00065);
      col += vec3(.78,.83,.84)*tick*.18;
    }
    float halo = exp(-abs(d)*65.0);
    col += base*halo*.10;
  }

  // Incoming records travel through the three stages in a steady stream.
  for(int i=0;i<34;i++) {
    float fi=float(i);
    float phase=fract(t*.105+hash(fi)*.83+fi*.071);
    float x=.035+phase*.89;
    float laneY=.54+(hash(fi+7.0)-.5)*.23;
    float convergence=smoothstep(.02,.32,phase);
    float y=mix(laneY,.54,convergence)+sin(t*.7+fi*2.4)*.006*(1.0-convergence);
    float r=.0024+hash(fi+21.0)*.0016;
    float dotGlow=exp(-length((p-vec2(x,y))*vec2(1.0,1.35))/r*1.35);
    vec3 particle=phase<.43 ? vec3(.30,.78,.87) : (phase<.72 ? vec3(.63,.78,.83) : vec3(.96,.66,.25));
    col += particle*dotGlow*.76;
    col += particle*exp(-length(p-vec2(x,y))*37.0)*.07;
  }

  // Stage junction glows and data pulses.
  for(int i=0;i<3;i++) {
    float x=i==0 ? .43 : (i==1 ? .69 : .88);
    vec3 c=i==0 ? vec3(.88,.39,.14) : (i==1 ? vec3(.45,.75,.84) : vec3(1.0,.66,.18));
    float pulse=.5+.5*sin(t*1.4+float(i)*1.8);
    float glow=exp(-length((p-vec2(x,.54))*vec2(1.0,1.6))*24.0);
    col+=c*glow*(.08+.10*pulse);
    float node=1.0-smoothstep(.009,.012,length(p-vec2(x,.54)));
    col=mix(col,c*.9,node);
  }

  float vignette=smoothstep(.85,.18,length((uv-.5)*vec2(.9,1.0)));
  col*=.70+.30*vignette;
  gl_FragColor=vec4(col,1.0);
}`;

export default function StreamingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglReady, setWebglReady] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: true, powerPreference: 'low-power' });
    if (!gl) { setWebglReady(false); return; }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      setWebglReady(false);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      setWebglReady(false);
      return;
    }

    const buffer = gl.createBuffer();
    if (!buffer) { gl.deleteProgram(program); setWebglReady(false); return; }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, 'resolution');
    const timeUniform = gl.getUniformLocation(program, 'time');
    const pointerUniform = gl.getUniformLocation(program, 'pointer');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: 0, y: 0 };
    let raf = 0;
    let start = performance.now();
    let active = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width*dpr));
      const height = Math.max(1, Math.round(rect.height*dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      draw(performance.now());
    };
    const draw = (now: number) => {
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(timeUniform, reduced.matches ? 0 : (now-start)/1000);
      gl.uniform2f(pointerUniform, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const frame = (now: number) => {
      if (!active || document.hidden || reduced.matches) { raf=0; return; }
      draw(now);
      raf=requestAnimationFrame(frame);
    };
    const resume = () => {
      if (reduced.matches) { if (raf) cancelAnimationFrame(raf); raf=0; draw(performance.now()); }
      else if (active && !document.hidden && !raf) raf=requestAnimationFrame(frame);
    };
    const visibility = () => {
      if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf=0; }
      else resume();
    };
    const move = (event: PointerEvent) => {
      const rect=canvas.getBoundingClientRect();
      pointer.x=((event.clientX-rect.left)/rect.width-.5)*2;
      pointer.y=((event.clientY-rect.top)/rect.height-.5)*2;
      if (reduced.matches) draw(performance.now());
    };
    const leave = () => { pointer.x=0; pointer.y=0; if(reduced.matches) draw(performance.now()); };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerleave',leave);
    document.addEventListener('visibilitychange',visibility);
    reduced.addEventListener('change',resume);
    resize();
    start=performance.now();
    resume();

    return () => {
      active=false;
      if(raf) cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener('pointermove',move);
      canvas.removeEventListener('pointerleave',leave);
      document.removeEventListener('visibilitychange',visibility);
      reduced.removeEventListener('change',resume);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <section className="stream-visual" role="img" aria-label="Simulação visual do fluxo de dados: ingestão em Bronze, refinamento em Silver e agregação columnar em Gold">
      <style>{`
        .stream-visual{position:relative;width:100%;height:300px;overflow:hidden;border:1px solid rgba(120,157,177,.16);border-radius:16px;background:#07090e;color:#dce8ee;isolation:isolate}
        .stream-visual canvas{display:block;width:100%;height:100%}
        .stream-stages{position:absolute;inset:18px 18px auto;display:grid;grid-template-columns:1fr 1fr 1fr;pointer-events:none}
        .stream-stage{font:600 10px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.17em;text-transform:uppercase;color:#d89055;text-shadow:0 1px 8px #07090e}
        .stream-stage:nth-child(2){text-align:center;color:#b9d1d9}.stream-stage:nth-child(3){text-align:right;color:#e6b84e}
        .stream-stage small{display:block;margin-top:5px;font:400 8px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.11em;color:rgba(195,213,221,.46)}
        .stream-caption{position:absolute;bottom:12px;left:0;right:0;text-align:center;font:500 8px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.2em;color:rgba(164,189,200,.4);pointer-events:none}
        .stream-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;padding:40px 16px 30px;background:radial-gradient(ellipse at center,rgba(16,42,54,.52),transparent 70%)}
        .stream-fallback i{position:absolute;height:1px;left:9%;right:9%;background:linear-gradient(90deg,transparent,#48a2b5,#b5cbd0,#d49c3d,transparent);opacity:.6}
        .stream-fallback b{position:relative;display:grid;place-items:center;width:76px;height:78px;border-radius:12px;border:1px solid rgba(195,135,79,.42);background:linear-gradient(145deg,rgba(117,65,32,.52),rgba(37,29,29,.85));box-shadow:0 0 24px rgba(199,107,46,.1);color:#d89055;font:500 10px ui-monospace,monospace;letter-spacing:.13em}
        .stream-fallback b:nth-of-type(2){border-color:rgba(158,191,201,.4);background:linear-gradient(145deg,rgba(84,116,128,.45),rgba(24,34,42,.88));color:#c3d5db}
        .stream-fallback b:nth-of-type(3){border-color:rgba(225,174,77,.48);background:linear-gradient(145deg,rgba(131,92,33,.5),rgba(40,34,23,.88));color:#e6b84e}
        @media(max-width:520px){.stream-visual{height:260px}.stream-fallback{gap:7px}.stream-fallback b{width:65px;height:68px}}
      `}</style>
      <canvas ref={canvasRef} aria-hidden="true" />
      {!webglReady && <div className="stream-fallback" aria-hidden="true"><i/><b>BRONZE</b><b>SILVER</b><b>GOLD</b></div>}
      <div className="stream-stages" aria-hidden="true">
        <div className="stream-stage">Bronze<small>INGEST</small></div>
        <div className="stream-stage">Silver<small>REFINE</small></div>
        <div className="stream-stage">Gold<small>SERVE</small></div>
      </div>
      <div className="stream-caption" aria-hidden="true">SIMULAÇÃO VISUAL · WEBGL LOCAL</div>
    </section>
  );
}
