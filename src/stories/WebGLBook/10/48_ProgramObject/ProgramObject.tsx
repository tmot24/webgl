import { memo, useEffect, useRef } from "react";
import colorVertexSource from "./shaders/color/colorVertex.vert?raw";
import colorFragmentSource from "./shaders/color/colorFragment.frag?raw";
import textureVertexSource from "./shaders/texture/textureVertex.vert?raw";
import textureFragmentSource from "./shaders/texture/textureFragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { mat4, quat, vec3 } from "gl-matrix";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";
import { getRadianFromDegree } from "../../../../common/getRadianFromDegree.ts";
import orange from "../../../../resources/orange.jpg";
import { initArrayBufferForLaterUse } from "../../../../common/initArrayBufferForLaterUse.ts";
import { getAnimateAngle } from "../../../../common/getAnimateAngle.ts";
import { Fps } from "../../../../fps/Fps.tsx";

export const ProgramObject = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { gl, canvas } = context;
    setBackgroundColor({ gl, depthTest: true });

    const colorShaders = createShaders({
      gl,
      vertexSource: colorVertexSource,
      fragmentSource: colorFragmentSource,
    });
    if (!colorShaders) return;
    const {
      vertexShader: colorVertexShader,
      fragmentShader: colorFragmentShader,
    } = colorShaders;

    const colorProgram = createProgram({
      gl,
      vertexShader: colorVertexShader,
      fragmentShader: colorFragmentShader,
    });
    if (!colorProgram) return;

    const textureShaders = createShaders({
      gl,
      vertexSource: textureVertexSource,
      fragmentSource: textureFragmentSource,
    });
    if (!textureShaders) return;
    const {
      vertexShader: textureVertexShader,
      fragmentShader: textureFragmentShader,
    } = textureShaders;

    const textureProgram = createProgram({
      gl,
      vertexShader: textureVertexShader,
      fragmentShader: textureFragmentShader,
    });
    if (!textureProgram) return;

    // Получить ссылки на переменные для одноцветного куба
    const colorLinks = {
      a_Position: gl.getAttribLocation(colorProgram, "a_Position"),
      a_Normal: gl.getAttribLocation(colorProgram, "a_Normal"),
      u_MvpMatrix: gl.getUniformLocation(colorProgram, "u_MvpMatrix"),
      u_NormalMatrix: gl.getUniformLocation(colorProgram, "u_NormalMatrix"),
    };

    // Получить ссылки на переменные для куба с текстурой
    const textureLinks = {
      a_Position: gl.getAttribLocation(textureProgram, "a_Position"),
      a_Normal: gl.getAttribLocation(textureProgram, "a_Normal"),
      a_TexCoord: gl.getAttribLocation(textureProgram, "a_TexCoord"),
      u_MvpMatrix: gl.getUniformLocation(textureProgram, "u_MvpMatrix"),
      u_NormalMatrix: gl.getUniformLocation(textureProgram, "u_NormalMatrix"),
      u_Sampler: gl.getUniformLocation(textureProgram, "u_Sampler"),
    };

    const { n: colorN, buffers } = initVertexBuffers({ gl });

    const texture = initTextures({
      gl,
      program: textureProgram,
      u_Sampler: textureLinks.u_Sampler,
    });

    const mvpMatrix = mat4.create();
    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    const normalMatrix = mat4.create();

    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(30),
      canvas.width / canvas.height,
      1,
      100,
    );
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
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Нарисуйте куб одним цветом
      drawColorCube({
        gl,
        program: colorProgram,
        projectionMatrix,
        viewMatrix,
        mvpMatrix,
        normalMatrix,
        currentAngle,
        buffers,
        colorLinks,
        modelMatrix,
        numIndices: colorN,
      });
      // Рисуем куб с текстурой
      drawTexCube({
        gl,
        program: textureProgram,
        projectionMatrix,
        viewMatrix,
        mvpMatrix,
        normalMatrix,
        currentAngle,
        buffers,
        textureLinks,
        modelMatrix,
        numIndices: colorN,
        texture,
      });

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      // Удаление программы
      gl.deleteProgram(textureProgram);
      gl.deleteProgram(colorProgram);
      // Удаление вершинного шейдера
      gl.deleteShader(colorVertexShader);
      gl.deleteShader(textureVertexShader);
      // Удаление фрагментного шейдера
      gl.deleteShader(colorFragmentShader);
      gl.deleteShader(textureFragmentShader);
      // Удаление буферов
      buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      // Удаление текстуры
      gl.deleteTexture(texture);

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

