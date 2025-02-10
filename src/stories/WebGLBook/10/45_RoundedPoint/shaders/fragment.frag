precision mediump float;
uniform vec4 u_FragColor;

void main() {
    // Центр координат находится в точке (0.5 0.5)
    float dist = distance(gl_PointCoord, vec2(0.5, 0.5));
    // Радиус равен 0.5
    if (dist < 0.5) {
        gl_FragColor = u_FragColor;
    } else {
        discard;
    }
}
