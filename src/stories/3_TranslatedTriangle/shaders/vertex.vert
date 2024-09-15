// attribute - Уникалные данные для каждой вершины (можно объявить только с типом float)
attribute vec4 a_Position;
uniform vec4 u_Translation;

void main() {
    gl_Position = a_Position + u_Translation;
}
