import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";
import { mat4 } from "gl-matrix";

export const AnimationRotatedTriangle = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

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
      0, 0.2,
      -0.2, -0.2,
      0.2, -0.2
    ]);
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

    const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
    const modelMatrix = mat4.create();

    const tick = (time: DOMHighResTimeStamp = 0) => {
      const currentAngle = (time / 1000) % (Math.PI * 2);

      // Определить матрицу вращения
      mat4.fromZRotation(modelMatrix, currentAngle);

      // Передать матрицу в вершинный шейдер
      gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix);

      // Очистить canvas
      gl.clear(gl.COLOR_BUFFER_BIT);
      // Нарисовать треугольник
      gl.drawArrays(gl.TRIANGLES, 0, n);

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});
