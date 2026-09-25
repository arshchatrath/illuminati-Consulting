// Glowing topographic terrain: one full-screen WebGL2 fragment shader, no libraries.
// A ground plane seen in perspective, its height from flowing simplex noise, drawn as
// gold contour lines with a soft glow and prism-coloured (chromatic) edges.

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uFade;
uniform float uRipple;
out vec4 outColor;

// 3D simplex noise by Ashima Arts / Stefan Gustavson (MIT)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float height(vec2 p) {
  float t = uTime * 0.06;
  vec2 q = p * 0.42 + vec2(0.0, uTime * 0.05);
  // Domain warp: the landscape flows like slow liquid.
  vec2 w = vec2(snoise(vec3(q * 0.7, t)), snoise(vec3(q * 0.7 + 4.3, t + 1.7)));
  q += 0.6 * w;
  return 0.65 * snoise(vec3(q, t * 1.4)) + 0.3 * snoise(vec3(q * 2.1 + 9.2, t * 1.9));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  // Camera one unit above the ground, pitched down.
  const float pitch = 0.62;
  vec3 fwd = vec3(0.0, -sin(pitch), -cos(pitch));
  vec3 up = vec3(0.0, cos(pitch), -sin(pitch));
  vec3 rd = normalize(vec3(uv.x * 2.0, 0.0, 0.0) + up * (uv.y * 2.0) + fwd * 1.7);
  float dist = 1.0 / max(-rd.y, 0.03);
  vec2 p = rd.xz * dist;

  float h = height(p);
  if (uRipple > 0.0) {
    // A ring spreading from the point under the logo.
    float r = length(p - vec2(0.0, -cos(pitch) / sin(pitch)));
    h += 0.3 * sin(r * 7.0 - uRipple * 9.0) * exp(-abs(r - uRipple * 2.6) * 2.2) * exp(-uRipple * 1.2);
  }

  float v = h * 7.0;
  float w = max(fwidth(v), 1e-4);
  float d = abs(fract(v - 0.5) - 0.5) / w;  // distance to the nearest contour, in pixels
  float major = 1.0 - step(0.5, mod(floor(v + 0.5), 5.0));  // every 5th line is an index line
  float core = 1.0 - smoothstep(0.0, 1.7, d);
  float glow = exp(-d * 0.15);  // wide emissive bloom

  // Prism edges: a faint red fringe on one side of each line and blue on the other, wider toward the edges.
  float ca = (0.6 + 1.6 * length(uv)) * w;
  float fr = max(1.0 - smoothstep(0.0, 1.4, abs(fract(v + ca - 0.5) - 0.5) / w) - core, 0.0);
  float fb = max(1.0 - smoothstep(0.0, 1.4, abs(fract(v - ca - 0.5) - 0.5) / w) - core, 0.0);

  float lod = 1.0 - smoothstep(0.22, 0.55, w);  // fade lines too dense to draw cleanly
  float lift = 0.5 + 0.8 * smoothstep(-0.7, 0.8, h);  // ridges catch more light
  float fog = exp(-dist * 0.2);
  float vig = mix(0.14, 1.0, smoothstep(0.08, 0.6, length(uv * vec2(0.85, 1.25))));  // dark behind the logo
  float top = 1.0 - 0.6 * smoothstep(0.05, 0.5, uv.y);
  float k = lod * lift * fog * vig * top;

  vec3 gold = vec3(1.0, 0.74, 0.32);
  vec3 col = gold * (core * mix(1.5, 2.8, major) + glow * mix(0.3, 0.65, major)) * k;
  col += (vec3(0.9, 0.2, 0.1) * fr + vec3(0.15, 0.35, 1.0) * fb) * 0.35 * k;
  col = 1.0 - exp(-col * 1.1);

  float grain = fract(sin(dot(gl_FragCoord.xy + uTime, vec2(12.9898, 78.233))) * 43758.5453);
  outColor = vec4(vec3(0.012, 0.059, 0.047) + col * uFade + (grain - 0.5) * 0.02, 1.0);
}`;

// Returns { resize, draw(timeSec, fade, rippleSec), dispose }, or null without WebGL2 or a real GPU.
export function createTerrain(canvas) {
  // low-power: this shader is light, and waking a second (discrete) GPU makes start-up slower.
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;
  // No real GPU (software rendering): the shader would stall the page, so skip the terrain.
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }
  gl.clearColor(0.012, 0.059, 0.047, 1); // page background until the first frame is drawn
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Compile without asking for the result, so the driver can do it off the main thread;
  // draw() starts once it's done (checked with KHR_parallel_shader_compile where available).
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    gl.attachShader(prog, s);
  };
  const prog = gl.createProgram();
  compile(gl.VERTEX_SHADER, VERT);
  compile(gl.FRAGMENT_SHADER, FRAG);
  gl.linkProgram(prog);
  let state = 'compiling';
  let u = null;
  const ready = () => {
    if (state !== 'compiling') return state === 'ok';
    if (parallel && !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) return false;
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      state = 'failed'; // the logo still engraves on the plain background
      return false;
    }
    gl.useProgram(prog);
    u = Object.fromEntries(['uRes', 'uTime', 'uFade', 'uRipple'].map((n) => [n, gl.getUniformLocation(prog, n)]));
    state = 'ok';
    resize();
    return true;
  };

  function resize() {
    // The canvas is always full-screen; reading the window size avoids forcing a page layout.
    const w = innerWidth;
    const h = innerHeight;
    // ponytail: fixed ~1.3 megapixel budget instead of GPU detection; lower it if low-end phones stutter.
    const s = Math.min(window.devicePixelRatio || 1, Math.sqrt(1.3e6 / (w * h)));
    canvas.width = Math.round(w * s);
    canvas.height = Math.round(h * s);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (u) gl.uniform2f(u.uRes, canvas.width, canvas.height);
  }

  return {
    resize,
    draw(time, fade, ripple) {
      if (!ready()) return;
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uFade, fade);
      gl.uniform1f(u.uRipple, ripple);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteProgram(prog);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
