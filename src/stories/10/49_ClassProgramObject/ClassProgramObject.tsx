import { memo, useEffect, useRef } from "react";
import colorVertexSource from "././shaders/color/colorVertex.vert?raw";
import colorFragmentSource from "./shaders/color/colorFragment.frag?raw";
import textureVertexSource from "./shaders/texture/textureVertex.vert?raw";
import textureFragmentSource from "./shaders/texture/textureFragment.frag?raw";
import { mat4, quat, vec3 } from "gl-matrix";
import { getRadianFromDegree } from "../../../common/getRadianFromDegree.ts";
import orange from "../../../resources/orange.jpg";
import { getAnimateAngle } from "../../../common/getAnimateAngle.ts";
import { WebGL } from "../../../classes/WebGL.ts";
import { Program } from "../../../classes/Program.ts";
import { InitArrayBuffer } from "../../../classes/InitArrayBuffer.ts";
import { InitElementArrayBuffer } from "../../../classes/InitElementArrayBuffer.ts";
import {
  verticesData,
  normalsData,
  texCoordsData,
  indicesData,
} from "./data.ts";
import { InitTexture } from "../../../classes/InitTexture.ts";

export const ClassProgramObject = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const context = new WebGL(ref.current);
    const { gl, canvas } = context;
    const colorCube = new Program({
      gl,
      vertexSource: colorVertexSource,
      fragmentSource: colorFragmentSource,
    });

    const textureCube = new Program({
      gl,
      vertexSource: textureVertexSource,
      fragmentSource: textureFragmentSource,
    });

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
    const texCoord = new InitArrayBuffer({
      gl,
      data: texCoordsData,
      num: 2,
    });
    const index = new InitElementArrayBuffer({
      gl,
      data: indicesData,
    });

    const texture = new InitTexture({
      program: textureCube.program,
      gl,
      src: orange,
      uniformSamplerName: "u_Sampler",
      textureSlot: gl.TEXTURE0,
      numberSlot: 0,
    });

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
      vec3.fromValues(0, 0, 15),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );

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

      // Нарисуйте куб одним цветом
      drawColorCube({
        gl,
        colorCube,
        projectionMatrix,
        viewMatrix,
        currentAngle,
        vertex,
        index,
        normal,
      });
      // Рисуем куб с текстурой
      drawTexCube({
        gl,
        textureCube,
        projectionMatrix,
        viewMatrix,
        currentAngle,
        texture,
        index,
        normal,
        vertex,
        texCoord,
      });

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      // Удаление программы
      colorCube.deleteProgram();
      textureCube.deleteProgram();
      // Удаление буферов
      vertex.deleteBuffer();
      normal.deleteBuffer();
      texCoord.deleteBuffer();
      index.deleteBuffer();
      // Удаление текстуры
      texture.deleteTexture();

      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});

function drawColorCube({
  gl,
  colorCube,
  projectionMatrix,
  viewMatrix,
  currentAngle,
  vertex,
  index,
  normal,
}: {
  gl: WebGL2RenderingContext;
  colorCube: Program;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  currentAngle: number;
  vertex: InitArrayBuffer;
  normal: InitArrayBuffer;
  index: InitElementArrayBuffer;
}) {
  // Задействовать объект программы
  gl.useProgram(colorCube.program);

  // Присвоить буферные объекты и разрешить присваивание
  // Координаты вершин
  vertex.initAttributeVariable({
    attributeName: "a_Position",
    program: colorCube.program,
  });
  // Нормаль
  normal.initAttributeVariable({
    attributeName: "a_Normal",
    program: colorCube.program,
  });
  // Индексы привязки
  index.initBuffer();

  drawCube({
    gl,
    programObject: colorCube,
    offset: -2,
    projectionMatrix,
    viewMatrix,
    currentAngle,
    index,
  });
}

function drawTexCube({
  gl,
  textureCube,
  projectionMatrix,
  viewMatrix,
  currentAngle,
  vertex,
  index,
  normal,
  texture,
  texCoord,
}: {
  gl: WebGL2RenderingContext;
  textureCube: Program;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  currentAngle: number;
  vertex: InitArrayBuffer;
  normal: InitArrayBuffer;
  texCoord: InitArrayBuffer;
  index: InitElementArrayBuffer;
  texture: InitTexture;
}) {
  // Задействовать объект программы
  gl.useProgram(textureCube.program);

  // Присвоить буферные объекты и разрешить присваивание
  // Координаты вершины
  vertex.initAttributeVariable({
    attributeName: "a_Position",
    program: textureCube.program,
  });
  // Нормальный
  normal.initAttributeVariable({
    attributeName: "a_Normal",
    program: textureCube.program,
  });
  // Текстурные координаты
  texCoord.initAttributeVariable({
    attributeName: "a_TexCoord",
    program: textureCube.program,
  });
  // Связать индексы
  index.initBuffer();
  // Привязать объект текстуры к текстурному блоку 0
  texture.initTexture();

  // Draw
  drawCube({
    gl,
    programObject: textureCube,
    projectionMatrix,
    viewMatrix,
    offset: 2,
    currentAngle,
    index,
  });
}

function drawCube({
  gl,
  programObject,
  projectionMatrix,
  viewMatrix,
  currentAngle,
  offset,
  index,
}: {
  gl: WebGL2RenderingContext;
  programObject: Program;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  currentAngle: number;
  offset: number;
  index: InitElementArrayBuffer;
}) {
  const modelMatrix = mat4.create();
  // Рассчитать матрицу модели
  mat4.fromRotationTranslation(
    modelMatrix,
    // Поворот
    quat.setAxisAngle(
      quat.create(),
      [0, 1, 0],
      getRadianFromDegree(currentAngle),
    ),
    // перемещение
    vec3.fromValues(offset, 0, 0),
  );

  const normalMatrix = mat4.create();
  // Вычислить матрицу преобразования для нормалей;
  mat4.invert(normalMatrix, modelMatrix);
  // Передать матрицу преобразования для нормалей в u_NormalMatrix (необходимо транспонировать)
  programObject.uniformMatrix4fv = {
    uniformName: "u_NormalMatrix",
    transpose: true,
    matrix4: normalMatrix,
  };

  // Рассчитать матрицу проекции вида модели и передать ее в u_MvpMatrix
  const mvpMatrix = mat4.create();
  mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
  mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
  programObject.uniformMatrix4fv = {
    uniformName: "u_MvpMatrix",
    matrix4: mvpMatrix,
  };

  gl.drawElements(gl.TRIANGLES, index.count, index.type, 0);
}
