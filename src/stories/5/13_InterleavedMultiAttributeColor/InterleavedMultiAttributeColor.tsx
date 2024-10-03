import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";

export const InterleavedMultiAttributeColor = memo(() => {
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

    const u_FragColor = gl.getUniformLocation(program, "u_FragColor");
    gl.uniform4f(u_FragColor, 1, 0, 0, 1);

    // prettier-ignore
    const vertices = new Float32Array([
      // x, y, size, color(r,g,b)
      0, 0.5, 10, 1, 0, 0,
      -0.5, -0.5, 20, 0, 1, 0,
      0.5, -0.5, 30, 0, 0, 1
    ]);
    const FSIZE = vertices.BYTES_PER_ELEMENT;
    const stride = FSIZE * 6;
    const offsetPosition = 0;
    const offsetSize = FSIZE * 2;
    const offsetColor = FSIZE * 3;
    const n = 3;

    // 1. Создать буферный объект
    const vertexBuffer = gl.createBuffer();
    // 2. Указать тип буферного объекта
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 3. Записать данные в буферный объект
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
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

    const a_PointSize = gl.getAttribLocation(program, "a_PointSize");
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, stride, offsetSize);
    gl.enableVertexAttribArray(a_PointSize);

    const a_Color = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, stride, offsetColor);
    gl.enableVertexAttribArray(a_Color);

    // Выполняет вершинный шейдер, чтобы нарисовать фигуры, определяемые параметром mode
    gl.drawArrays(gl.POINTS, 0, n);
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});
