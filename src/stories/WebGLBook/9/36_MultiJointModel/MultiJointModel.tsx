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
import { indicesData, normalsData, verticesData } from "./data.ts";

export const MultiJointModel = memo(() => {
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

    const vertex = new InitArrayBuffer({
      gl,
      data: verticesData,
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

    vertex.initAttributeVariable({
      attributeName: "a_Position",
      program,
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
    // Рассчитать матрицу вида
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
        n,
        viewProjMatrix,
      });

    draw({
      context,
      instance,
      n,
      viewProjMatrix,
    });

    return () => {
      // Удаление программы
      instance.delete();
      // Удаление буферов
      vertex.delete();
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
  context,
  instance,
  n,
  viewProjMatrix,
}: {
  ev: KeyboardEvent;
  n: number;
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
    n,
    viewProjMatrix,
  });
}

function draw({
  context,
  instance,
  n,
  viewProjMatrix,
}: {
  n: number;
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
  const platformScale = mat4.create();
  mat4.scale(platformScale, platform, vec3.fromValues(10, baseHeight, 10));
  drawBox({
    context,
    instance,
    n,
    modelMatrix: platformScale,
    viewProjMatrix,
  });

  // Плечо
  const arm1Length = 10; // Длина сегмента 1
  const { modelMatrix: segment1, parentTranslationRotation: parent1 } =
    getMatrix({
      angle: g_arm1Angle,
      axis: vec3.fromValues(0, 1, 0),
      parentHeight: baseHeight,
      width: 3,
      height: arm1Length,
      depth: 3,
      parentMatrix: platform,
    });

  drawBox({
    context,
    instance,
    n,
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
      width: 4,
      height: arm2Length,
      depth: 4,
      parentMatrix: parent1,
    });

  drawBox({
    context,
    instance,
    n,
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
      width: 2,
      height: palmLength,
      depth: 6,
      parentMatrix: patent2,
    });

  drawBox({
    context,
    instance,
    n,
    modelMatrix: palm,
    viewProjMatrix,
  });

  // Первый палец
  const { modelMatrix: finger1 } = getMatrix({
    angle: g_joint3Angle,
    axis: vec3.fromValues(1, 0, 0),
    parentHeight: palmLength,
    ownZ: 2,
    width: 1,
    height: palmLength,
    depth: 1,
    parentMatrix: parentPalm,
  });

  drawBox({
    context,
    instance,
    n,
    modelMatrix: finger1,
    viewProjMatrix,
  });

  // Второй палец
  const { modelMatrix: finger2 } = getMatrix({
    angle: -g_joint3Angle,
    axis: vec3.fromValues(1, 0, 0),
    parentHeight: palmLength,
    ownZ: -2,
    width: 1,
    height: palmLength,
    depth: 1,
    parentMatrix: parentPalm,
  });

  drawBox({
    context,
    instance,
    n,
    modelMatrix: finger2,
    viewProjMatrix,
  });
}

const normalMatrix = mat4.create();
const mvpMatrix = mat4.create();

function drawBox({
  context,
  instance,
  n,
  modelMatrix,
  viewProjMatrix,
}: {
  n: number;
  modelMatrix: mat4;
  viewProjMatrix: mat4;
  context: WebGL;
  instance: Program;
}) {
  // Вычислить матрицу модели вида проекции
  mat4.multiply(mvpMatrix, viewProjMatrix, modelMatrix);

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
  width,
  height,
  depth,
  parentMatrix,
}: {
  angle: number;
  axis: vec3;
  parentHeight: number;
  ownZ?: number;
  width: number;
  height: number;
  depth: number;
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
  // Увеличение
  const scale = mat4.create();
  mat4.scale(scale, scale, vec3.fromValues(width, height, depth));
  const translationRotationScale = mat4.create();
  mat4.multiply(translationRotationScale, translationRotation, scale);

  // Матрица модели с родителем
  const parentTranslationRotation = mat4.create();
  mat4.multiply(parentTranslationRotation, parentMatrix, translationRotation);

  // Важно!
  // Необходимо перемножить матрицы, для того чтобы начать рисовать сегмент 1 с платформы
  const modelMatrix = mat4.create();
  mat4.multiply(modelMatrix, parentMatrix, translationRotationScale);

  return {
    parentTranslationRotation,
    modelMatrix,
  };
}
