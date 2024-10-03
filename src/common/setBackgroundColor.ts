export const setBackgroundColor = ({
  gl,
  depthTest,
}: {
  gl: WebGL2RenderingContext;
  depthTest?: boolean;
}) => {
  // Устанавливаем цвет фона
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  if (depthTest) {
    // Включение теста глубины
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    return;
  }
  // Очищение буфера предварительно определённым цветом
  // Выполнение команды gl.clear(gl.COLOR_BUFFER_BIT) в WebGL очищает буфер цвета перед началом отрисовки нового кадра.
  // Это позволяет удалить все существующие данные цвета из буфера цвета и начать новый кадр с чистого листа.
  // Без этой операции каждый последующий кадр будет отображать остатки предыдущего кадра,
  // что может привести к визуальным артефактам и ошибкам рендеринга.
  // Обычно это делается непосредственно перед вызовом метода drawArrays или drawElements,
  // чтобы убедиться, что перед началом рисования буфер цвета полностью очищен.
  gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};
