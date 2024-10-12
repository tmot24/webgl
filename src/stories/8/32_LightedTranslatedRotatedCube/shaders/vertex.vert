attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal; // Нормаль
uniform mat4 u_MvpMatrix;
uniform mat4 u_NormalMatrix; // Матрица преобразования нормали
uniform vec3 u_LightColor; // Цвет света
uniform vec3 u_LightDirection; // Мировые координаты, нормализованные
uniform vec3 u_AmbientLight; // Цвет фонового света
varying vec4 v_Color;

void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // Вычислить нормаль и нормализовать его
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal)); // Можно нормализовать в JS
    // Скалярное произведение направления света на ориентацию поверхности
    // dot - встроенная функция, возвращающая скалярное произведение двух векторов
    // отрицательное значение означает падение света с другой стороны (угол больше 90 градусов)
    float nDotL = max(dot(u_LightDirection, normal), 0.0);
    // Вычислить цвет в модели диффузного отражения (игнорирование прозрачности)
    vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
    // Вычислить цвет в модели фонового отражения
    vec3 ambient = u_AmbientLight * a_Color.rgb;
    // Сложить цвет в модели диффузного и фонового отражения
    v_Color = vec4(diffuse + ambient, a_Color.a);
}
