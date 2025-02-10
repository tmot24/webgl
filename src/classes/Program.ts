import { mat4 } from "gl-matrix";
import { Deletable } from "./interface/Deletable.ts";

export class Program implements Deletable {
  private readonly vertexShader: WebGLShader;
  private readonly fragmentShader: WebGLShader;
  private readonly gl: WebGL2RenderingContext;
  private uniformLocations: Map<string, WebGLUniformLocation> = new Map();
  readonly program: WebGLProgram;

  constructor({
    gl,
    vertexSource,
    fragmentSource,
  }: {
    gl: WebGL2RenderingContext;
    vertexSource: string;
    fragmentSource: string;
  }) {
    this.gl = gl;

    // 1. Создание объекта шейдеров
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) {
      throw new Error("Ошибка создания объекта шейдеров");
    }

    // 2. Привязать шейдеры
    gl.shaderSource(vertexShader, vertexSource);
    gl.shaderSource(fragmentShader, fragmentSource);
    // 3. Компиляция шейдеров
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    const vertexShaderCompiled = gl.getShaderParameter(
      vertexShader,
      gl.COMPILE_STATUS,
    );
    const fragmentShaderCompiled = gl.getShaderParameter(
      fragmentShader,
      gl.COMPILE_STATUS,
    );

    if (!vertexShaderCompiled) {
      const error = gl.getShaderInfoLog(vertexShader);
      gl.deleteShader(vertexShader);
      throw new Error(`Ошибка компиляции вершинного шейдера: ${error}`);
    }
    if (!fragmentShaderCompiled) {
      const error = gl.getShaderInfoLog(fragmentShader);
      gl.deleteShader(fragmentShader);
      throw new Error(`Ошибка компиляции фрагментного шейдера: ${error}`);
    }

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    // 4. Создание объекта программы
    const program = gl.createProgram();
    if (!program) {
      throw new Error("Ошибка создания программы");
    }

    // 5. Подключение шейдеров к программе
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 6. Компонует объект программы
    gl.linkProgram(program);

    const programCompiled = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!programCompiled) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Ошибка компоновки программы: ${error}`);
    }

    // 7. Сообщает что объект программы готов к использованию
    gl.useProgram(program);

    this.program = program;
  }

  delete() {
    // Удаление фрагментного шейдера
    this.gl.deleteShader(this.fragmentShader);
    // Удаление вершинного шейдера
    this.gl.deleteShader(this.vertexShader);
    // Удаление программы
    this.gl.deleteProgram(this.program);
  }

  // Передать матрицу в вершинный шейдер
  // (v - указывает на способность метода записать в переменную множество значений)
  uniformMatrix4fv({
    uniformName,
    transpose = false,
    matrix4,
  }: {
    uniformName: string;
    transpose?: GLboolean;
    matrix4: mat4;
  }) {
    const u_Uniform = this.getUniformLocationOnce(uniformName);
    this.gl.uniformMatrix4fv(u_Uniform, transpose, matrix4);
  }

  private getUniformLocationOnce(uniformName: string): WebGLUniformLocation {
    if (!this.uniformLocations.has(uniformName)) {
      const location = this.gl.getUniformLocation(this.program, uniformName);
      if (location) {
        this.uniformLocations.set(uniformName, location);
      }
    }
    return this.uniformLocations.get(uniformName)!;
  }
}
