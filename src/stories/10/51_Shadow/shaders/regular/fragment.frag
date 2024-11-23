precision mediump float;

uniform sampler2D u_ShadowMap;

varying vec4 v_PositionFromLight;
varying vec4 v_Color;

// Фрагментый шейдер для обычного рисования
void main() {
    // Вычисление по спецификации OpenGL ES 2.0
    vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
    vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
    float depth = rgbaDepth.r; // Извлечь z-значение из R
    // Без 0.005 появляются полосы Маха
    float visibility = (shadowCoord.z > depth + 0.005) ? 0.7 : 1.0;
    gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
}
