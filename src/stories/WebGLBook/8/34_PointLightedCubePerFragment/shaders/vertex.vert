attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal; // Нормаль
uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix; // Матрица преобразования нормали
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec4 v_Color;

void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // Рассчитать положение вершины в мировой системе координат
    v_Position = vec3(u_ModelMatrix * a_Position);
    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
    v_Color = a_Color;
}
