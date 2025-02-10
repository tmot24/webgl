import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { mat4, vec3 } from "gl-matrix";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";
import { getRadianFromDegree } from "../../../../common/getRadianFromDegree.ts";

export const PointLightedCubePerFragment = memo(() => {
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

    const n = initVertexBuffers({ gl, program });

    /** Свет */
    const u_LightColor = gl.getUniformLocation(program, "u_LightColor");
    const u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
    const u_AmbientLight = gl.getUniformLocation(program, "u_AmbientLight");
    // Установить цвет света (белый)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // Задаем направление света (в мировой системе координат)
    gl.uniform3fv(u_LightPosition, vec3.fromValues(2.3, 4.0, 3.5));
    // Установить окружающее освещение
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    /** Матрицы */
    const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
    const u_NormalMatrix = gl.getUniformLocation(program, "u_NormalMatrix");

    const modelMatrix = mat4.create(); // Матрица модели
    const mvpMatrix = mat4.create(); // Матрица проекции вида модели
    const projectionMatrix = mat4.create(); // Матрица проекции (важно считать отдельно)
    const viewMatrix = mat4.create(); // Матрица вида (важно считать отдельно)
    const normalMatrix = mat4.create(); // Матрица преобразования для нормалей

    // Рассчитать матрицу модели
    mat4.rotateY(modelMatrix, modelMatrix, getRadianFromDegree(90));
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);

    // Рассчитать матрицу проекции
    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(30),
      canvas.width / canvas.height,
      1,
      100,
    );
    // Рассчитать матрицу проекции
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(6, 6, 14),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );
    // Рассчитать матрицу проекции вида
    mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
    // Рассчитать матрицу проекции вида модели
    mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

    // Передать матрицу проекции вида модели в u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);

    // Вычислить матрицу для преобразования нормали на основе матрицы модели
    mat4.invert(normalMatrix, modelMatrix);
    // Передать матрицу преобразования для нормалей в u_NormalMatrix (необходимо транспонировать)
    gl.uniformMatrix4fv(u_NormalMatrix, true, normalMatrix);

    // Очистить буфер цвета и глубины
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Нарисуем куб
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
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
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // prettier-ignore
  const vertices = new Float32Array([ // Coordinates
    2.0, 2.0, 2.0,  -2.0, 2.0, 2.0,  -2.0,-2.0, 2.0,   2.0,-2.0, 2.0, // v0-v1-v2-v3 front
    2.0, 2.0, 2.0,   2.0,-2.0, 2.0,   2.0,-2.0,-2.0,   2.0, 2.0,-2.0, // v0-v3-v4-v5 right
    2.0, 2.0, 2.0,   2.0, 2.0,-2.0,  -2.0, 2.0,-2.0,  -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 2.0, 2.0,  -2.0, 2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0,-2.0, 2.0, // v1-v6-v7-v2 left
    -2.0,-2.0,-2.0,   2.0,-2.0,-2.0,   2.0,-2.0, 2.0,  -2.0,-2.0, 2.0, // v7-v4-v3-v2 down
    2.0,-2.0,-2.0,  -2.0,-2.0,-2.0,  -2.0, 2.0,-2.0,   2.0, 2.0,-2.0  // v4-v7-v6-v5 back
  ]);

  // prettier-ignore
  const colors = new Float32Array([ // Colors
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0      // v4-v7-v6-v5 back
  ]);

  // prettier-ignore
  const normals = new Float32Array([ // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);

  // prettier-ignore
  const indices = new Uint8Array([ // Indices of the vertices
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

  // Записываем свойство вершины в буферы (координаты, цвета и нормали)
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
    num: dimension,
    program,
    attribute: "a_Color",
  });
  initArrayBuffer({
    gl,
    data: normals,
    num: dimension,
    attribute: "a_Normal",
    program,
  });

  // Записываем индексы в буферный объект
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

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
