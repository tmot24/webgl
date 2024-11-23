import { Deletable } from "./interface/Deletable.ts";

export class InitTexture implements Deletable {
  private readonly gl: WebGL2RenderingContext;
  private readonly texture: WebGLTexture;
  private readonly textureSlot: GLenum;

  constructor({
    gl,
    program,
    src,
    uniformSamplerName,
    textureSlot,
    numberSlot,
  }: {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    src: string;
    uniformSamplerName: string;
    textureSlot: GLenum;
    numberSlot: number;
  }) {
    const texture = gl.createTexture();

    if (!texture) {
      throw new Error("Ошибка создания текстуры");
    }
    this.gl = gl;
    this.texture = texture;
    this.textureSlot = textureSlot;
    const image = new Image();
    image.src = src;
    image.onload = () =>
      this.loadTexture({
        image,
        program,
        uniformSamplerName,
        textureSlot,
        numberSlot,
      });
  }

  private loadTexture({
    program,
    image,
    uniformSamplerName,
    textureSlot,
    numberSlot,
  }: {
    image: HTMLImageElement;
    program: WebGLProgram;
    uniformSamplerName: string;
    textureSlot: GLenum;
    numberSlot: number;
  }) {
    // Повернуть ось Y изображения
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);
    this.gl.activeTexture(textureSlot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Определить параметры текстуры
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR,
    );
    // Определить изображение текстуры
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGB,
      this.gl.RGB,
      this.gl.UNSIGNED_BYTE,
      image,
    );

    // Передать текстурный блок 0 в u_Sampler
    this.gl.useProgram(program);
    const u_Sampler = this.gl.getUniformLocation(program, uniformSamplerName);
    // Определить указатель на текстурный слот 0, потому что активировали текстуру this.gl.TEXTURE0
    this.gl.uniform1i(u_Sampler, numberSlot);
    // Отвязать текстуру
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  delete() {
    // Удаление текстуры
    this.gl.deleteTexture(this.texture);
  }

  // Привязать объект текстуры к текстурному блоку
  initTexture() {
    this.gl.activeTexture(this.textureSlot);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
