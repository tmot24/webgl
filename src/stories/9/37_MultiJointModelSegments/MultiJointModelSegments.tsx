import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { mat4, vec3 } from "gl-matrix";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";
import { getRadianFromDegree } from "../../../common/getRadianFromDegree.ts";
import { Fps } from "../../../fps/Fps.tsx";

export const MultiJointModelSegments = memo(() => {
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

    const a_Position = gl.getAttribLocation(program, "a_Position");
    const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    const u_NormalMatrix = gl.getUniformLocation(program, "u_NormalMatrix");

    const projectionMatrix = mat4.create(); // Матрица проекции (важно считать отдельно)
    const viewMatrix = mat4.create(); // Матрица вида (важно считать отдельно)
    const viewProjMatrix = mat4.create();
    const mvpMatrix = mat4.create();

    // Рассчитать матрицу проекции
    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(50),
      canvas.width / canvas.height,
      1,
      100,
    );
    // Рассчитать матрицу проекции
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(20, 10, 30),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );
    // Рассчитать матрицу проекции вида
    mat4.multiply(viewProjMatrix, projectionMatrix, viewMatrix);

    document.onkeydown = (ev) =>
      keydownHandler({
        ev,
        gl,
        n,
        a_Position,
        viewProjMatrix,
        mvpMatrix,
        u_MvpMatrix,
        u_NormalMatrix,
      });

    draw({
      gl,
      n,
      a_Position,
      viewProjMatrix,
      mvpMatrix,
      u_MvpMatrix,
      u_NormalMatrix,
    });

    return () => {
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <>
      <canvas width={500} height={500} ref={ref} />
      <Fps />
    </>
  );
});

const ANGLE_STEP = 3.0; // Шаг изменения угла поворота (градусы)
let g_arm1Angle = 90.0; // Угол поворота сегмента1 (градусы)
let g_joint1Angle = 45.0; // Угол поворота сочленения1 (градусы)
let g_joint2Angle = 0.0; // Угол поворота сочленения2 (градусы)
let g_joint3Angle = 0.0; // Угол поворота сочленения3 (градусы)

function keydownHandler({
  ev,
  gl,
  n,
  a_Position,
  viewProjMatrix,
  mvpMatrix,
  u_MvpMatrix,
  u_NormalMatrix,
}: {
  ev: KeyboardEvent;
  gl: WebGL2RenderingContext;
  n: number;
  a_Position: number;
  viewProjMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_NormalMatrix: WebGLUniformLocation | null;
}) {
  switch (ev.code) {
    case "ArrowUp": // Увеличение угла поворота сочленения1 (ось Z)
      if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
      break;
    case "ArrowDown": // Уменьшение угла поворота сочленения1 (ось Z)
      if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
      break;
    case "ArrowRight": // Увеличение угла поворота сегмента1 (ось Y)
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
      break;
    case "ArrowLeft": // Уменьшение угла поворота сегмента1 (ось Y)
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
      break;
    case "KeyZ": // Увеличение угла поворота сочленения2
      g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
      break;
    case "KeyX": // Уменьшение угла поворота сочленения2
      g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
      break;
    case "KeyC": // Увеличение угла поворота сочленения3
      if (g_joint3Angle < 60) {
        g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
      }
      break;
    case "KeyV": // Уменьшение угла поворота сочленения3
      if (g_joint3Angle > -60) {
        g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
      }
      break;
    default:
      return;
  }

  draw({
    gl,
    n,
    a_Position,
    viewProjMatrix,
    mvpMatrix,
    u_MvpMatrix,
    u_NormalMatrix,
  });
}

let g_baseBuffer: WebGLBuffer | null = null; // Буферный объект для платформы
let g_arm1Buffer: WebGLBuffer | null = null; // Буферный объект для плеча
let g_arm2Buffer: WebGLBuffer | null = null; // Буферный объект для предплечья
let g_palmBuffer: WebGLBuffer | null = null; // Буферный объект для кисти
let g_fingerBuffer: WebGLBuffer | null = null; // Буферный объект для пальца