function initVertexBuffers({ gl }: { gl: WebGL2RenderingContext }) {
  // prettier-ignore
  const vertices = new Float32Array([   // Vertex coordinates
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const normals = new Float32Array([   // Normal
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,     // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,     // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,     // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,     // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,     // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0      // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const texCoords = new Float32Array([   // Texture coordinates
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,    // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const indices = new Uint8Array([        // Indices of the vertices
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);

  const vertexBuffer = initArrayBufferForLaterUse({
    gl,
    data: vertices,
  });
  const normalBuffer = initArrayBufferForLaterUse({
    gl,
    data: normals,
  });
  const texCoordBuffer = initArrayBufferForLaterUse({
    gl,
    data: texCoords,
  });

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // Отвязать объект буфера
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return {
    n: indices.length,
    buffers: [vertexBuffer, normalBuffer, indexBuffer, texCoordBuffer],
  };
}

function drawColorCube({
  gl,
  program,
  projectionMatrix,
  viewMatrix,
  mvpMatrix,
  normalMatrix,
  currentAngle,
  buffers,
  colorLinks,
  modelMatrix,
  numIndices,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  normalMatrix: mat4;
  currentAngle: number;
  buffers: (WebGLBuffer | null)[];
  modelMatrix: mat4;
  numIndices: number;
  colorLinks: {
    a_Position: number;
    a_Normal: number;
    u_MvpMatrix: WebGLUniformLocation | null;
    u_NormalMatrix: WebGLUniformLocation | null;
  };
}) {
  // Задействовать объект программы
  gl.useProgram(program);

  const { a_Position, a_Normal, u_MvpMatrix, u_NormalMatrix } = colorLinks;
  const [vertexBuffer, normalBuffer, indexBuffer] = buffers;

  // Присвоить буферные объекты и разрешить присваивание
  // Координаты вершин
  initAttributeVariable({
    gl,
    a_Attribute: a_Position,
    data: vertexBuffer,
    num: 3,
    type: gl.FLOAT,
  });
  // Нормаль
  initAttributeVariable({
    gl,
    a_Attribute: a_Normal,
    data: normalBuffer,
    num: 3,
    type: gl.FLOAT,
  });
  // Индексы привязки
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  drawCube({
    gl,
    offset: -2,
    modelMatrix,
    projectionMatrix,
    viewMatrix,
    mvpMatrix,
    normalMatrix,
    currentAngle,
    numIndices,
    u_NormalMatrix,
    u_MvpMatrix,
  });
}

function initTextures({
  gl,
  program,
  u_Sampler,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  u_Sampler: WebGLUniformLocation | null;
}) {
  const texture = gl.createTexture();
  const image = new Image();
  image.src = orange;
  image.onload = () => {
    loadTexture({
      gl,
      texture,
      image,
      program,
      u_Sampler,
    });
  };

  return texture;
}

function loadTexture({
  gl,
  texture,
  image,
  program,
  u_Sampler,
}: {
  gl: WebGL2RenderingContext;
  texture: WebGLTexture | null;
  u_Sampler: WebGLUniformLocation | null;
  image: HTMLImageElement;
  program: WebGLProgram;
}) {
  // Повернуть ось Y изображения
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Определить параметры текстуры
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Определить изображение текстуры
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Передать текстурный блок 0 в u Sampler
  gl.useProgram(program);
  // Определить указатель на текстурный слот 0, потому что активировали текстуру gl.TEXTURE0
  gl.uniform1i(u_Sampler, 0);
  // Отвязать текстуру
  gl.bindTexture(gl.TEXTURE_2D, null);
}

// Присвоить буферные объекты и разрешить присваивание
function initAttributeVariable({
  gl,
  a_Attribute,
  data,
  num,
  type,
}: {
  gl: WebGL2RenderingContext;
  a_Attribute: number;
  data: WebGLBuffer | null;
  num: number;
  type: number;
}) {
  gl.bindBuffer(gl.ARRAY_BUFFER, data);
  gl.vertexAttribPointer(a_Attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_Attribute);
}

function drawTexCube({
  gl,
  program,
  projectionMatrix,
  viewMatrix,
  mvpMatrix,
  normalMatrix,
  currentAngle,
  buffers,
  modelMatrix,
  numIndices,
  textureLinks,
  texture,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  normalMatrix: mat4;
  currentAngle: number;
  buffers: (WebGLBuffer | null)[];
  modelMatrix: mat4;
  numIndices: number;
  texture: WebGLTexture | null;
  textureLinks: {
    a_Position: number;
    a_Normal: number;
    a_TexCoord: number;
    u_MvpMatrix: WebGLUniformLocation | null;
    u_NormalMatrix: WebGLUniformLocation | null;
    u_Sampler: WebGLUniformLocation | null;
  };
}) {
  // Задействовать объект программы
  gl.useProgram(program);
  const { a_Position, a_Normal, a_TexCoord, u_MvpMatrix, u_NormalMatrix } =
    textureLinks;
  const [vertexBuffer, normalBuffer, indexBuffer, texCoordBuffer] = buffers;

  // Присвоить буферные объекты и разрешить присваивание
  // Координаты вершины
  initAttributeVariable({
    gl,
    a_Attribute: a_Position,
    data: vertexBuffer,
    num: 3,
    type: gl.FLOAT,
  });
  // Нормальный
  initAttributeVariable({
    gl,
    a_Attribute: a_Normal,
    data: normalBuffer,
    num: 3,
    type: gl.FLOAT,
  });
  // Текстурные координаты
  initAttributeVariable({
    gl,
    a_Attribute: a_TexCoord,
    data: texCoordBuffer,
    num: 2,
    type: gl.FLOAT,
  });
  // Связать индексы
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // Привязать объект текстуры к текстурному блоку 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Draw
  drawCube({
    gl,
    modelMatrix,
    projectionMatrix,
    viewMatrix,
    mvpMatrix,
    offset: 2,
    normalMatrix,
    currentAngle,
    numIndices,
    u_NormalMatrix,
    u_MvpMatrix,
  });
}

function drawCube({
  gl,
  modelMatrix,
  projectionMatrix,
  viewMatrix,
  mvpMatrix,
  normalMatrix,
  currentAngle,
  numIndices,
  u_NormalMatrix,
  u_MvpMatrix,
  offset,
}: {
  gl: WebGL2RenderingContext;
  modelMatrix: mat4;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  normalMatrix: mat4;
  currentAngle: number;
  numIndices: number;
  offset: number;
  u_NormalMatrix: WebGLUniformLocation | null;
  u_MvpMatrix: WebGLUniformLocation | null;
}) {
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

  // Вычислить матрицу преобразования для нормалей и передать ее в u_NormalMatrix
  mat4.invert(normalMatrix, modelMatrix);
  // Передать матрицу преобразования для нормалей в u_NormalMatrix (необходимо транспонировать)
  gl.uniformMatrix4fv(u_NormalMatrix, true, normalMatrix);

  // Рассчитать матрицу проекции вида модели и передать ее в u_MvpMatrix
  mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
  mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);

  gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_BYTE, 0);
}
