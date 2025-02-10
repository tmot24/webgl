import { Deletable } from "./interface/Deletable.ts";

export class InitArrayBuffer implements Deletable {
  private readonly gl: WebGL2RenderingContext;
  private readonly num: number;
  private readonly type: number;
  private attributeLocations: Map<string, GLint> = new Map();
  readonly buffer: WebGLBuffer | null;

  constructor({
    gl,
    data,
    num,
    type = gl.FLOAT,
  }: {
    gl: WebGL2RenderingContext;
    data: Float32Array | Uint8Array;
    num: number;
    type?: number;
  }) {
    // 1. Создать буферный объект
    const buffer = gl.createBuffer();
    // 2. Указать типы буферных объектов
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // 3. Записать данные в буферные объекты
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

    this.gl = gl;
    this.buffer = buffer;
    this.num = num;
    this.type = type;

    // Отвязать объект буфера
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  delete() {
    this.gl.deleteBuffer(this.buffer);
  }

  // Присвоить буферные объекты и разрешить присваивание
  initAttributeVariable({
    attributeName,
    program,
  }: {
    attributeName: string;
    program: WebGLProgram;
  }) {
    const a_Attribute = this.getAttributeLocationOnce({
      attributeName,
      program,
    });
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    // 4. Сохранить ссылку на буферный объект в переменной a_Position
    // а) index - определяет переменную-атрибут, которой будет выполнено присваивание
    // б) size - определяет число компонентов на вершину от 1 до 4 (2 - двухмерный)
    // в) type - определяет формат данных (gl.FLOAT - зависит от типизированного массива (Float32Array))
    // г) normalized - указывает на необходимость нормализации данных в диапазон [0, 1] или [-1, 1]
    // д) stride - определяет число байтов между разными элементами данных (по умолчанию 0)
    // e) offset - определяет смещение (в байтах) от начала буферного объекта
    this.gl.vertexAttribPointer(a_Attribute, this.num, this.type, false, 0, 0);
    // 5. Разрешить присваивание переменной a_Attribute
    this.gl.enableVertexAttribArray(a_Attribute);
  }

  private getAttributeLocationOnce({
    attributeName,
    program,
  }: {
    attributeName: string;
    program: WebGLProgram;
  }): GLint {
    if (!this.attributeLocations.has(attributeName)) {
      const location = this.gl.getAttribLocation(program, attributeName);
      if (location === -1) {
        console.error(
          `Не удалось найти местоположение атрибута: ${attributeName}`,
        );
      }
      this.attributeLocations.set(attributeName, location);
    }
    return this.attributeLocations.get(attributeName)!;
  }
}
