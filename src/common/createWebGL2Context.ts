export const createWebGL2Context = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return;
  const gl = canvas.getContext("webgl2");
  if (!gl) return;
  return {
    gl,
    canvas,
  };
};
