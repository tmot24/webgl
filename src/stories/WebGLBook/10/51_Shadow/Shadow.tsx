import { memo, useEffect, useRef } from "react";
import shadowVertexSource from "./shaders/shadow/shadowVertex.vert?raw";
import shadowFragmentSource from "./shaders/shadow/shadowFragment.frag?raw";
import vertexSource from "./shaders/regular/vertex.vert?raw";
import fragmentSource from "./shaders/regular/fragment.frag?raw";
import { mat4, vec3 } from "gl-matrix";
import { getRadianFromDegree } from "../../../../common/getRadianFromDegree.ts";
import { getAnimateAngle } from "../../../../common/getAnimateAngle.ts";
import { WebGL } from "../../../../classes/WebGL.ts";
import { Program } from "../../../../classes/Program.ts";
import { InitArrayBuffer } from "../../../../classes/InitArrayBuffer.ts";
import { InitElementArrayBuffer } from "../../../../classes/InitElementArrayBuffer.ts";
import {
  colorsPlane,
  colorsTriangle,
  indicesPlane,
  indicesTriangle,
  LIGHT_X,
  LIGHT_Y,
  LIGHT_Z,
  OFFSCREEN_HEIGHT,
  OFFSCREEN_WIDTH,
  verticesPlane,
  verticesTriangle,
} from "./data.ts";
import { Fps } from "../../../../fps/Fps.tsx";
import { InitFramebufferTexture } from "../../../../classes/InitFramebufferTexture.ts";

export const Shadow = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const context = new WebGL(ref.current);
    const { gl, canvas } = context;
    const shadowInstance = new Program({
      gl,
      vertexSource: shadowVertexSource,
      fragmentSource: shadowFragmentSource,
    });

    const instance = new Program({
      gl,
      vertexSource: vertexSource,
      fragmentSource: fragmentSource,
    });

    const vertexTriangle = new InitArrayBuffer({
      gl,
      data: verticesTriangle,
      num: 3,
    });
    const colorTriangle = new InitArrayBuffer({
      gl,
      data: colorsTriangle,
      num: 3,
    });
    const indexTriangle = new InitElementArrayBuffer({
      gl,
      data: indicesTriangle,
    });

    const triangle = {
      vertexTriangle,
      colorTriangle,
      indexTriangle,
    };

    const vertexPlane = new InitArrayBuffer({
      gl,
      data: verticesPlane,
      num: 3,
    });
    const colorPlane = new InitArrayBuffer({
      gl,
      data: colorsPlane,
      num: 3,
    });
    const indexPlane = new InitElementArrayBuffer({
      gl,
      data: indicesPlane,
    });

    const plane = {
      vertexPlane,
      colorPlane,
      indexPlane,
    };

    const fbo = new InitFramebufferTexture({
      gl,
      height: OFFSCREEN_HEIGHT,
      width: OFFSCREEN_WIDTH,
    });
    fbo.initTexture();

    const projectionMatrixFromLight = mat4.create();
    mat4.perspective(
      projectionMatrixFromLight,
      getRadianFromDegree(70),
      OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT,
      1,
      100,
    );
    const viewMatrixFromLight = mat4.create();
    mat4.lookAt(
      viewMatrixFromLight,
      vec3.fromValues(LIGHT_X, LIGHT_Y, LIGHT_Z),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );
    const viewProjectionMatrixFromLight = mat4.create();
    mat4.multiply(
      viewProjectionMatrixFromLight,
      projectionMatrixFromLight,
      viewMatrixFromLight,
    );

    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(45),
      canvas.width / canvas.height,
      1,
      100,
    );
    const viewMatrix = mat4.create();
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(0, 7, 9),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );
    const viewProjectionMatrix = mat4.create();
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

    const u_ShadowMap = gl.getUniformLocation(instance.program, "u_ShadowMap");

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
      const radian = getRadianFromDegree(currentAngle);

      // Переключиться на объект буфера кадра
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
      gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
      // Очистить буферы цвета и глубины
      context.clear();

      // Устанавливаем шейдеры для генерации карты теней
      gl.useProgram(shadowInstance.program);
      // Рисуем треугольник (для создания карты теней)
      const mvpMatrixFromLightTriangle: mat4 = drawTriangle({
        gl,
        instance: shadowInstance,
        triangle,
        radian,
        viewProjectionMatrix: viewProjectionMatrixFromLight,
        isShadow: true,
      });
      // Рисуем плоскость (для создания карты теней)
      const mvpMatrixFromLightPlane = drawPlane({
        gl,
        instance: shadowInstance,
        plane,
        viewProjectionMatrix: viewProjectionMatrixFromLight,
        isShadow: true,
      });

      // Переключиться на буфер цвета
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      // Очистить буфер цвета и глубины
      context.clear();

      // Устанавливаем шейдер для обычного рисования
      gl.useProgram(instance.program);
      // Передайте 0, так как gl.TEXTURE0 включен
      gl.uniform1i(u_ShadowMap, 0);
      // Нарисуем треугольник и плоскость (для обычного рисования)
      instance.uniformMatrix4fv = {
        uniformName: "u_MvpMatrixFromLight",
        matrix4: mvpMatrixFromLightTriangle,
      };

      drawTriangle({
        gl,
        instance,
        triangle,
        radian,
        viewProjectionMatrix,
      });

      instance.uniformMatrix4fv = {
        uniformName: "u_MvpMatrixFromLight",
        matrix4: mvpMatrixFromLightPlane,
      };

      drawPlane({
        gl,
        instance,
        plane,
        viewProjectionMatrix,
      });

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      // Удаление программы
      shadowInstance.delete();
      instance.delete();
      // Удаление буферов
      vertexTriangle.delete();
      colorTriangle.delete();
      indexTriangle.delete();
      vertexPlane.delete();
      colorPlane.delete();
      indexPlane.delete();
      // Удаление текстуры
      fbo.delete();

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

