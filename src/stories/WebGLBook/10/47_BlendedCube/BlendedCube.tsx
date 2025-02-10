import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { vec3, mat4 } from "gl-matrix";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";
import { Fps } from "../../../../fps/Fps.tsx";

export const BlendedCube = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { gl, canvas } = context;
    setBackgroundColor({ gl, depthTest: true });

    // Активировать альфа-смешивание
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // prettier-ignore
    const vertices = new Float32Array([   // Vertex coordinates
      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
      1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
      -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
      -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
      1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]);
    // prettier-ignore
    const colors = new Float32Array([     // Colors
      0.5, 0.5, 1.0, 0.85,  0.5, 0.5, 1.0, 0.85,  0.5, 0.5, 1.0, 0.85,  0.5, 0.5, 1.0, 0.85,  // v0-v1-v2-v3 front(blue)
      0.5, 1.0, 0.5, 0.85,  0.5, 1.0, 0.5, 0.85,  0.5, 1.0, 0.5, 0.85,  0.5, 1.0, 0.5, 0.85,  // v0-v3-v4-v5 right(green)
      1.0, 0.5, 0.5, 0.85,  1.0, 0.5, 0.5, 0.85,  1.0, 0.5, 0.5, 0.85,  1.0, 0.5, 0.5, 0.85,  // v0-v5-v6-v1 up(red)
      1.0, 1.0, 0.5, 0.85,  1.0, 1.0, 0.5, 0.85,  1.0, 1.0, 0.5, 0.85,  1.0, 1.0, 0.5, 0.85,  // v1-v6-v7-v2 left
      1.0, 1.0, 1.0, 0.85,  1.0, 1.0, 1.0, 0.85,  1.0, 1.0, 1.0, 0.85,  1.0, 1.0, 1.0, 0.85,  // v7-v4-v3-v2 down
      0.5, 1.0, 1.0, 0.85,  0.5, 1.0, 1.0, 0.85,  0.5, 1.0, 1.0, 0.85,  0.5, 1.0, 1.0, 0.85   // v4-v7-v6-v5 back
    ]);
    // prettier-ignore
    const indices = new Uint8Array([       // Indices of the vertices
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // right
      8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);
    const dimension = 3;
    const n = indices.length;

    initArrayBuffer({
      gl,
      data: vertices,
      num: dimension,
      program,
      attribute: "a_Position",
    });
    initArrayBuffer({
      gl,
      data: colors,
      num: 4,
      program,
      attribute: "a_Color",
    });
    // 1. Создать буферный объект для индексов
    const indexBuffer = gl.createBuffer();
    // 2. Указываем тип буферного объекта
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // 3. Запись данных в буферный объект
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    // Матрица модели вида проекции
    const mvpMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    const viewMatrix = mat4.create();

    const radian = (Math.PI * 30) / 180; // Преобразование в радианы
    mat4.perspective(
      projectionMatrix,
      radian,
      canvas.width / canvas.height,
      1,
      100,
    );

    // Точка наблюдения
    const eyePoint = vec3.fromValues(3, 3, 7);
    // Точка направления взгляда
    const centerPoint = vec3.fromValues(0, 0, 0);
    // Направление вверх
    const upDirection = vec3.fromValues(0, 1, 0);
    mat4.lookAt(viewMatrix, eyePoint, centerPoint, upDirection);
    // Перемножение матриц
    mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);

    // Передать матрицу
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Выполняет шейдер и рисует геометрическую фигуру в указанном режиме mode,
    // используя индексы в буферном объекте типа gl.ELEMENT_ARRAY_BUFFER.
    // mode - определяет тип фигуры
    // count - число индексов, участвующих в операции рисования
    // type - определяет тип индексов (gl.UNSIGNED_BYTE, gl.UNSIGNED_SHORT)
    // (если передать не тот тип, то будет ошибка отображения)
    // offset - определяет смещение в массиве индексов в байтах
    // gl.drawElements - экономит память, но требует больше вычислительных ресурсов
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }, []);

  return (
    <>
      <canvas width={500} height={500} ref={ref} />
      <Fps />
    </>
  );
});

function initArrayBuffer({
  gl,
  program,
  data,
  num,
  attribute,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  data: Float32Array;
  num: number;
  attribute: string;
}) {
  // 1. Создать буферный объект
  const buffer = gl.createBuffer();
  // 2. Указать типы буферных объектов
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // 3. Записать данные в буферные объекты
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Присвоить буферный объект переменной-атрибуту
  const a_Attribute = gl.getAttribLocation(program, attribute);
  // 4. Сохранить ссылку на буферный объект в переменной a_Position
  gl.vertexAttribPointer(a_Attribute, num, gl.FLOAT, false, 0, 0);
  // 5. Разрешить присваивание переменной a_Position
  gl.enableVertexAttribArray(a_Attribute);
}
