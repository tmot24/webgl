export const setBackgroundColor = (gl: WebGL2RenderingContext) => {
  // Устанавливаем цвет фона
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  // Очищение буфера предварительно определённым цветом
  gl.clear(gl.COLOR_BUFFER_BIT);
};
