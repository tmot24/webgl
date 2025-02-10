precision mediump float;

// Фрагментный шейдер генерирующий карту теней
void main() {
    // Записать z-значение в R
    gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);
}
