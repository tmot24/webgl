attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_MvpMatrix;
varying vec4 v_Color;
varying float v_Dist;

void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
    // gl_Position.w - это значение z каждой вершиныв системе видимых координат, умноженное на -1.
    // Использовать отрицательное значение z вершины в системе видимых координат
    v_Dist = gl_Position.w;
}
