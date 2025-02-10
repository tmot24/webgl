attribute vec4 a_Position;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform mat4 u_NormalMatrix;
varying vec4 v_Color;

void main() {
    gl_Position = u_MvpMatrix * a_Position;
    // Расчёт затенения, чтобы придать руке-манипулятору объёмный вид
    vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7)); // Направление света
    vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
    vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);
    float nDotl = max(dot(normal, lightDirection), 0.0);
    v_Color = vec4(color.rgb * nDotl + vec3(0.1), color.a);
}
