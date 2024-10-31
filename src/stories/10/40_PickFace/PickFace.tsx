import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { mat4, vec3 } from "gl-matrix";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";
import { getRadianFromDegree } from "../../../common/getRadianFromDegree.ts";
import { initArrayBuffer } from "../../../common/initArrayBuffer.ts";

export const PickFace = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

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

    const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    const u_PickedFace = gl.getUniformLocation(program, "u_PickedFace");

    const mvpMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(30),
      canvas.width / canvas.height,
      1,
      100,
    );
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(0, 0, 7),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );

    // Инициализировать выбранную грань
    gl.uniform1i(u_PickedFace, -1);

    let currentAngle = 0;

    canvas.onmousedown = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      const rect = canvas.getBoundingClientRect();
      if (
        rect.left <= x &&
        x < rect.right &&
        rect.top <= y &&
        y < rect.bottom
      ) {
        const xInCanvas = x - rect.left;
        const yInCanvas = rect.bottom - y;
        const face = checkFace({
          gl,
          n,
          x: xInCanvas,
          y: yInCanvas,
          currentAngle,
          projectionMatrix,
          viewMatrix,
          mvpMatrix,
          u_MvpMatrix,
          u_PickedFace,
        });

        gl.uniform1i(u_PickedFace, face);

        draw({
          gl,
          n,
          currentAngle,
          projectionMatrix,
          viewMatrix,
          mvpMatrix,
          u_MvpMatrix,
        });
      }
    };

    const ANGLE_STEP = 20.0; // Угол поворота (градусы/секунду)
    let lastTime = 0; // Последний раз, когда эта функция была вызвана
    function animate(angle: number, time: DOMHighResTimeStamp) {
      const elapsed = time - lastTime; // Вычисляем прошедшее время
      lastTime = time;

      // Обновляем текущий угол поворота
      const newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;

      return newAngle % 360;
    }

    const tick = (time: DOMHighResTimeStamp = 0) => {
      currentAngle = animate(currentAngle, time);

      draw({
        gl,
        n,
        currentAngle,
        projectionMatrix,
        viewMatrix,
        mvpMatrix,
        u_MvpMatrix,
      });

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }

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

  return <canvas width={500} height={500} ref={ref} />;
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
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const colors = new Float32Array([   // Colors
    0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, // v0-v1-v2-v3 front
    0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, // v0-v5-v6-v1 up
    0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,  // v1-v6-v7-v2 left
    0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93 // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const faces = new Uint8Array([   // Faces
    1, 1, 1, 1,     // v0-v1-v2-v3 front
    2, 2, 2, 2,     // v0-v3-v4-v5 right
    3, 3, 3, 3,     // v0-v5-v6-v1 up
    4, 4, 4, 4,     // v1-v6-v7-v2 left
    5, 5, 5, 5,     // v7-v4-v3-v2 down
    6, 6, 6, 6     // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const indices = new Uint8Array([   // Indices of the vertices
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
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
  const faceBuffer = initArrayBuffer({
    gl,
    data: faces,
    num: 1,
    type: gl.UNSIGNED_BYTE,
    program,
    attribute: "a_Face",
  });
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return {
    n: indices.length,
    buffers: [indexBuffer, positionBuffer, colorBuffer, faceBuffer],
  };
}

// При наличии сложных трёхмерных объектов или очень большой области рисования,
// процедура определения выбранного объекта может занимать существенное время.
// Устранить этот недостаток можно применением упрощённых моделей выбираемых объектов,
// уменьшением области рисования или буфером кадра
function checkFace({
  gl,
  n,
  x,
  y,
  currentAngle,
  projectionMatrix,
  viewMatrix,
  mvpMatrix,
  u_MvpMatrix,
  u_PickedFace,
}: {
  gl: WebGL2RenderingContext;
  n: number;
  x: number;
  y: number;
  currentAngle: number;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_PickedFace: WebGLUniformLocation | null;
}) {
  // Массив для хранения пикселей
  const pixels = new Uint8Array(4);
  // Записать номер грани в альфа-компонент,
  // можно было сделать проще, сразу записать номер граней в альфа-канале,
  // тогда бы мы избавились от лишнего вызова draw и сразу читали альфа-канал клика
  gl.uniform1i(u_PickedFace, 0);

  draw({
    gl,
    n,
    currentAngle,
    projectionMatrix,
    viewMatrix,
    mvpMatrix,
    u_MvpMatrix,
  });

  // Прочитать в пикселе (x, y).pixels[3] номер грани (куда тыкнули)
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  return pixels[3];
}

function draw({
  gl,
  n,
  currentAngle,
  projectionMatrix,
  viewMatrix,
  mvpMatrix,
  u_MvpMatrix,
}: {
  gl: WebGL2RenderingContext;
  n: number;
  currentAngle: number;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
}) {
  // Необходимо вычислять каждый раз (не знаю почему)
  mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);

  const radian = getRadianFromDegree(currentAngle);

  mat4.rotateX(mvpMatrix, mvpMatrix, radian);
  mat4.rotateY(mvpMatrix, mvpMatrix, radian);
  mat4.rotateZ(mvpMatrix, mvpMatrix, radian);

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
