#version 300 es

precision highp float;

in vec4 fcolor;

uniform float u_clock;

out vec4 finalColor;

void main() {
  finalColor = vec4(sin(fcolor.x * 3.0), fcolor.yzw *0.25).bgra;
}
