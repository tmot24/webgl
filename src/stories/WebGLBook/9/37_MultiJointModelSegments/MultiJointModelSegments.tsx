import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { mat4, vec3 } from "gl-matrix";
import { getRadianFromDegree } from "../../../../common/getRadianFromDegree.ts";
import { Fps } from "../../../../fps/Fps.tsx";
import { WebGL } from "../../../../classes/WebGL.ts";
import { Program } from "../../../../classes/Program.ts";
import { InitArrayBuffer } from "../../../../classes/InitArrayBuffer.ts";
import { InitElementArrayBuffer } from "../../../../classes/InitElementArrayBuffer.ts";
import {
  indicesData,
  normalsData,
  verticesArm1Data,
  verticesArm2Data,
  verticesBaseData,
  verticesFingerData,
  verticesPalmData,
} from "./data.ts";

export const MultiJointModelSegments = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = new WebGL(ref.current);

    const { gl, canvas } = context;
    const instance = new Program({
      gl,
      vertexSource: vertexSource,
      fragmentSource: fragmentSource,
    });

    if (!instance.program) return;

    const program = instance.program;
    // Буферный объект для платформы
    const vertexBase = new InitArrayBuffer({
      gl,
      data: verticesBaseData,
      num: 3,
    });
    // Буферный объект для плеча
    const vertexArm1Data = new InitArrayBuffer({
      gl,
      data: verticesArm1Data,
      num: 3,
    });
    // Буферный объект для предплечья
    const vertexArm2Data = new InitArrayBuffer({
      gl,
      data: verticesArm2Data,
      num: 3,
    });
    // Буферный объект для кисти
    const vertexPalmData = new InitArrayBuffer({
      gl,
      data: verticesPalmData,
      num: 3,
    });
    // Буферный объект для пальца
    const vertexFingerData = new InitArrayBuffer({
      gl,
      data: verticesFingerData,
      num: 3,
    });
    const normal = new InitArrayBuffer({
      gl,
      data: normalsData,
      num: 3,
    });
    const index = new InitElementArrayBuffer({
      gl,
      data: indicesData,
    });

    normal.initAttributeVariable({
      attributeName: "a_Normal",
      program,
    });
    index.initBuffer();

    const n = index.count;

    const projectionMatrix = mat4.create(); // Матрица проекции (важно считать отдельно)
    // Рассчитать матрицу проекции
    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(50),
      canvas.width / canvas.height,
      1,
      100,
    );
    const viewMatrix = mat4.create(); // Матрица вида (важно считать отдельно)
    // Рассчитать матрицу проекции
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(20, 10, 30),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );
    const viewProjMatrix = mat4.create();
    // Рассчитать матрицу проекции вида
    mat4.multiply(viewProjMatrix, projectionMatrix, viewMatrix);

    document.onkeydown = (ev) =>
      keydownHandler({
        ev,
        context,
        instance,
        vertexBase,
        vertexArm1Data,
        vertexArm2Data,
        vertexPalmData,
        vertexFingerData,
        n,
        viewProjMatrix,
      });

    draw({
      context,
      instance,
      vertexBase,
      vertexArm1Data,
      vertexArm2Data,
      vertexPalmData,
      vertexFingerData,
      n,
      viewProjMatrix,
    });

    return () => {
      // Удаление программы
      instance.delete();
      // Удаление буферов
      vertexBase.delete();
      vertexArm1Data.delete();
      vertexArm2Data.delete();
      vertexPalmData.delete();
      vertexFingerData.delete();
      normal.delete();
      index.delete();
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
  n,
  viewProjMatrix,
  context,
  instance,
  vertexBase,
  vertexArm1Data,
  vertexArm2Data,
  vertexPalmData,
  vertexFingerData,
}: {
  ev: KeyboardEvent;
  n: number;
  vertexBase: InitArrayBuffer;
  vertexArm1Data: InitArrayBuffer;
  vertexArm2Data: InitArrayBuffer;
  vertexPalmData: InitArrayBuffer;
  vertexFingerData: InitArrayBuffer;
  viewProjMatrix: mat4;
  context: WebGL;
  instance: Program;
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
    context,
    instance,
    vertexBase,
    vertexArm1Data,
    vertexArm2Data,
    vertexPalmData,
    vertexFingerData,
    n,
    viewProjMatrix,
  });
}

function draw({
  context,
  instance,
  vertexBase,
  vertexArm1Data,
  vertexArm2Data,
  vertexPalmData,
  vertexFingerData,
  n,
  viewProjMatrix,
}: {
  n: number;
  vertexBase: InitArrayBuffer;
  vertexArm1Data: InitArrayBuffer;
  vertexArm2Data: InitArrayBuffer;
  vertexPalmData: InitArrayBuffer;
  vertexFingerData: InitArrayBuffer;
  viewProjMatrix: mat4;
  context: WebGL;
  instance: Program;
}) {
  // Очистить буферы цвета и глубины
  context.clear();

  // Нарисовать станину (платформу)
  const baseHeight = 2;
  const platform = mat4.create();
  mat4.fromTranslation(platform, vec3.fromValues(0, -12, 0));
  drawSegment({
    context,
    instance,
    n,
    buffer: vertexBase,
    modelMatrix: platform,
    viewProjMatrix,
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
    context,
    instance,
    n,
    buffer: vertexArm1Data,
    modelMatrix: segment1,
    viewProjMatrix,
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
    context,
    instance,
    n,
    buffer: vertexArm2Data,
    modelMatrix: segment2,
    viewProjMatrix,
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
    context,
    instance,
    n,
    buffer: vertexPalmData,
    modelMatrix: palm,
    viewProjMatrix,
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
    context,
    instance,
    n,
    buffer: vertexFingerData,
    modelMatrix: finger1,
    viewProjMatrix,
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
    context,
    instance,
    n,
    buffer: vertexFingerData,
    modelMatrix: finger2,
    viewProjMatrix,
  });
}

const normalMatrix = mat4.create();
const mvpMatrix = mat4.create();

function drawSegment({
  instance,
  context,
  n,
  buffer,
  modelMatrix,
  viewProjMatrix,
}: {
  n: number;
  buffer: InitArrayBuffer;
  modelMatrix: mat4;
  viewProjMatrix: mat4;
  context: WebGL;
  instance: Program;
}) {
  // Вычислить матрицу модели вида проекции
  mat4.multiply(mvpMatrix, viewProjMatrix, modelMatrix);

  buffer.initAttributeVariable({
    attributeName: "a_Position",
    program: instance.program,
  });

  instance.uniformMatrix4fv({
    uniformName: "u_MvpMatrix",
    matrix4: mvpMatrix,
  });

  // Вычислить и передать матрицу нормалей
  mat4.invert(normalMatrix, modelMatrix);
  // Передать матрицу преобразования для нормалей в u_NormalMatrix (необходимо транспонировать)
  instance.uniformMatrix4fv({
    uniformName: "u_NormalMatrix",
    transpose: true,
    matrix4: normalMatrix,
  });

  // Нарисовать
  context.draw({ count: n });
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
