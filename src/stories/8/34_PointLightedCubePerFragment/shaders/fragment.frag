// Спецификатор точности
precision mediump float;
uniform vec3 u_LightColor;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec4 v_Color;

void main() {
    // Нормализовать нормаль, которая интерполируется и не равна 1.0 (длина)
    vec3 normal = normalize(v_Normal);
    // Вычислить направление на источник света и нормализовать
    vec3 lightDirection = normalize(u_LightPosition - v_Position);
    // Скалярное произведение направления света и нормали
    float nDotl = max(dot(lightDirection, normal), 0.0);
    // Вычислить окончательный цвет с применением моделей диффузного и фонового отражения
    vec3 diffusse = u_LightColor * v_Color.rgb * nDotl;
    vec3 ambient = u_AmbientLight * v_Color.rgb;
    gl_FragColor = vec4(diffusse + ambient, v_Color.a);

}
