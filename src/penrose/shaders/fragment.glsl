#ifdef GL_ES
precision highp float;
#endif

// basic fragment shader

void main() {
  vec3 a = vec3(0.5, 0.5, 0.5);

  gl_FragColor = vec4(a, 1.000);
}