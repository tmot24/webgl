import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../../common/createShaders.ts";
import { createProgram } from "../../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../../common/setBackgroundColor.ts";
import { get2dCoordinates } from "../../../../common/get2dCoordinates.ts";

export const TranslatedTriangle = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { canvas, gl } = context;
    setBackgroundColor({ gl });

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    const u_FragColor = gl.getUniformLocation(program, "u_FragColor");
    gl.uniform4f(u_FragColor, 1, 0, 0, 1);

    const vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
    // Количество вершин
    const n = 3;

    // 1. Создать буферный объект
    const vertexBuffer = gl.createBuffer();
    // 2. Указать тип буферного объекта
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 3. Записать данные в буферный объект
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const a_Position = gl.getAttribLocation(program, "a_Position");
    const u_Translation = gl.getUniformLocation(program, "u_Translation");
    // 4. Сохранить ссылку на буферный объект в переменной a_Position
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    canvas.onmousemove = (ev) => {
      const { x, y } = get2dCoordinates({ ev, canvas });

      gl.uniform4f(u_Translation, x, y, 0, 0);

      // 5. Разрешить присваивание переменной a_Position
      gl.enableVertexAttribArray(a_Position);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // Выполняет вершинный шейдер, чтобы нарисовать фигуры, определяемые параметром mode
      gl.drawArrays(gl.TRIANGLES, 0, n);
    };

    // По умолчанию (до onmousemove)
    gl.uniform4f(u_Translation, 0, 0, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});