function initVertexBuffers({
  gl,
  program,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
}) {
  const dimension = 3;
  // Координаты вершин (для всех сегментов)
  // prettier-ignore
  const vertices_base = new Float32Array([ // Base(10x2x10)
    5.0, 2.0, 5.0, -5.0, 2.0, 5.0, -5.0, 0.0, 5.0, 5.0, 0.0, 5.0, // v0-v1-v2-v3 front
    5.0, 2.0, 5.0, 5.0, 0.0, 5.0, 5.0, 0.0, -5.0, 5.0, 2.0, -5.0, // v0-v3-v4-v5 right
    5.0, 2.0, 5.0, 5.0, 2.0, -5.0, -5.0, 2.0, -5.0, -5.0, 2.0, 5.0, // v0-v5-v6-v1 up
    -5.0, 2.0, 5.0, -5.0, 2.0, -5.0, -5.0, 0.0, -5.0, -5.0, 0.0, 5.0, // v1-v6-v7-v2 left
    -5.0, 0.0, -5.0, 5.0, 0.0, -5.0, 5.0, 0.0, 5.0, -5.0, 0.0, 5.0, // v7-v4-v3-v2 down
    5.0, 0.0, -5.0, -5.0, 0.0, -5.0, -5.0, 2.0, -5.0, 5.0, 2.0, -5.0  // v4-v7-v6-v5 back
  ]);
  // Плечо
  // prettier-ignore
  const vertices_arm1 = new Float32Array([  // Arm1(3x10x3)
    1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5, 0.0, 1.5, 1.5, 0.0, 1.5, // v0-v1-v2-v3 front
    1.5, 10.0, 1.5, 1.5, 0.0, 1.5, 1.5, 0.0, -1.5, 1.5, 10.0, -1.5, // v0-v3-v4-v5 right
    1.5, 10.0, 1.5, 1.5, 10.0, -1.5, -1.5, 10.0, -1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
    -1.5, 10.0, 1.5, -1.5, 10.0, -1.5, -1.5, 0.0, -1.5, -1.5, 0.0, 1.5, // v1-v6-v7-v2 left
    -1.5, 0.0, -1.5, 1.5, 0.0, -1.5, 1.5, 0.0, 1.5, -1.5, 0.0, 1.5, // v7-v4-v3-v2 down
    1.5, 0.0, -1.5, -1.5, 0.0, -1.5, -1.5, 10.0, -1.5, 1.5, 10.0, -1.5  // v4-v7-v6-v5 back
  ]);
  // Предплечье
  // prettier-ignore
  const vertices_arm2 = new Float32Array([  // Arm2(4x10x4)
    2.0, 10.0, 2.0, -2.0, 10.0, 2.0, -2.0, 0.0, 2.0, 2.0, 0.0, 2.0, // v0-v1-v2-v3 front
    2.0, 10.0, 2.0, 2.0, 0.0, 2.0, 2.0, 0.0, -2.0, 2.0, 10.0, -2.0, // v0-v3-v4-v5 right
    2.0, 10.0, 2.0, 2.0, 10.0, -2.0, -2.0, 10.0, -2.0, -2.0, 10.0, 2.0, // v0-v5-v6-v1 up
    -2.0, 10.0, 2.0, -2.0, 10.0, -2.0, -2.0, 0.0, -2.0, -2.0, 0.0, 2.0, // v1-v6-v7-v2 left
    -2.0, 0.0, -2.0, 2.0, 0.0, -2.0, 2.0, 0.0, 2.0, -2.0, 0.0, 2.0, // v7-v4-v3-v2 down
    2.0, 0.0, -2.0, -2.0, 0.0, -2.0, -2.0, 10.0, -2.0, 2.0, 10.0, -2.0  // v4-v7-v6-v5 back
  ]);
  // Кисть
  // prettier-ignore
  const vertices_palm = new Float32Array([  // Palm(2x2x6)
    1.0, 2.0, 3.0, -1.0, 2.0, 3.0, -1.0, 0.0, 3.0, 1.0, 0.0, 3.0, // v0-v1-v2-v3 front
    1.0, 2.0, 3.0, 1.0, 0.0, 3.0, 1.0, 0.0, -3.0, 1.0, 2.0, -3.0, // v0-v3-v4-v5 right
    1.0, 2.0, 3.0, 1.0, 2.0, -3.0, -1.0, 2.0, -3.0, -1.0, 2.0, 3.0, // v0-v5-v6-v1 up
    -1.0, 2.0, 3.0, -1.0, 2.0, -3.0, -1.0, 0.0, -3.0, -1.0, 0.0, 3.0, // v1-v6-v7-v2 left
    -1.0, 0.0, -3.0, 1.0, 0.0, -3.0, 1.0, 0.0, 3.0, -1.0, 0.0, 3.0, // v7-v4-v3-v2 down
    1.0, 0.0, -3.0, -1.0, 0.0, -3.0, -1.0, 2.0, -3.0, 1.0, 2.0, -3.0  // v4-v7-v6-v5 back
  ]);
  // Палец
  // prettier-ignore
  const vertices_finger = new Float32Array([  // Fingers(1x2x1)
    0.5, 2.0, 0.5, -0.5, 2.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 2.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 2.0, -0.5, // v0-v3-v4-v5 right
    0.5, 2.0, 0.5, 0.5, 2.0, -0.5, -0.5, 2.0, -0.5, -0.5, 2.0, 0.5, // v0-v5-v6-v1 up
    -0.5, 2.0, 0.5, -0.5, 2.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
    -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 2.0, -0.5, 0.5, 2.0, -0.5  // v4-v7-v6-v5 back
  ]);
  // Нормали
  // prettier-ignore
  const normals = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0  // v4-v7-v6-v5 back
  ]);

  // Индексы
  // prettier-ignore
  const indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);

  // Записываем координаты в буферы, но не назначаем переменным атрибутов
  g_baseBuffer = initArrayBufferForLaterUse({ gl, data: vertices_base });
  g_arm1Buffer = initArrayBufferForLaterUse({ gl, data: vertices_arm1 });
  g_arm2Buffer = initArrayBufferForLaterUse({ gl, data: vertices_arm2 });
  g_palmBuffer = initArrayBufferForLaterUse({ gl, data: vertices_palm });
  g_fingerBuffer = initArrayBufferForLaterUse({ gl, data: vertices_finger });

  // Записываем свойство вершины в буфер (нормали)
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

