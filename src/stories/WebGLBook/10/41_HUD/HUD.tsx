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

export const HUD = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    // Получить контекст для отображения 2d графики
    const hudContext = hudRef.current?.getContext("2d");
    if (!hudRef.current) return;
    if (!context) return;
    if (!hudContext) return;
    const { gl, canvas } = context;
    setBackgroundColor({ gl, depthTest: true });

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    const { n, buffers } = initVertexBuffers({ gl, program });

    const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    const u_Clicked = gl.getUniformLocation(program, "u_Clicked");

    // Передать false в u_Clicked
    gl.uniform1i(u_Clicked, 0);

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

    let currentAngle = 0;

    // Регистрируем клик на hud, так как он лежит выше
    hudRef.current.onmousedown = (event) => {
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
        const picked = check({
          gl,
          n,
          x: xInCanvas,
          y: yInCanvas,
          currentAngle,
          projectionMatrix,
          viewMatrix,
          mvpMatrix,
          u_MvpMatrix,
          u_Clicked,
        });
        if (picked) {
          alert("Куб");
        }
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

      draw2D({
        ctx: hudContext,
        currentAngle,
      });

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

  return (
    <div
      style={{
        height: 500,
        width: 500,
      }}
    >
      <canvas
        style={{
          position: "absolute",
          zIndex: 0,
        }}
        width={500}
        height={500}
        ref={ref}
      />
      <canvas
        style={{
          position: "absolute",
          zIndex: 1,
        }}
        width={500}
        height={500}
        ref={hudRef}
      />
      <Fps />
    </div>
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
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const colors = new Float32Array([   // Colors
    0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, // v0-v1-v2-v3 front
    0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
    0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
    0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, // v1-v6-v7-v2 left
    0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93 // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const indices = new Uint8Array([
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

// При наличии сложных трёхмерных объектов или очень большой области рисования,
// процедура определения выбранного объекта может занимать существенное время.
// Устранить этот недостаток можно применением упрощённых моделей выбираемых объектов,
// уменьшением области рисования или буфером кадра
function check({
  gl,
  n,
  x,
  y,
  currentAngle,
  projectionMatrix,
  viewMatrix,
  mvpMatrix,
  u_MvpMatrix,
  u_Clicked,
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
  u_Clicked: WebGLUniformLocation | null;
}) {
  let picked = false;

  // Нарисовать куб красным (проверка по цвету)
  gl.uniform1i(u_Clicked, 1);

  draw({
    gl,
    n,
    currentAngle,
    projectionMatrix,
    viewMatrix,
    mvpMatrix,
    u_MvpMatrix,
  });

  // Массив для хранения пикселей
  const pixels = new Uint8Array(4);
  // Читает блок пикселей из буфера цвета
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  // Указатель над кубом, если pixel[0] === 255
  if (pixels[0] === 255) {
    picked = true;
  }
  // Передать false в u_Clicked
  gl.uniform1i(u_Clicked, 0);
  // Перерисовать
  draw({
    gl,
    n,
    currentAngle,
    projectionMatrix,
    viewMatrix,
    mvpMatrix,
    u_MvpMatrix,
  });

  return picked;
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

function draw2D({
  ctx,
  currentAngle,
}: {
  ctx: CanvasRenderingContext2D;
  currentAngle: number;
}) {
  // Очистить Индикацию на Лобовом Стекле (ИЛС)
  ctx.clearRect(0, 0, 500, 500);
  // Нарисовать треугольник белыми линиями
  ctx.beginPath(); // Начать рисование
  ctx.moveTo(120, 10);
  ctx.lineTo(200, 150);
  ctx.lineTo(40, 150);
  ctx.closePath();
  // Определить цвет линии
  ctx.strokeStyle = "rgba(0, 0, 0, 1)";
  // Нарисовать треугольник
  ctx.stroke();
  // Нарисовать белые буквы
  ctx.font = '18px "Times New Roman"';
  // Определить цвет букв
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fillText("HUD: Проекционный дисплей", 40, 180);
  ctx.fillText("Треугольник рисуется с помощью Canvas 2D API.", 40, 200);
  ctx.fillText("Куб рисуется с помощью API WebGL.", 40, 220);
  ctx.fillText("Текущий угол: " + Math.floor(currentAngle), 40, 240);
}
