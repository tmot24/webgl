import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";
import { get2dCoordinates } from "../../../common/get2dCoordinates.ts";

export const MultiPoint = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = createWebGL2Context(ref.current);
    if (!context) return;
    const { gl, canvas } = context;
    setBackgroundColor({ gl });

    const shaders = createShaders({ gl, vertexSource, fragmentSource });
    if (!shaders) return;
    const { vertexShader, fragmentShader } = shaders;

    const program = createProgram({ gl, vertexShader, fragmentShader });
    if (!program) return;

    const a_Position = gl.getAttribLocation(program, "a_Position");
    const u_FragColor = gl.getUniformLocation(program, "u_FragColor");

    canvas.onmousedown = (ev) =>
      handleClick({ ev, gl, canvas, a_Position, u_FragColor });

    const a_PointSize = gl.getAttribLocation(program, "a_PointSize");
    // Одинаковый размер для всех точек
    gl.vertexAttrib1f(a_PointSize, 10);
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});

const g_points: [number, number][] = [];
const g_colors: [number, number, number, number][] = [];

function handleClick({
  ev,
  gl,
  canvas,
  a_Position,
  u_FragColor,
}: {
  ev: MouseEvent;
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  a_Position: number;
  u_FragColor: WebGLUniformLocation | null;
}) {
  const { x, y } = get2dCoordinates({ ev, canvas });
  g_points.push([x, y]);

  if (x >= 0 && y >= 0) {
    g_colors.push([1, 0, 0, 1]);
  } else if (x <= 0 && y <= 0) {
    g_colors.push([0, 1, 0, 1]);
  } else {
    g_colors.push([0, 0, 1, 1]);
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  g_points.forEach(([x, y], index) => {
    // Передать координаты щелчка в переменную a_Position
    gl.vertexAttrib2f(a_Position, x, y);
    // Передаём цвет точки в переменную u_FragColor
    gl.uniform4f(u_FragColor, ...g_colors[index]);
    // gl.uniform4f(u_FragColor, x, y, 0, 1);
    // Нарисовать точку
    gl.drawArrays(gl.POINTS, 0, 1);
  });
}
