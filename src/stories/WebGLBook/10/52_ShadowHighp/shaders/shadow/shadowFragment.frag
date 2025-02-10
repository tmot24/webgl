precision mediump float;

// Фрагментный шейдер генерирующий карту теней
void main() {
    // Разбивает gl_FragCoord.z на 4 байта
    const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
    const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
    // fract - отбрасывает дробную часть в значении
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    gl_FragColor = rgbaDepth;
}
