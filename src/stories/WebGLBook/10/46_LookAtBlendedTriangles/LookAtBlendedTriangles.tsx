import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";
import { vec3, mat4 } from "gl-matrix";
import { Fps } from "../../../../fps/Fps.tsx";

export const LookAtBlendedTriangles = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { gl } = context;
    setBackgroundColor({ gl, depthTest: true });

    // Активировать альфа-смешивание
    gl.enable(gl.BLEND);
    /**
     * Указать, как должна действовать функция смешивания
     * В смешивании участвуют два цвета: цвет, который будет подмешиваться (исходный цвет, sfactor)
     * и цвет, в который будет осуществляться подмешивание (целевой цвет, dfactor).
     */
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // На практике чаще используется кумулятивное смешивание (результат более яркий чем оригинал)

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    // prettier-ignore
    const verticesColors = new Float32Array([
      // Vertex coordinates and color(RGBA)
      0.0, 0.5, -0.4, 0.4, 1.0, 0.4, 0.75, // The back green one
      -0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 0.75,
      0.5, -0.5, -0.4, 1.0, 0.4, 0.4, 0.75,

      0.5, 0.4, -0.2, 1.0, 0.4, 0.4, 0.75, // The middle yellow one
      -0.5, 0.4, -0.2, 1.0, 1.0, 0.4, 0.75,
      0.0, -0.6, -0.2, 1.0, 1.0, 0.4, 0.75,

      0.0, 0.5, 0.0, 0.4, 0.4, 1.0, 0.75,  // The front blue one
      -0.5, -0.5, 0.0, 0.4, 0.4, 1.0, 0.75,
      0.5, -0.5, 0.0, 1.0, 0.4, 0.4, 0.75
    ]);
    const FSIZE = verticesColors.BYTES_PER_ELEMENT;
    const dimension = 3;
    const dimensionAlpha = 4;
    const n = 9;
    const coordsCount = 3;
    const stride = FSIZE * 7;
    const offsetPosition = 0;
    const offsetColor = FSIZE * coordsCount;
    // Количество вызовов вершинного шейдера

    // 1. Создать буферный объект
    const vertexColorBuffer = gl.createBuffer();
    // 2. Указать тип буферного объекта
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    // 3. Записать данные в буферный объект
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(program, "a_Position");
    // 4. Сохранить ссылку на буферный объект в переменной a_Position
    gl.vertexAttribPointer(
      a_Position,
      dimension,
      gl.FLOAT,
      false,
      stride,
      offsetPosition,
    );
    // 5. Разрешить присваивание переменной a_Position
    gl.enableVertexAttribArray(a_Position);

    const a_Color = gl.getAttribLocation(program, "a_Color");
    // 4. Сохранить ссылку на буферный объект в переменной a_Color
    gl.vertexAttribPointer(
      a_Color,
      dimensionAlpha,
      gl.FLOAT,
      false,
      stride,
      offsetColor,
    );
    // 5. Разрешить присваивание переменной a_Position
    gl.enableVertexAttribArray(a_Color);

    const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
    // Создаём матрицу для хранения матрицы вида
    const viewMatrix = mat4.create();

    document.onkeydown = (ev) =>
      keyDown({ ev, gl, n, u_ViewMatrix, viewMatrix });

    const u_ProjMatrix = gl.getUniformLocation(program, "u_ProjMatrix");
    const projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, -1, 1, -1, 1, 0, 3);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projectionMatrix);

    draw({ gl, u_ViewMatrix, n, viewMatrix });
  }, []);

  return (
    <>
      <canvas width={500} height={500} ref={ref} />
      <Fps />
    </>
  );
});

// Точка наблюдения
let g_eyeX = 0.2;
const g_eyeY = 0.25;
const g_eyeZ = 0.25;

function keyDown({
  ev,
  gl,
  n,
  u_ViewMatrix,
  viewMatrix,
}: {
  ev: KeyboardEvent;
  gl: WebGL2RenderingContext;
  n: number;
  u_ViewMatrix: WebGLUniformLocation | null;
  viewMatrix: mat4;
}) {
  if (ev.code === "ArrowRight") {
    g_eyeX += 0.01;
  } else if (ev.code === "ArrowLeft") {
    g_eyeX -= 0.01;
  } else {
    return;
  }
  draw({ gl, u_ViewMatrix, n, viewMatrix });
}

function draw({
  gl,
  u_ViewMatrix,
  n,
  viewMatrix,
}: {
  gl: WebGL2RenderingContext;
  u_ViewMatrix: WebGLUniformLocation | null;
  viewMatrix: mat4;
  n: number;
}) {
  // Точка наблюдения
  const eyePoint = vec3.fromValues(g_eyeX, g_eyeY, g_eyeZ);
  // Точка направления взгляда
  const centerPoint = vec3.fromValues(0, 0, 0);
  // Направление вверх
  const upDirection = vec3.fromValues(0, 1, 0);
  mat4.lookAt(viewMatrix, eyePoint, centerPoint, upDirection);

  // Матрицами модели называются матрицы перемещения и/или вращения
  const modelMatrix = mat4.create();
  const ANGLE = -10;
  const radian = (Math.PI * ANGLE) / 180; // Преобразование в радианы
  mat4.fromZRotation(modelMatrix, radian);

  // Матрица модели вида - лучше вычислять в JS, а не в вершинном шейдере для каждой вершины (оптимизация)
  const modelViewMatrix = mat4.create();
  mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

  // Передать матрицу вида в переменную u_ViewMatrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, modelViewMatrix);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
