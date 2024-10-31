attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
// Так и не понял зачем здесь мировые координаты
// (возможно потому что туман распространяется на всё, но это не точно)
uniform vec4 u_Eye;// Точка наблюдения в мировых координатах
varying vec4 v_Color;
varying float v_Dist;

void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
    // Вычислить расстояние до каждой вершины  от точки наблюдения
    // (в мировых координатах для правильности расчёта, но это не точно)
    v_Dist = distance(u_ModelMatrix * a_Position, u_Eye);
}
