import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { mat4, vec3 } from "gl-matrix";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";
import { getRadianFromDegree } from "../../../../common/getRadianFromDegree.ts";
import { initArrayBuffer } from "../../../../common/initArrayBuffer.ts";
import { Fps } from "../../../../fps/Fps.tsx";

export const Fog = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { gl, canvas } = context;
    setBackgroundColor({ gl, depthTest: true });

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    const { n, buffers } = initVertexBuffers({ gl, program });

    // Цвет тумана
    const fogColor = new Float32Array([0.137, 0.231, 0.423]);
    // Расстояние [до начальной точки, до конечной точки]
    const fogDist = new Float32Array([55, 80]);
    // Местоположение точки наблюдения в мировых координатах
    const eye = new Float32Array([25, 65, 35, 1]);

    const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
    const u_Eye = gl.getUniformLocation(program, "u_Eye");
    const u_FogColor = gl.getUniformLocation(program, "u_FogColor");
    const u_FogDist = gl.getUniformLocation(program, "u_FogDist");

    // Передать цвет тумана, расстояние и точку наблюдения
    gl.uniform3fv(u_FogColor, fogColor); // Цвет тумана
    gl.uniform2fv(u_FogDist, fogDist); // Начальная и конечная точки
    gl.uniform4fv(u_Eye, eye); // Точка наблюдения

    // Определить цвет очистки и включить удаление невидимых поверхностей
    gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1);

    const mvpMatrix = mat4.create();
    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    mat4.fromScaling(modelMatrix, vec3.fromValues(10, 10, 10));
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);

    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(30),
      canvas.width / canvas.height,
      1,
      100,
    );
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(eye[0], eye[1], eye[2]),
      vec3.fromValues(0, 2, 0),
      vec3.fromValues(0, 1, 0),
    );
    mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
    mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);

    document.onkeydown = (ev) => keyDown({ ev, gl, n, u_FogDist, fogDist });

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    return () => {
      // Удаление программы
      gl.deleteProgram(program);
      // Удаление вершинного шейдера
      gl.deleteShader(vertexShader);
      // Удаление фрагментного шейдера
      gl.deleteShader(fragmentShader);
      // Удаление буферов
      buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    };
  }, []);

  return (
    <>
      <canvas width={500} height={500} ref={ref} />
      <Fps />
    </>
  );
});

function initVertexBuffers({
  gl,
  program,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
}) {
  const dimension = 3;
  // prettier-ignore
  const vertices = new Float32Array([   // Vertex coordinates
    1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,    // v0-v1-v2-v3 front
    1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1,    // v0-v3-v4-v5 right
    1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1,    // v0-v5-v6-v1 up
    -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1,    // v1-v6-v7-v2 left
    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,    // v7-v4-v3-v2 down
    1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1     // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0,  // v0-v1-v2-v3 front
    0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4,  // v0-v3-v4-v5 right
    1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const indices = new Uint8Array([       // Indices of the vertices
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);

  const positionBuffer = initArrayBuffer({
    gl,
    data: vertices,
    num: dimension,
    program,
    attribute: "a_Position",
  });
  const colorBuffer = initArrayBuffer({
    gl,
    data: colors,
    num: 3,
    program,
    attribute: "a_Color",
  });
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return {
    n: indices.length,
    buffers: [indexBuffer, positionBuffer, colorBuffer],
  };
}

function keyDown({
  ev,
  gl,
  n,
  u_FogDist,
  fogDist,
}: {
  ev: KeyboardEvent;
  gl: WebGL2RenderingContext;
  n: number;
  u_FogDist: WebGLUniformLocation | null;
  fogDist: Float32Array;
}) {
  // Увеличить максимальную дальность тумана
  if (ev.code === "ArrowUp") {
    fogDist[1] += 1;
    // Уменьшить максимальное расстояние тумана
  } else if (ev.code === "ArrowDown") {
    if (fogDist[1] > fogDist[0]) {
      fogDist[1] -= 1;
    }
  } else {
    return;
  }
  // Прокинуть расстояние тумана
  gl.uniform2fv(u_FogDist, fogDist);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
