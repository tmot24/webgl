attribute vec4 a_Position;
attribute vec4 a_Color;
// varying принимает только vec и mat
varying vec4 v_Color;

void main() {
    gl_Position = a_Position;
    // Передача данных во фрагментный шейдер
    v_Color = a_Color;
}
