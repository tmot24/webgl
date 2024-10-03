import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";

export const RotatedTriangle = memo(() => {
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
    // 4. Сохранить ссылку на буферный объект в переменной a_Position
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // 5. Разрешить присваивание переменной a_Position
    gl.enableVertexAttribArray(a_Position);

    // Передать в вершинный шейдер данные, необходимые для поворота фигуры
    const ANGLE = -135;
    const radian = (Math.PI * ANGLE) / 180; // Преобразование в радианы
    const cosB = Math.cos(radian);
    const sinB = Math.sin(radian);

    const u_CosBSinB = gl.getUniformLocation(program, "u_CosBSinB");
    gl.uniform2f(u_CosBSinB, cosB, sinB);
    // Выполняет вершинный шейдер, чтобы нарисовать фигуры, определяемые параметром mode
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});