function initArrayBufferForLaterUse({
  gl,
  data,
}: {
  gl: WebGL2RenderingContext;
  data: Float32Array;
}) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  return buffer;
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
  // 4. Сохранить ссылку на буферный объект в переменной a_Attribute
  gl.vertexAttribPointer(a_Attribute, num, gl.FLOAT, false, 0, 0);
  // 5. Разрешить присваивание переменной a_Attribute
  gl.enableVertexAttribArray(a_Attribute);
}

function draw({
  gl,
  n,
  a_Position,
  viewProjMatrix,
  mvpMatrix,
  u_MvpMatrix,
  u_NormalMatrix,
}: {
  gl: WebGL2RenderingContext;
  n: number;
  a_Position: number;
  viewProjMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_NormalMatrix: WebGLUniformLocation | null;
}) {
  // Очистить буферы цвета и глубины
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Нарисовать станину (платформу)
  const baseHeight = 2;
  const platform = mat4.create();
  mat4.fromTranslation(platform, vec3.fromValues(0, -12, 0));
  drawSegment({
    gl,
    n,
    a_Position,
    buffer: g_baseBuffer,
    modelMatrix: platform,
    viewProjMatrix,
    mvpMatrix,
    u_MvpMatrix,
    u_NormalMatrix,
  });

  // Плечо
  const arm1Length = 10; // Длина сегмента 1
  const { modelMatrix: segment1, parentTranslationRotation: parent1 } =
    getMatrix({
      angle: g_arm1Angle,
      axis: vec3.fromValues(0, 1, 0),
      parentHeight: baseHeight,
      parentMatrix: platform,
    });

  drawSegment({
    gl,
    n,
    a_Position,
    buffer: g_arm1Buffer,
    modelMatrix: segment1,
    viewProjMatrix,
    mvpMatrix,
    u_MvpMatrix,
    u_NormalMatrix,
  });

  // Предплечье
  const arm2Length = 10;
  const { modelMatrix: segment2, parentTranslationRotation: patent2 } =
    getMatrix({
      angle: g_joint1Angle,
      axis: vec3.fromValues(0, 0, 1),
      parentHeight: arm1Length,
      parentMatrix: parent1,
    });

  drawSegment({
    gl,
    n,
    a_Position,
    buffer: g_arm2Buffer,
    modelMatrix: segment2,
    viewProjMatrix,
    mvpMatrix,
    u_MvpMatrix,
    u_NormalMatrix,
  });

  // Кисть
  const palmLength = 2;
  const { modelMatrix: palm, parentTranslationRotation: parentPalm } =
    getMatrix({
      angle: g_joint2Angle,
      axis: vec3.fromValues(0, 1, 0),
      parentHeight: arm2Length,
      parentMatrix: patent2,
    });

  drawSegment({
    gl,
    n,
    a_Position,
    buffer: g_palmBuffer,
    modelMatrix: palm,
    viewProjMatrix,
    mvpMatrix,
    u_MvpMatrix,
    u_NormalMatrix,
  });

  // Первый палец
  const { modelMatrix: finger1 } = getMatrix({
    angle: g_joint3Angle,
    axis: vec3.fromValues(1, 0, 0),
    parentHeight: palmLength,
    ownZ: 2,
    parentMatrix: parentPalm,
  });

  drawSegment({
    gl,
    n,
    a_Position,
    buffer: g_fingerBuffer,
    modelMatrix: finger1,
    viewProjMatrix,
    mvpMatrix,
    u_MvpMatrix,
    u_NormalMatrix,
  });

  // Второй палец
  const { modelMatrix: finger2 } = getMatrix({
    angle: -g_joint3Angle,
    axis: vec3.fromValues(1, 0, 0),
    parentHeight: palmLength,
    ownZ: -2,
    parentMatrix: parentPalm,
  });

  drawSegment({
    gl,
    n,
    a_Position,
    buffer: g_fingerBuffer,
    modelMatrix: finger2,
    viewProjMatrix,
    mvpMatrix,
    u_MvpMatrix,
    u_NormalMatrix,
  });
}

