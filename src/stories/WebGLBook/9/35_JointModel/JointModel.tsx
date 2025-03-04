import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { mat4, quat, vec3 } from "gl-matrix";
import { getRadianFromDegree } from "../../../../common/getRadianFromDegree.ts";
import { Fps } from "../../../../fps/Fps.tsx";
import { WebGL } from "../../../../classes/WebGL.ts";
import { Program } from "../../../../classes/Program.ts";
import { InitArrayBuffer } from "../../../../classes/InitArrayBuffer.ts";
import { InitElementArrayBuffer } from "../../../../classes/InitElementArrayBuffer.ts";
import { indicesData, normalsData, verticesData } from "./data.ts";

export const JointModel = memo(() => {
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
    const viewMatrix = mat4.create(); // Матрица вида (важно считать отдельно)
    const viewProjMatrix = mat4.create();

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
        n,
        viewProjMatrix,
        context,
        instance,
      });

    draw({
      n,
      viewProjMatrix,
      context,
      instance,
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
let g_arm1Angle = -90.0; // Угол поворота сегмента1 (градусы)
let g_joint1Angle = -45.0; // Угол поворота сочленения1 (градусы)

function keydownHandler({
  ev,
  n,
  viewProjMatrix,
  context,
  instance,
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
    default:
      return;
  }

  draw({
    n,
    viewProjMatrix,
    context,
    instance,
  });
}

function draw({
  n,
  viewProjMatrix,
  context,
  instance,
}: {
  n: number;
  viewProjMatrix: mat4;
  context: WebGL;
  instance: Program;
}) {
  // Очистить буферы цвета и глубины
  context.clear();

  // Сегмент 1
  const arm1Length = 10; // Длина сегмента 1
  const segment1 = mat4.create();

  mat4.fromRotationTranslation(
    segment1,
    // Поворот
    quat.setAxisAngle(
      quat.create(),
      [0, 1, 0],
      getRadianFromDegree(g_arm1Angle),
    ),
    // перемещение
    vec3.fromValues(0, -12, 0),
  );

  drawBox({
    n,
    modelMatrix: segment1,
    viewProjMatrix,
    context,
    instance,
  });

  // Сегмент 2
  const segment2 = mat4.create();
  mat4.fromRotationTranslationScale(
    segment2,
    // Поворот
    quat.setAxisAngle(
      quat.create(),
      [0, 0, 1],
      getRadianFromDegree(g_joint1Angle),
    ),
    // перемещение
    vec3.fromValues(0, arm1Length, 0), // по какой-то причине мы перемещаем на vec3.fromValues(0, arm1Length, 0)
    // сделать чуть тоньше;
    vec3.fromValues(1.3, 1, 1.3),
  );

  // Важно!
  // Необходимо перемножить матрицы, для того чтобы начать рисовать сегмент 2 с места,
  // где закончил рисоваться сегмент 1
  mat4.multiply(segment2, segment1, segment2);

  drawBox({
    n,
    modelMatrix: segment2,
    viewProjMatrix,
    context,
    instance,
  });
}

const normalMatrix = mat4.create();
const mvpMatrix = mat4.create();

function drawBox({
  n,
  modelMatrix,
  viewProjMatrix,
  context,
  instance,
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

  // Вычислить матрицу нормалей
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
