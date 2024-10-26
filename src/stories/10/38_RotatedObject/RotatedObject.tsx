import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { mat4, vec3 } from "gl-matrix";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";
import { getRadianFromDegree } from "../../../common/getRadianFromDegree.ts";
import { initArrayBuffer } from "../../../common/initArrayBuffer.ts";
import sky from "../../../resources/sky.jpg";

export const RotatedObject = memo(() => {
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

    const { n, buffers } = initVertexBuffers({ gl, program });

    const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
    const mvpMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(30),
      canvas.width / canvas.height,
      1,
      100,
    );
    // mat4.ortho(projectionMatrix, -3, 3, -3, 3, 0, 10);
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(3, 3, 7),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );

    const currentAngle: [number, number] = [0, 0];
    const targetAngle: [number, number] = [0, 0];

    const texture = initTextures({
      gl,
      program,
      n,
      u_MvpMatrix,
      currentAngle,
      mvpMatrix,
      projectionMatrix,
      viewMatrix,
    });

    initEventHandlers({
      canvas,
      currentAngle,
      targetAngle,
      gl,
      n,
      projectionMatrix,
      viewMatrix,
      mvpMatrix,
      u_MvpMatrix,
    });

    return () => {
      // Удаление программы
      gl.deleteProgram(program);
      // Удаление вершинного шейдера
      gl.deleteShader(vertexShader);
      // Удаление фрагментного шейдера
      gl.deleteShader(fragmentShader);
      // Удаление буферов
      buffers.forEach((buffer) => gl.deleteBuffer(buffer));
      // Удаление текстуры
      gl.deleteTexture(texture);
    };
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});

function initVertexBuffers({
  gl,
  program,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
}) {
  const dimension = 3;
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
  const texCoords = new Float32Array([   // Texture coordinates
    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ]);
  // prettier-ignore
  const indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);

  const positionBuffer = initArrayBuffer({
    gl,
    data: vertices,
    num: dimension,
    program,
    attribute: "a_Position",
  });
  const texCoordBuffer = initArrayBuffer({
    gl,
    data: texCoords,
    num: 2,
    program,
    attribute: "a_TexCoord",
  });
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return {
    n: indices.length,
    buffers: [indexBuffer, positionBuffer, texCoordBuffer],
  };
}

function draw({
  gl,
  n,
  projectionMatrix,
  viewMatrix,
  mvpMatrix,
  u_MvpMatrix,
  currentAngle,
}: {
  gl: WebGL2RenderingContext;
  n: number;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
  currentAngle: [number, number];
}) {
  // Необходимо вычислять каждый раз (не знаю почему)
  mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);

  mat4.rotateX(mvpMatrix, mvpMatrix, getRadianFromDegree(currentAngle[0]));
  mat4.rotateY(mvpMatrix, mvpMatrix, getRadianFromDegree(currentAngle[1]));

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initTextures({
  gl,
  program,
  n,
  u_MvpMatrix,
  currentAngle,
  mvpMatrix,
  projectionMatrix,
  viewMatrix,
}: {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  n: number;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
  currentAngle: [number, number];
}) {
  const texture = gl.createTexture();
  const u_Sampler = gl.getUniformLocation(program, "u_Sampler");
  const image = new Image();
  image.src = sky;
  image.onload = () => {
    loadTexture({
      gl,
      texture,
      u_Sampler,
      image,
      n,
      u_MvpMatrix,
      currentAngle,
      mvpMatrix,
      projectionMatrix,
      viewMatrix,
    });
  };

  return texture;
}

function loadTexture({
  gl,
  texture,
  u_Sampler,
  image,
  n,
  u_MvpMatrix,
  currentAngle,
  mvpMatrix,
  projectionMatrix,
  viewMatrix,
}: {
  gl: WebGL2RenderingContext;
  texture: WebGLTexture | null;
  u_Sampler: WebGLUniformLocation | null;
  image: HTMLImageElement;
  n: number;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
  currentAngle: [number, number];
}) {
  // Повернуть ось Y изображения
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Определить параметры текстуры
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Определить изображение текстуры
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Определить указатель на текстурный слот 0, потому что активировали текстуру gl.TEXTURE0
  gl.uniform1i(u_Sampler, 0);

  draw({
    gl,
    n,
    u_MvpMatrix,
    currentAngle,
    mvpMatrix,
    projectionMatrix,
    viewMatrix,
  });
}

function initEventHandlers({
  canvas,
  currentAngle,
  targetAngle,
  gl,
  n,
  projectionMatrix,
  viewMatrix,
  mvpMatrix,
  u_MvpMatrix,
}: {
  canvas: HTMLCanvasElement;
  currentAngle: [number, number];
  targetAngle: [number, number];
  gl: WebGL2RenderingContext;
  n: number;
  projectionMatrix: mat4;
  viewMatrix: mat4;
  mvpMatrix: mat4;
  u_MvpMatrix: WebGLUniformLocation | null;
}) {
  let dragging = false; // Вращать или нет
  let lastX = -1;
  let lastY = -1;

  canvas.onmousedown = (ev) => {
    const x = ev.clientX;
    const y = ev.clientY;
    const rect = canvas.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x;
      lastY = y;
      dragging = true;
    }
  };

  canvas.onmouseup = () => {
    dragging = false;
  };
  canvas.onmouseleave = () => {
    dragging = false;
  };

  // Квадратичные параметры для кубической интерполяции
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  canvas.onmousemove = (ev) => {
    const x = ev.clientX;
    const y = ev.clientY;

    if (dragging) {
      const factor = 200 / canvas.height; // Скорость вращения
      const dx = factor * (x - lastX);
      const dy = factor * (y - lastY);
      // Ограничить угол поворота по оси X от -90 до 90 градусов
      targetAngle[0] = Math.max(Math.min(targetAngle[0] + dy, 90), -90);
      targetAngle[1] += dx;

      const interpolationFactor = 0.5; // Степень интерполяции
      currentAngle[0] +=
        (targetAngle[0] - currentAngle[0]) *
        easeInOutCubic(interpolationFactor);
      currentAngle[1] +=
        (targetAngle[1] - currentAngle[1]) *
        easeInOutCubic(interpolationFactor);

      draw({
        gl,
        n,
        u_MvpMatrix,
        currentAngle,
        mvpMatrix,
        projectionMatrix,
        viewMatrix,
      });
    }

    lastX = x;
    lastY = y;
  };
}
