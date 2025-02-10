import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";
import { vec3, mat4 } from "gl-matrix";

export const LookAtRotatedTrianglesWithKeys = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { gl } = context;
    setBackgroundColor({ gl });

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    // prettier-ignore
    const verticesColors = new Float32Array([
      // координаты вершин и цвет
      0, 0.5, -0.4, 0.4, 1, 0.4, // дальний зелёный треугольник
      -0.5, -0.5, -0.4, 0.4, 1, 0.4,
      0.5, -0.5, -0.4, 1, 0.4, 0.4,

      0.5, 0.4, -0.2, 1, 0.4, 0.4, // жёлтый треугольник в середине
      -0.5, 0.4, -0.2, 1, 1, 0.4,
      0, -0.6, -0.2, 1, 1, 0.4,

      0, 0.5, 0, 0.4, 0.4, 1, // ближний синий треугольник
      -0.5, -0.5, 0, 0.4, 0.4, 1,
      0.5, -0.5, 0, 1, 0.4, 0.4

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

    const u_ModelViewMatrix = gl.getUniformLocation(
      program,
      "u_ModelViewMatrix",
    );

    document.onkeydown = (ev) => keyDown({ ev, gl, n, u_ModelViewMatrix });

    draw({ gl, u_ModelViewMatrix, n });
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});

// Точка наблюдения
let g_eyeX = 0.2;
const g_eyeY = 0.25;
const g_eyeZ = 0.25;
function keyDown({
  ev,
  gl,
  n,
  u_ModelViewMatrix,
}: {
  ev: KeyboardEvent;
  gl: WebGL2RenderingContext;
  n: number;
  u_ModelViewMatrix: WebGLUniformLocation | null;
}) {
  if (ev.code === "ArrowRight") {
    g_eyeX += 0.01;
  } else if (ev.code === "ArrowLeft") {
    g_eyeX -= 0.01;
  } else {
    return;
  }
  draw({ gl, u_ModelViewMatrix, n });
}

function draw({
  gl,
  u_ModelViewMatrix,
  n,
}: {
  gl: WebGL2RenderingContext;
  u_ModelViewMatrix: WebGLUniformLocation | null;
  n: number;
}) {
  // Точка наблюдения
  const eyePoint = vec3.fromValues(g_eyeX, g_eyeY, g_eyeZ);
  // Точка направления взгляда
  const centerPoint = vec3.fromValues(0, 0, 0);
  // Направление вверх
  const upDirection = vec3.fromValues(0, 1, 0);
  // Создание матрицы
  const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, eyePoint, centerPoint, upDirection);

  // Матрицами модели называются матрицы перемещения и/или вращения
  const modelMatrix = mat4.create();
  const ANGLE = -10;
  const radian = (Math.PI * ANGLE) / 180; // Преобразование в радианы
  mat4.fromZRotation(modelMatrix, radian);

  // Матрица модели вида - лучше вычислять в JS, а не в вершинном шейдере для каждой вершины (оптимизация)
  const modelViewMatrix = mat4.create();
  mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

  // Передать матрицу вида в переменную u_ModelViewMatrix
  gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
