import { memo, useEffect, useRef } from "react";
import vertexSource from "././shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { mat4, vec3 } from "gl-matrix";
import { getRadianFromDegree } from "../../../common/getRadianFromDegree.ts";
import sky from "../../../resources/sky.jpg";
import { getAnimateAngle } from "../../../common/getAnimateAngle.ts";
import { WebGL } from "../../../classes/WebGL.ts";
import { Program } from "../../../classes/Program.ts";
import { InitArrayBuffer } from "../../../classes/InitArrayBuffer.ts";
import { InitElementArrayBuffer } from "../../../classes/InitElementArrayBuffer.ts";
import {
  indicesCubeData,
  indicesPlaneData,
  OFFSCREEN_HEIGHT,
  OFFSCREEN_WIDTH,
  texCoordsCubeData,
  texCoordsPlaneData,
  verticesCubeData,
  verticesPlaneData,
} from "./data.ts";
import { InitTexture } from "../../../classes/InitTexture.ts";
import { InitFramebufferTexture } from "../../../classes/InitFramebufferTexture.ts";
import { Fps } from "../../../fps/Fps.tsx";

export const FramebufferObject = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const context = new WebGL(ref.current);
    const { gl, canvas } = context;
    const programInstance = new Program({
      gl,
      vertexSource,
      fragmentSource,
    });

    const vertexCube = new InitArrayBuffer({
      gl,
      data: verticesCubeData,
      num: 3,
    });
    const texCoordCube = new InitArrayBuffer({
      gl,
      data: texCoordsCubeData,
      num: 2,
    });
    const indexCube = new InitElementArrayBuffer({
      gl,
      data: indicesCubeData,
    });
    const vertexPlane = new InitArrayBuffer({
      gl,
      data: verticesPlaneData,
      num: 3,
    });
    const texCoordPlane = new InitArrayBuffer({
      gl,
      data: texCoordsPlaneData,
      num: 2,
    });
    const indexPlane = new InitElementArrayBuffer({
      gl,
      data: indicesPlaneData,
    });

    const texture = new InitTexture({
      program: programInstance.program,
      gl,
      src: sky,
      uniformSamplerName: "u_Sampler",
      textureSlot: gl.TEXTURE0,
      numberSlot: 0,
    });

    // Инициализировать объект буфера кадра
    const fbo = new InitFramebufferTexture({
      gl,
      width: OFFSCREEN_WIDTH,
      height: OFFSCREEN_HEIGHT,
      textureSlot: gl.TEXTURE0,
    });

    // Подготовить проекционную матрицу вида для буфера цвета
    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(30),
      canvas.width / canvas.height,
      1,
      100,
    );
    const viewMatrix = mat4.create();
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(0, 0, 7),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );
    const viewProjectionMatrix = mat4.create();
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

    // Подготовить проекционную матрицу вида для FBO
    const projectionMatrixFBO = mat4.create();
    mat4.perspective(
      projectionMatrixFBO,
      getRadianFromDegree(30),
      OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT,
      1,
      100,
    );
    const viewMatrixFBO = mat4.create();
    mat4.lookAt(
      viewMatrixFBO,
      vec3.fromValues(0, 2, 7),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );
    const viewProjectionMatrixFBO = mat4.create();
    mat4.multiply(viewProjectionMatrixFBO, projectionMatrixFBO, viewMatrixFBO);

    let currentAngle = 0;
    let currentLastTime: DOMHighResTimeStamp = 0;
    const tick = (time: DOMHighResTimeStamp = 0) => {
      const { angle, lastTime } = getAnimateAngle({
        angle: currentAngle,
        time,
        lastTime: currentLastTime,
      });

      currentAngle = angle;
      currentLastTime = lastTime;

      // Очистить буферы цвета и глубины
      context.clear();

      draw({
        context,
        gl,
        canvas,
        programInstance,
        vertexCube,
        texCoordCube,
        indexCube,
        vertexPlane,
        texCoordPlane,
        indexPlane,
        texture,
        fbo,
        viewProjectionMatrix,
        viewProjectionMatrixFBO,
        radian: getRadianFromDegree(currentAngle),
      });

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      // Удаление программы
      programInstance.deleteProgram();
      // Удаление буферов
      vertexCube.deleteBuffer();
      texCoordCube.deleteBuffer();
      indexCube.deleteBuffer();
      vertexPlane.deleteBuffer();
      texCoordPlane.deleteBuffer();
      indexPlane.deleteBuffer();
      // Удаление текстуры
      texture.deleteTexture();
      fbo.deleteFramebufferTexture();

      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return (
    <>
      <canvas width={500} height={500} ref={ref} />
      <Fps />
    </>
  );
});

