export const INIT_OBJ_DATA: OBJData = {
  name: "",
  indices: [],
  colors: [],
  // Индексы начинаются с 1, добавим фиктивные элементы в начало
  vertexData: [[[0, 0, 0]], [[0, 0]], [[0, 0, 0]]],
  webGLData: [[], [], []],
};

export type OBJData = {
  name: string;
  indices: number[];
  colors: number[];
  // f 1/1/1 2/2/2 3/3/3 - индексы для позиций, текстовых координат и нормалей
  vertexData: [VertexPositions[], VertexTexcoords[], VertexNormals[]];
  webGLData: [VertexPositions, VertexTexcoords, VertexNormals];
};
type VertexPositions = number[];
type VertexTexcoords = number[];
type VertexNormals = number[];

export type Material = {
  name: string;
  Ka: number[]; // Ambient color (Окружающий цвет)
  Kd: number[]; // Diffuse color (Рассеянный цвет)
  Ks: number[]; // Specular color (Зеркальный цвет)
  Ns: number; // Shininess (Блеск)
  Ni: number; // Optical density (Оптическая плотность)
  d: number; // Dissolve, transparency (Растворение, прозрачность)
  illum: number; // Illumination model (Модель освещения)
};
