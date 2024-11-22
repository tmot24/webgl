// Для индексов
export class InitElementArrayBuffer {
  private readonly gl: WebGL2RenderingContext;
  readonly type: number;
  readonly count: GLsizei;
  readonly buffer: WebGLBuffer | null;

  constructor({
    gl,
    data,
    type = gl.UNSIGNED_BYTE,
  }: {
    gl: WebGL2RenderingContext;
    data: Float32Array | Uint8Array;
    type?: number;
  }) {
    // 1. Создать буферный объект
    const buffer = gl.createBuffer();
    // 2. Указать типы буферных объектов
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    // 3. Записать данные в буферные объекты
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

    this.gl = gl;
    this.buffer = buffer;
    this.count = data.length;
    this.type = type;

    // Отвязать объект буфера
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  deleteBuffer() {
    this.gl.deleteBuffer(this.buffer);
  }

  // Связать буфер
  initBuffer() {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }
}
