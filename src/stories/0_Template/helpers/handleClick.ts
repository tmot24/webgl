import { get2dCoordinates } from "../../../common/get2dCoordinates.ts";

const g_points: [number, number][] = [];
const g_colors: [number, number, number, number][] = [];

export const handleClick = ({
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
}) => {
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
};
