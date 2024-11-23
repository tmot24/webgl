// Create a plane
//  v1------v0
//  |        |
//  |        |
//  |        |
//  v2------v3
// prettier-ignore
const verticesPlane = new Float32Array([
  3.0, -1.7, 2.5,  -3.0, -1.7, 2.5,  -3.0, -1.7, -2.5,   3.0, -1.7, -2.5    // v0-v1-v2-v3
]);
// prettier-ignore
const colorsPlane  = new Float32Array([
  1.0, 1.0, 1.0,    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,   1.0, 1.0, 1.0
]);
// prettier-ignore
const indicesPlane = new Uint8Array([0, 1, 2,   0, 2, 3]);

// Create a triangle
//       v2
//      / |
//     /  |
//    /   |
//  v0----v1
// prettier-ignore
const verticesTriangle = new Float32Array([-0.8, 3.5, 0.0,  0.8, 3.5, 0.0,  0.0, 3.5, 1.8]);
// prettier-ignore
const colorsTriangle  = new Float32Array([1.0, 0.5, 0.0,  1.0, 0.5, 0.0,  1.0, 0.0, 0.0]);
// prettier-ignore
const indicesTriangle = new Uint8Array([0, 1, 2]);

const OFFSCREEN_WIDTH = 2048;
const OFFSCREEN_HEIGHT = 2048;
const LIGHT_X = 0;
const LIGHT_Y = 40;
const LIGHT_Z = 2;

export {
  verticesPlane,
  colorsPlane,
  indicesPlane,
  verticesTriangle,
  colorsTriangle,
  indicesTriangle,
  OFFSCREEN_WIDTH,
  OFFSCREEN_HEIGHT,
  LIGHT_X,
  LIGHT_Y,
  LIGHT_Z,
};
