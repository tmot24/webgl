precision mediump float;

uniform sampler2D u_ShadowMap;

varying vec4 v_PositionFromLight;
varying vec4 v_Color;

// Восстановить z-значение из RGBA
float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));
    float deapth = dot(rgbaDepth, bitShift);
    return deapth;
}
// Фрагментый шейдер для обычного рисования
void main() {
    // Вычисление по спецификации OpenGL ES 2.0
    vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
    vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
    float depth = unpackDepth(rgbaDepth); // Восстановить z-значение из RGBA
    // Без 0.0015 всё в тени (всё ещё полосы Маха)
    float visibility = (shadowCoord.z > depth + 0.0015) ? 0.7 : 1.0;
    gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
}
