#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 mouse = clamp(u_mouse, vec2(-0.010,0.020), u_resolution);
    
	vec2 st = gl_FragCoord.xy/u_resolution;
    vec2 mt = vec2(
        sin(st.x + mouse.x + u_time),
        cos(st.y + mouse.y + u_time)
    );
	gl_FragColor = vec4(mt.x,mt.y,0.0,1.0);
}