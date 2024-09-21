// Спецификатор точности
precision mediump float;
// Во фрагментном шейдере attribute не используется
uniform vec4 u_FragColor;

void main() {
    gl_FragColor = u_FragColor;
}
