import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { createWebGL2Context } from "../../../common/createWebGL2Context.ts";
import { createShaders } from "../../../common/createShaders.ts";
import { createProgram } from "../../../common/createProgram.ts";
import { setBackgroundColor } from "../../../common/setBackgroundColor.ts";
import { handleClick } from "./helpers/handleClick.ts";

export const Template = memo(() => {
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
