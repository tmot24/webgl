attribute vec4 a_Position;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform mat4 u_NormalMatrix;
varying vec4 v_Color;

void main() {
    vec3 lightDirection = vec3(0.0, 0.0, 1.0);
    vec4 color = vec4(0.0, 1.0, 1.0, 1.0);
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    float nDotL = max(dot(normal, lightDirection), 0.0);
    v_Color = vec4(color.rgb * nDotL, color.a);
}
