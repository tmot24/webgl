// Инициализировать объект буфера кадра (FBO)
export class InitFramebufferTexture {
  private readonly gl: WebGL2RenderingContext;
  private readonly textureSlot: GLenum | null;
  private readonly depthBuffer: WebGLRenderbuffer | null;
  readonly texture: WebGLTexture | null;
  readonly framebuffer: WebGLFramebuffer | null;

  constructor({
    gl,
    width,
    height,
    textureSlot,
  }: {
    gl: WebGL2RenderingContext;
    width: GLsizei;
    height: GLsizei;
    textureSlot: GLenum;
  }) {
    this.gl = gl;
    this.textureSlot = textureSlot;

    // Создать объект буфера кадра (FBO)
    const framebuffer = gl.createFramebuffer();
    // Создаем объект текстуры, установить его размер и параметры
    const texture = gl.createTexture();
    // Привязываем объект к цели
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    /*
     Определить параметры текстуры
     pname
     gl.TEXTURE_MAG_FILTER - увеличивает изображение для текстуры 16x16 => 32x32
     gl.TEXTURE_MIN_FILTER - уменьшает изображение для текстуры  32x32 => 16x16
     gl.TEXTURE_WRAP_S - заполняет пустые места по горизонтали
     gl.TEXTURE_WRAP_T - заполняет пустые места по вертикали
     param
     gl.NEAREST (MAG/MIN) - использует значение ближайшего текселя к центру текстурируемого пикселя
     gl.LINEAR (MAG/MIN) - использует средневзвешенное по четырём текселям (высокое качество, но больше вычислений)
     gl.REPEAT (WRAP) - повторяет изображение
     gl.MIRRORED_REPEAT (WRAP) - повторяет изображение с отражением
     gl.CLAMP_TO_EDGE (WRAP) - использует цвет края изображения текстуры
    */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    this.texture = texture;

    // Создать объект буфера отображения, установить его размер и параметры
    const depthBuffer = gl.createRenderbuffer();
    this.depthBuffer = depthBuffer;
    // Привязываем объект к цели
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    /*
     Создаёт и инициализирует хранилище данных для объекта буфера отображения:
     target - должен иметь значение gl.RENDERBUFFER
     internalformat - формат буфера отображения:
      * gl.DEPTH_COMPONENT16 - буфер отображения используется как буфер глубины
      * gl.STENCIL_INDEX8 - буфер отображения используется как буфер трафарета
      * gl.RGBA, gl.RGBA4, gl.RGB5_A1, gl.RGB565 - буфер отображения используется как буфер цвета.
        Когда указано значение gl.RGBA4 для каждого компонента цвета RGBA отводится по 4 бита.
        Когда указано значение gl.RGBA5_A1 для каждого компонента цвета RGBA отводится по 5 бит, а для компонента A - один бит.
        Когда указано значение gl.RGBA565 для каждого компонента цвета RGB отводится по 5, 6, 5 бит.
     width, height - определяют ширину и высоту буфера отображения в пикселях.
    */
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      width,
      height,
    );
    // Связать объект буфера кадра с его типом
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    /*
     Подключает объект текстуры texture к объекту буфера кадра с типом target:
     target - должен иметь значение gl.FRAMEBUFFER
     attachment - определяет точку подключения к буферу кадра:
      * gl.COLOR_ATTACHMENT0 - объект texture используется как буфер цвета
      * gl.DEPTH_ATTACHMENT - объект texture используется как буфер глубины
     textarget - определяет первый аргумент в вызове gl.texImage2D() (gl.TEXTURE_2D или gl.CUBE_MAP_TEXTURE)
     texture - определяет объект текстуры для подключения к объекту буфера кадра
     level - должен иметь значение 0 (если объект текстуры texture предусматривает возможность MIP-текстурирования,
             в аргумент level нужно указать уровень детализации)
    */
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    /*
     Подключить объект буфера отображения rendertarget к объекту буфера кадра, связанному с типом target:
     target - должен иметь значение gl.FRAMEBUFFER
     attachment - определяет точку подключения к буферу кадра:
      * gl.COLOR_ATTACHMENT0 - renderbuffer используется как буфер цвета
      * gl.DEPTH_ATTACHMENT - renderbuffer используется как буфер глубины
      * gl.STENCIL_ATTACHMENT - renderbuffer используется как буфер трафарета
     renderbuffertarget - должен иметь значения gl.RENDERBUFFER
     renderbuffer - объект буфера отображения, подключаемый к объекту буфера кадра
    */
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthBuffer,
    );

    // Проверить корректность настройки FBO
    const error = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT === error) {
      throw Error(`Настройка точек подключения выполнена не до конца. 
      Подключённые объекты не готовы к использованию. 
      Один или оба объекта настроены с ошибками: ${error.toString()}`);
    }
    if (gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS === error) {
      throw Error(
        `Объекты текстуры и буфера отображения имеют разную ширину и/или высоту: ${error.toString()}`,
      );
    }
    if (gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT === error) {
      throw Error(
        `Отсутствует ссылка на объект текстуры и/или объект буфера отображения: ${error.toString()}`,
      );
    }
    if (gl.FRAMEBUFFER_COMPLETE !== error) {
      throw Error(`Объект буфера настроен неправильно: ${error.toString()}`);
    }
    this.framebuffer = framebuffer;

    // Отвязать объект буфера
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  deleteFramebufferTexture() {
    // Удалить объект буфера кадра
    this.gl.deleteFramebuffer(this.framebuffer);
    // Удалить объект буфера отображения
    this.gl.deleteRenderbuffer(this.depthBuffer);
    // Удаление текстуры
    this.gl.deleteTexture(this.texture);
  }

  // Привязать объект текстуры к текстурному блоку
  initTexture() {
    if (!this.textureSlot) {
      throw new Error("Не задан текстурный слот");
    }
    this.gl.activeTexture(this.textureSlot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
