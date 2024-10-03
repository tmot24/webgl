import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";
import { mat4 } from "gl-matrix";

export const OrthoView = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { gl } = context;
    setBackgroundColor(gl);

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    // prettier-ignore
    const verticesColors = new Float32Array([
      // координаты вершин и цвет
      0.0,  0.6,  -0.4,  0.4,  1.0,  0.4, // дальний зелёный треугольник
      -0.5, -0.4,  -0.4,  0.4,  1.0,  0.4,
      0.5, -0.4,  -0.4,  1.0,  0.4,  0.4,

      0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // жёлтый треугольник в середине
      -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
      0.0, -0.6,  -0.2,  1.0,  1.0,  0.4,

      0.0,  0.5,   0.0,  0.4,  0.4,  1.0, // ближний синий треугольник
      -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
      0.5, -0.5,   0.0,  1.0,  0.4,  0.4,
    ]);
    const FSIZE = verticesColors.BYTES_PER_ELEMENT;
    const dimension = 3;
    const n = 9;
    const coordsCount = 3;
    const stride = FSIZE * 6;
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
      dimension,
      gl.FLOAT,
      false,
      stride,
      offsetColor,
    );
    // 5. Разрешить присваивание переменной a_Position
    gl.enableVertexAttribArray(a_Color);

    const u_ProjMatrix = gl.getUniformLocation(program, "u_ProjMatrix");
    // Матрица для установки точки взгляда и линии взгляда.
    const projectionMatrix = mat4.create();

    document.onkeydown = (ev) =>
      keyDown({ ev, gl, n, u_ProjMatrix, projectionMatrix });

    draw({ gl, u_ProjMatrix, n, projectionMatrix });
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});

// Расстояние до ближней и дальней точки наблюдения
let g_near = 0;
let g_far = 0.5;
function keyDown({
  ev,
  gl,
  n,
  u_ProjMatrix,
  projectionMatrix,
}: {
  ev: KeyboardEvent;
  gl: WebGL2RenderingContext;
  n: number;
  u_ProjMatrix: WebGLUniformLocation | null;
  projectionMatrix: mat4;
}) {
  switch (ev.code) {
    case "ArrowRight":
      g_near += 0.01;
      break;
    case "ArrowLeft":
      g_near -= 0.01;
      break;
    case "ArrowUp":
      g_far += 0.01;
      break;
    case "ArrowDown":
      g_far -= 0.01;
      break;
  }

  draw({ gl, u_ProjMatrix, n, projectionMatrix });
}

function draw({
  gl,
  u_ProjMatrix,
  n,
  projectionMatrix,
}: {
  gl: WebGL2RenderingContext;
  u_ProjMatrix: WebGLUniformLocation | null;
  n: number;
  projectionMatrix: mat4;
}) {
  // Установить видимый объём, используя матрицу
  mat4.ortho(projectionMatrix, -1, 1, -1, 1, g_near, g_far);
  // mat4.ortho(projectionMatrix, -0.5, 0.5, -0.5, 0.5, 0, 0.5);
  // mat4.ortho(projectionMatrix, -0.3, 0.3, -1, 1, 0, 0.5);

  console.log({ g_near, g_far });

  // Передать матрицу вида в переменную u_ProjMatrix
  gl.uniformMatrix4fv(u_ProjMatrix, false, projectionMatrix);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
