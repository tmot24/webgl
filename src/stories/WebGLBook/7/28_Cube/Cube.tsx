import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { vec3, mat4 } from "gl-matrix";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";

export const Cube = memo(() => {
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

    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // prettier-ignore
    const verticesColors = new Float32Array([
      // Координаты вершин и цвета
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0 White
      -1.0, 1.0, 1.0, 1.0, 0.0, 1.0,  // v1 Magenta
      -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,  // v2 Red
      1.0, -1.0, 1.0, 1.0, 1.0, 0.0,  // v3 Yellow
      1.0, -1.0, -1.0, 0.0, 1.0, 0.0,  // v4 Green
      1.0, 1.0, -1.0, 0.0, 1.0, 1.0,  // v5 Cyan
      -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,  // v6 Blue
      -1.0, -1.0, -1.0, 0.0, 0.0, 0.0   // v7 Black
    ]);
    // prettier-ignore
    const indices = new Uint8Array([ // Uint8Array - потому что это целые числа до 255
      // Индексы вершин
      0, 1, 2, 0, 2, 3,    // front
      0, 3, 4, 0, 4, 5,    // right
      0, 5, 6, 0, 6, 1,    // up
      1, 6, 7, 1, 7, 2,    // left
      7, 4, 3, 7, 3, 2,    // down
      4, 7, 6, 4, 6, 5     // back
    ]);
    const FSIZE = verticesColors.BYTES_PER_ELEMENT;
    const dimension = 3;
    const n = indices.length;
    const coordsCount = 3;
    // в одной строке 6 единиц данных
    const stride = FSIZE * 6;
    const offsetPosition = 0;
    const offsetColor = FSIZE * coordsCount;

    // 1. Создать буферный объект
    const vertexColorBuffer = gl.createBuffer();
    // 1.5 Создаём индексный буферный объект
    const indicesBuffer = gl.createBuffer();
    // 2. Указать типы буферных объектов
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    // 3. Записать данные в буферные объекты
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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

  return <canvas width={500} height={500} ref={ref} />;
});
