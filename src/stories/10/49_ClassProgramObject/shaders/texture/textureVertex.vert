attribute vec4 a_Position;
attribute vec4 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 u_MvpMatrix;
uniform mat4 u_NormalMatrix;

varying float v_NdotL;
varying vec2 v_TexCoord;

void main() {
    vec3 lightDirection = vec3(0.0, 0.0, 1.0);
    gl_Position = u_MvpMatrix * a_Position;
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    v_NdotL = max(dot(normal, lightDirection), 0.0);
    v_TexCoord = a_TexCoord;
}
