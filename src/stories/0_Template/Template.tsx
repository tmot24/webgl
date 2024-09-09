import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";

export interface TemplateProps {
  isTemplate: boolean;
}

export const Template = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl2");
    if (!gl) return;

    // Устанавливаем цвет
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    // Очищение буфера предварительно определённым цветом
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Создаем шейдеры
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    gl.shaderSource(vertexShader, vertexSource);
    gl.shaderSource(fragmentShader, fragmentSource);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.useProgram(program);

    // Нарисовать точку
    gl.drawArrays(gl.POINTS, 0, 1);
  }, []);

  return <canvas width={500} height={500} ref={ref} />;
});