function drawTriangle({
  gl,
  instance,
  triangle,
  radian,
  viewProjectionMatrix,
  isShadow = false,
}: {
  gl: WebGL2RenderingContext;
  instance: Program;
  triangle: {
    vertexTriangle: InitArrayBuffer;
    colorTriangle: InitArrayBuffer;
    indexTriangle: InitElementArrayBuffer;
  };
  radian: number;
  viewProjectionMatrix: mat4;
  isShadow?: boolean;
}) {
  const modelMatrix = mat4.create();
  mat4.fromYRotation(modelMatrix, radian);
  const mvpMatrix = mat4.create();
  mat4.multiply(mvpMatrix, viewProjectionMatrix, modelMatrix);

  draw({
    gl,
    instance,
    figure: {
      vertex: triangle.vertexTriangle,
      color: triangle.colorTriangle,
      index: triangle.indexTriangle,
    },
    mvpMatrix,
    isShadow,
  });

  return mvpMatrix;
}

function drawPlane({
  gl,
  instance,
  plane,
  viewProjectionMatrix,
  isShadow = false,
}: {
  gl: WebGL2RenderingContext;
  instance: Program;
  plane: {
    vertexPlane: InitArrayBuffer;
    colorPlane: InitArrayBuffer;
    indexPlane: InitElementArrayBuffer;
  };
  viewProjectionMatrix: mat4;
  isShadow?: boolean;
}) {
  const modelMatrix = mat4.create();
  mat4.fromRotation(
    modelMatrix,
    getRadianFromDegree(-45),
    vec3.fromValues(0, 1, 1),
  );

  const mvpMatrix = mat4.create();
  mat4.multiply(mvpMatrix, viewProjectionMatrix, modelMatrix);

  draw({
    gl,
    instance,
    figure: {
      vertex: plane.vertexPlane,
      color: plane.colorPlane,
      index: plane.indexPlane,
    },
    mvpMatrix,
    isShadow,
  });

  return mvpMatrix;
}

function draw({
  gl,
  instance,
  figure: { vertex, color, index },
  mvpMatrix,
  isShadow = false,
}: {
  gl: WebGL2RenderingContext;
  instance: Program;
  figure: {
    vertex: InitArrayBuffer;
    color: InitArrayBuffer;
    index: InitElementArrayBuffer;
  };
  mvpMatrix: mat4;
  isShadow?: boolean;
}) {
  vertex.initAttributeVariable({
    attributeName: "a_Position",
    program: instance.program,
  });
  if (!isShadow) {
    color.initAttributeVariable({
      attributeName: "a_Color",
      program: instance.program,
    });
  }
  index.initBuffer();

  instance.uniformMatrix4fv = {
    uniformName: "u_MvpMatrix",
    matrix4: mvpMatrix,
  };

  gl.drawElements(gl.TRIANGLES, index.count, index.type, 0);
}
