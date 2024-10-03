import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";
import sky from "../../../resources/sky.jpg";
import circle from "../../../resources/circle.gif";

export const MultiTexture = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { gl } = context;
    setBackgroundColor({ gl });

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    // prettier-ignore
    const verticesTexCoordBuffer = new Float32Array([
      // x, y, координаты текстур (st или uv)
      -0.5, 0.5, 0, 1,
      -0.5, -0.5, 0, 0,
      0.5, 0.5, 1, 1,
      0.5, -0.5, 1, 0
    ]);
    const FSIZE = verticesTexCoordBuffer.BYTES_PER_ELEMENT;
    const n = 4;
    const coordsCount = 2;
    const stride = FSIZE * n;
    const offsetPosition = 0;
    const offsetColor = FSIZE * coordsCount;
    // Количество вызовов вершинного шейдера

    // 1. Создать буферный объект
    const vertexTexCoordBuffer = gl.createBuffer();
    // 2. Указать тип буферного объекта
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    // 3. Записать данные в буферный объект
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoordBuffer, gl.STATIC_DRAW);
    const a_Position = gl.getAttribLocation(program, "a_Position");
    // 4. Сохранить ссылку на буферный объект в переменной a_Position
    gl.vertexAttribPointer(
      a_Position,
      2,
      gl.FLOAT,
      false,
      stride,
      offsetPosition,
    );
    // 5. Разрешить присваивание переменной a_Position
    gl.enableVertexAttribArray(a_Position);

    // Создать объект текстуры
    const texture0 = gl.createTexture();
    const texture1 = gl.createTexture();
    // Получить ссылку на u_Sampler
    const u_Sampler0 = gl.getUniformLocation(program, "u_Sampler0");
    const u_Sampler1 = gl.getUniformLocation(program, "u_Sampler1");
    const image0 = new Image();
    const image1 = new Image();
    image0.src = sky;
    image1.src = circle;
    image0.onload = () => {
      loadTexture({
        gl,
        texture: texture0,
        image: image0,
        u_Sampler: u_Sampler0,
        n,
        texUnit: 0,
      });
    };
    image1.onload = () => {
      loadTexture({
        gl,
        texture: texture1,
        image: image1,
        u_Sampler: u_Sampler1,
        n,
        texUnit: 1,
      });
    };

    const a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
    gl.vertexAttribPointer(
      a_TexCoord,
      coordsCount,
      gl.FLOAT,
      false,
      stride,
      offsetColor,
    );
    gl.enableVertexAttribArray(a_TexCoord);

    gl.clear(gl.COLOR_BUFFER_BIT);
    // Выполняет вершинный шейдер, чтобы нарисовать фигуры, определяемые параметром mode
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);

    return () => {
      gl.deleteTexture(texture0);
      gl.deleteTexture(texture1);
    };
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});
// Переменные, определяющие готовность текстурных слотов к использованию
let g_texUnit0 = false;
let g_texUnit1 = false;

function loadTexture({
  gl,
  texture,
  image,
  u_Sampler,
  n,
  texUnit,
}: {
  gl: WebGL2RenderingContext;
  texture: WebGLTexture | null;
  image: HTMLImageElement;
  u_Sampler: WebGLUniformLocation | null;
  n: number;
  texUnit: number;
}) {
  // Повернуть ось Y изображения
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Выбрать текстурные слоты
  if (texUnit === 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  }
  // Указать тип объекта текстуры, если до вызова bindTexture был активирован текстурный слот activeTexture,
  // то объект текстуры также будет связан с активным слотом
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Определить параметры текстуры
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Определить изображение текстуры
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Определить указатель на текстурный слот 0, потому что активировали текстуру gl.TEXTURE0
  gl.uniform1i(u_Sampler, texUnit);

  // Изображения загружаются асинхронно
  if (g_texUnit0 && g_texUnit1) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Выполняет вершинный шейдер, чтобы нарисовать фигуры, определяемые параметром mode
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  }
}
