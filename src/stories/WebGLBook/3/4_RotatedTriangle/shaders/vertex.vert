// attribute - Уникалные данные для каждой вершины (можно объявить только с типом float)
attribute vec4 a_Position;
// uniform - Одни и те же данные для всех вершин
uniform vec2 u_CosBSinB;
// uniform float u_CosB, u_SinB - подобный способ передачи не является оптимальным, лучше объединить в vec

// x' = x*cosb - y*sinb
// y' = x*sinb + y*cosb
// z' = z

void main() {
    gl_Position.x = a_Position.x * u_CosBSinB.x - a_Position.y * u_CosBSinB.y;
    gl_Position.y = a_Position.x * u_CosBSinB.y + a_Position.y * u_CosBSinB.x;
    gl_Position.z = a_Position.z;
    gl_Position.w = a_Position.w;
}
