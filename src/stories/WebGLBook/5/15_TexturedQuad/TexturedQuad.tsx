import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";
import sky from "../../../../resources/sky.jpg";

export const TexturedQuad = memo(() => {
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
    const texture = gl.createTexture();
    // Получить ссылку на u_Sampler
    const u_Sampler = gl.getUniformLocation(program, "u_Sampler");
    const image = new Image();
    image.src = sky;
    image.onload = () => {
      // Повернуть ось Y изображения
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      // Выбрать текстурный слот 0
      gl.activeTexture(gl.TEXTURE0);
      // Указать тип объекта текстуры, если до вызова bindTexture был активирован текстурный слот activeTexture,
      // то объект текстуры также будет связан с активным слотом
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Определить параметры текстуры
      // pname
      // gl.TEXTURE_MAG_FILTER - увеличивает изображение для текстуры 16x16 => 32x32
      // gl.TEXTURE_MIN_FILTER - уменьшает изображение для текстуры  32x32 => 16x16
      // gl.TEXTURE_WRAP_S - заполняет пустые места по горизонтали
      // gl.TEXTURE_WRAP_T - заполняет пустые места по вертикали
      // param
      // gl.NEAREST (MAG/MIN) - использует значение ближайшего текселя к центру текстурируемого пикселя
      // gl.LINEAR (MAG/MIN) - использует средневзвешенное по четырём текселям (высокое качество, но больше вычислений)
      // gl.REPEAT (WRAP) - повторяет изображение
      // gl.MIRRORED_REPEAT (WRAP) - повторяет изображение с отражением
      // gl.CLAMP_TO_EDGE (WRAP) - использует цвет края изображения текстуры
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      // Определить изображение текстуры
      // target: gl.TEXTURE_2D или gl.TEXTURE_CUBE_MAP
      // level: используется совместно с MIP текстурами (если без, то 0)
      // internalformat: внутренний формат изображения (JPG - RGB, PNG - RGBA, чёрно-белый - LUMINANCE или LUMINANCE_ALPHA)
      // format: определяет формат данных с информацией о текселях (должен иметь то же значение, что и internalformat)
      // type: тип данных с информацией о текселях (gl.UNSIGNED_BYTE - компоненты RGB представлены без знаковыми байтами,
      // каждый компонент представлен одним байтом. Остальные форматы для сжатых изображений)
      // source: объект изображения содержащий текстуру
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

      // Определить указатель на текстурный слот 0, потому что активировали текстуру gl.TEXTURE0
      gl.uniform1i(u_Sampler, 0);

      gl.clear(gl.COLOR_BUFFER_BIT);
      // Выполняет вершинный шейдер, чтобы нарисовать фигуры, определяемые параметром mode
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
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
      gl.deleteTexture(texture);
    };
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});
