/*
 Create a cube
    v6----- v5
   /|      /|
  v1------v0|
  | |     | |
  | |v7---|-|v4
  |/      |/
  v2------v3
*/

//  prettier-ignore
const verticesCubeData = new Float32Array([
  1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
  1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
  1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
  -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
  -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
  1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
]);
// prettier-ignore
const texCoordsCubeData = new Float32Array([
  1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
  0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
  1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
  1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
  0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
  0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
]);
// prettier-ignore
const indicesCubeData = new Uint8Array([
  0, 1, 2,   0, 2, 3,    // front
  4, 5, 6,   4, 6, 7,    // right
  8, 9,10,   8,10,11,    // up
  12,13,14,  12,14,15,    // left
  16,17,18,  16,18,19,    // down
  20,21,22,  20,22,23     // back
])

/*
 Create face
  v1------v0
  |        |
  |        |
  |        |
  v2------v3
*/
// prettier-ignore
const verticesPlaneData = new Float32Array([
  1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0    // v0-v1-v2-v3
]);
const texCoordsPlaneData = new Float32Array([
  1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
]);
const indicesPlaneData = new Uint8Array([0, 1, 2, 0, 2, 3]);

const OFFSCREEN_WIDTH = 256;
const OFFSCREEN_HEIGHT = 256;

export {
  verticesCubeData,
  texCoordsCubeData,
  indicesCubeData,
  verticesPlaneData,
  texCoordsPlaneData,
  indicesPlaneData,
  OFFSCREEN_WIDTH,
  OFFSCREEN_HEIGHT,
};
