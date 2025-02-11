export class WebGL {
  readonly gl: WebGL2RenderingContext;
  readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement | null) {
    if (!canvas) {
      throw new Error("Canvas не определён");
    }
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("Ошибка при создании контекста");
    }

    this.gl = gl;
    this.canvas = canvas;
    gl.clearColor(0.9, 0.9, 0.9, 1.0);
    // Включение теста глубины
    gl.enable(gl.DEPTH_TEST);
    /*
     Очищение буфера предварительно определённым цветом
     Выполнение команды gl.clear(gl.COLOR_BUFFER_BIT) в WebGL очищает буфер цвета перед началом отрисовки нового кадра.
     Это позволяет удалить все существующие данные цвета из буфера цвета и начать новый кадр с чистого листа.
     Без этой операции каждый последующий кадр будет отображать остатки предыдущего кадра,
     что может привести к визуальным артефактам и ошибкам рендеринга.
     Обычно это делается непосредственно перед вызовом метода drawArrays или drawElements,
     чтобы убедиться, что перед началом рисования буфер цвета полностью очищен.
    */
    this.clear();

    // Активация функции добавления сдвига к глубине
    // gl.enable(gl.POLYGON_OFFSET_FILL);
    // Определить параметры, используемые при вычислении величины сдвига.
    // Определяет поправку к координате Z для каждой вершины, которая будет нарисована после вызова этого метода.
    // m * factor + r * units,
    // m - наклон треугольника относительно линии взгляда
    // r - наименьшая разница между двумя значениями координаты Z, которые могут оказаться неразличимыми для WebGL
    // gl.polygonOffset(1, 1) - использовать только перед рисованием
  }

  // Очистить буферы цвета и глубины
  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  draw({
    mode = this.gl.TRIANGLES,
    count,
    type = this.gl.UNSIGNED_BYTE,
    offset = 0,
  }: {
    mode?: GLenum;
    count: GLsizei;
    type?: GLenum;
    offset?: GLintptr;
  }) {
    this.clear();
    this.gl.drawElements(mode, count, type, offset);
  }
}