function draw({
  context,
  gl,
  canvas,
  programInstance,
  vertexCube,
  texCoordCube,
  indexCube,
  vertexPlane,
  texCoordPlane,
  indexPlane,
  texture,
  fbo,
  viewProjectionMatrix,
  viewProjectionMatrixFBO,
  radian,
}: {
  context: WebGL;
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  programInstance: Program;
  vertexCube: InitArrayBuffer;
  texCoordCube: InitArrayBuffer;
  indexCube: InitElementArrayBuffer;
  vertexPlane: InitArrayBuffer;
  texCoordPlane: InitArrayBuffer;
  indexPlane: InitElementArrayBuffer;
  texture: InitTexture;
  fbo: InitFramebufferTexture;
  viewProjectionMatrix: mat4;
  viewProjectionMatrixFBO: mat4;
  radian: number;
}) {
  // Изменить место назначения чертежа на FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
  // Установить область просмотра для FBO
  gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

  // Изменить цвет
  gl.clearColor(0.2, 0.2, 0.4, 1.0);
  context.clear();

  drawTexturedCube({
    gl,
    programInstance,
    vertexCube,
    texCoordCube,
    indexCube,
    texture,
    fbo,
    viewProjectionMatrixFBO,
    radian,
  });

  // Переключиться на буфер кадра
  // (после этого все операции рисования с применением gl.drawArrays() и gl.DrawElements() будут выполняться в объекте буфера кадра)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  // Восстановить прежние размеры области рисования
  // gl.viewport - определяет область рисования для функции gl.drawArrays() и gl.DrawElements().
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  context.clear();

  drawTexturedPlane({
    gl,
    programInstance,
    vertexPlane,
    texCoordPlane,
    indexPlane,
    fbo,
    viewProjectionMatrix,
    radian,
  });
}

function drawTexturedCube({
  gl,
  programInstance,
  vertexCube,
  texCoordCube,
  indexCube,
  texture,
  viewProjectionMatrixFBO,
  radian,
}: {
  gl: WebGL2RenderingContext;
  programInstance: Program;
  vertexCube: InitArrayBuffer;
  texCoordCube: InitArrayBuffer;
  indexCube: InitElementArrayBuffer;
  texture: InitTexture;
  fbo: InitFramebufferTexture;
  viewProjectionMatrixFBO: mat4;
  radian: number;
}) {
  const modelMatrix = mat4.create();
  mat4.fromYRotation(modelMatrix, radian);

  // Рассчитать матрицу проекта представления модели и передать ее в u_MvpMatrix
  const mvpMatrix = mat4.create();
  mat4.multiply(mvpMatrix, viewProjectionMatrixFBO, modelMatrix);
  programInstance.uniformMatrix4fv = {
    uniformName: "u_MvpMatrix",
    matrix4: mvpMatrix,
  };

  drawTexturedObject({
    gl,
    programInstance,
    vertex: vertexCube,
    texCoord: texCoordCube,
    index: indexCube,
    texture,
  });
}

function drawTexturedPlane({
  gl,
  programInstance,
  vertexPlane,
  texCoordPlane,
  indexPlane,
  fbo,
  viewProjectionMatrix,
  radian,
}: {
  gl: WebGL2RenderingContext;
  programInstance: Program;
  vertexPlane: InitArrayBuffer;
  texCoordPlane: InitArrayBuffer;
  indexPlane: InitElementArrayBuffer;
  fbo: InitFramebufferTexture;
  viewProjectionMatrix: mat4;
  radian: number;
}) {
  const modelMatrix = mat4.create();
  mat4.fromYRotation(modelMatrix, radian);

  // Рассчитать матрицу проекта представления модели и передать ее в u_MvpMatrix
  const mvpMatrix = mat4.create();
  mat4.multiply(mvpMatrix, viewProjectionMatrix, modelMatrix);
  programInstance.uniformMatrix4fv = {
    uniformName: "u_MvpMatrix",
    matrix4: mvpMatrix,
  };

  drawTexturedObject({
    gl,
    programInstance,
    vertex: vertexPlane,
    texCoord: texCoordPlane,
    index: indexPlane,
    texture: fbo,
  });
}

function drawTexturedObject({
  gl,
  programInstance,
  vertex,
  texCoord,
  index,
  texture,
}: {
  gl: WebGL2RenderingContext;
  programInstance: Program;
  vertex: InitArrayBuffer;
  texCoord: InitArrayBuffer;
  index: InitElementArrayBuffer;
  texture: InitTexture | InitFramebufferTexture;
}) {
  // Присвоить буферные объекты и разрешить присваивание
  // Координаты вершин
  vertex.initAttributeVariable({
    attributeName: "a_Position",
    program: programInstance.program,
  });
  // Текстурные координаты
  texCoord.initAttributeVariable({
    attributeName: "a_TexCoord",
    program: programInstance.program,
  });

  // Привязываем объект текстуры к цели
  texture.initTexture();
  index.initBuffer();
  // Отрисовка
  gl.drawElements(gl.TRIANGLES, index.count, index.type, 0);
}