const g_normalMatrix = mat4.create();

function drawSegment({
  gl,
  n,
  a_Position,
  buffer,
  modelMatrix,
  viewProjMatrix,
  mvpMatrix,
  u_MvpMatrix,
  u_NormalMatrix,
}: {
  gl: WebGL2RenderingContext;
  n: number;
  a_Position: number;
  buffer: WebGLBuffer | null;
  modelMatrix: mat4;
  viewProjMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
  u_NormalMatrix: WebGLUniformLocation | null;
}) {
  // Вычислить матрицу модели вида проекции
  mat4.multiply(mvpMatrix, viewProjMatrix, modelMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // Присвоить буферный объект переменной-атрибуту
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  // Разрешить присваивание
  gl.enableVertexAttribArray(a_Position);

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);
  // Вычислить и передать матрицу нормалей
  mat4.invert(g_normalMatrix, modelMatrix);
  // Передать матрицу преобразования для нормалей в u_NormalMatrix (необходимо транспонировать)
  gl.uniformMatrix4fv(u_NormalMatrix, true, g_normalMatrix);

  // Нарисовать
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function getMatrix({
  angle,
  axis,
  parentHeight,
  ownZ = 0,
  parentMatrix,
}: {
  angle: number;
  axis: vec3;
  parentHeight: number;
  ownZ?: number;
  parentMatrix: mat4;
}) {
  // Перемещение
  const translation = mat4.create();
  mat4.fromTranslation(translation, vec3.fromValues(0, parentHeight, ownZ));
  // Поворот
  const rotation = mat4.create();
  mat4.fromRotation(rotation, getRadianFromDegree(angle), axis);
  const translationRotation = mat4.create();
  mat4.multiply(translationRotation, translation, rotation);

  // Матрица модели с родителем
  const parentTranslationRotation = mat4.create();
  mat4.multiply(parentTranslationRotation, parentMatrix, translationRotation);

  // Важно!
  // Необходимо перемножить матрицы, для того чтобы начать рисовать сегмент 1 с платформы
  const modelMatrix = mat4.create();
  mat4.multiply(modelMatrix, parentMatrix, translationRotation);

  return {
    parentTranslationRotation,
    modelMatrix,
  };
}
