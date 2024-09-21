attribute vec4 a_Position;
attribute float a_PointSize;
attribute vec4 a_Color;
// varying принимает только vec и mat
varying vec4 v_Color;

void main() {
    gl_Position = a_Position;
    gl_PointSize = a_PointSize;
    // Передача данных во фрагментный шейдер
    v_Color = a_Color;
}
