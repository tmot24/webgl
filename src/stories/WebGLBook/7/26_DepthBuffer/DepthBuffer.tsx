import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { vec3, mat4 } from "gl-matrix";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";

export const DepthBuffer = memo(() => {
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

    // prettier-ignore
    const verticesColors = new Float32Array([
      // Vertex coordinates and color
      0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one
      -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
      0.5, -1.0,   0.0,  1.0,  0.4,  0.4,

      0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
      -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
      0.5, -1.0,  -2.0,  1.0,  0.4,  0.4,

      0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
      -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
      0.5, -1.0,  -4.0,  1.0,  0.4,  0.4,
    ]);
    const FSIZE = verticesColors.BYTES_PER_ELEMENT;
    const dimension = 3;
    const n = 9; // Three vertices per triangle * 3
    const coordsCount = 3;
    // в одной строке 6 единиц данных
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

    const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    // Матрица модели вида проекции
    const mvpMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const modelMatrix = mat4.create();

    const radian = (Math.PI * 30) / 180; // Преобразование в радианы
    mat4.perspective(
      projectionMatrix,
      radian,
      canvas.width / canvas.height,
      1,
      100,
    );

    // Точка наблюдения
    const eyePoint = vec3.fromValues(0, 0, 5);
    // Точка направления взгляда
    const centerPoint = vec3.fromValues(0, 0, -100);
    // Направление вверх
    const upDirection = vec3.fromValues(0, 1, 0);
    mat4.lookAt(viewMatrix, eyePoint, centerPoint, upDirection);

    mat4.fromTranslation(modelMatrix, vec3.fromValues(0.75, 0, 0));

    // Перемножение матриц
    const pvMatrix = mat4.create();
    mat4.multiply(pvMatrix, projectionMatrix, viewMatrix);
    mat4.multiply(mvpMatrix, pvMatrix, modelMatrix);

    // Передать матрицу
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, n);

    // Подготовить матрицу модели для другой тройки треугольников
    mat4.fromTranslation(modelMatrix, vec3.fromValues(-0.75, 0, 0));
    // Перемножить
    mat4.multiply(mvpMatrix, pvMatrix, modelMatrix);
    // Передать матрицу
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, n);
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});
