attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;

void main() {
    gl_Position = a_Position;
    // Передача данных во фрагментный шейдер
    v_TexCoord = a_TexCoord;
}
