precision mediump float;
uniform vec3 u_FogColor;// Цвет тумана
uniform vec2 u_FogDist;// Начальная и конечная точки тумана
varying vec4 v_Color;
varying float v_Dist;

void main() {
    // Вычислить коэффициент затуманивания
    // clamp - функция ограничивает значение индекса 0,
    // индексами 1 если меньше и индексом 2 если больше
    float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);
    // Чем дальше туман, тем сильнее он становится:
    // u_FogColor * (1 - fogFactor) + v_Color * fogFactor;
    // mix - используется для интерполяции между двумя значениями (смешивание)
    vec3 color = mix(u_FogColor, vec3(v_Color), fogFactor);
    gl_FragColor = vec4(color, v_Color.a);
}
