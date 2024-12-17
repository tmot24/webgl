interface Material {
  name: string;
  color: [number, number, number, number]; // RGBA
}

export function parseObjAndMtlForWebGL(objData: string, mtlData: string) {
  const vertexArray: number[] = [];
  const normalArray: number[] = [];
  const indexArray: number[] = [];
  const colorArray: number[] = [];

  const vertices: number[][] = [];
  const normals: number[][] = [];
  const materials: Material[] = [];
  const materialMap: { [name: string]: Material } = {};
  let currentMaterial: Material | null = null;

  // Parse .mtl file
  const parseMtlFile = (mtlData: string) => {
    const lines = mtlData.split("\n");
    let currentMaterialName: string | null = null;
    let currentColor: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("newmtl")) {
        if (currentMaterialName) {
          materials.push({ name: currentMaterialName, color: currentColor });
          materialMap[currentMaterialName] = {
            name: currentMaterialName,
            color: currentColor,
          };
        }
        currentMaterialName = trimmed.split(" ")[1];
        currentColor = [1.0, 1.0, 1.0, 1.0]; // Reset to default color
      } else if (trimmed.startsWith("Kd")) {
        const [_, r, g, b] = trimmed.split(/\s+/).map(Number);
        currentColor = [r, g, b, currentColor[3]]; // Update RGB
      } else if (trimmed.startsWith("d")) {
        const alpha = parseFloat(trimmed.split(" ")[1]);
        currentColor[3] = alpha; // Update Alpha
      }
    }

    // Save last material
    if (currentMaterialName) {
      materials.push({ name: currentMaterialName, color: currentColor });
      materialMap[currentMaterialName] = {
        name: currentMaterialName,
        color: currentColor,
      };
    }
  };

  // Parse .obj file
  const parseObjFile = (objData: string) => {
    const lines = objData.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("v ")) {
        const [, x, y, z] = trimmed.split(/\s+/).map(Number);
        vertices.push([x, y, z]);
      } else if (trimmed.startsWith("vn ")) {
        const [, x, y, z] = trimmed.split(/\s+/).map(Number);
        normals.push([x, y, z]);
      } else if (trimmed.startsWith("usemtl")) {
        const materialName = trimmed.split(" ")[1];
        currentMaterial = materialMap[materialName] || null;
      } else if (trimmed.startsWith("f ")) {
        const face = trimmed
          .split(" ")
          .slice(1)
          .map((vertex) => vertex.split("/").map(Number));

        const vertexIndices = face.map((v) => v[0] - 1);
        const normalIndices = face.map((v) => v[2] - 1);

        // Triangulate face
        for (let i = 1; i < face.length - 1; i++) {
          const indices = [0, i, i + 1];
          for (const index of indices) {
            const vertexIndex = vertexIndices[index];
            const normalIndex = normalIndices[index];

            vertexArray.push(...vertices[vertexIndex]);
            normalArray.push(...normals[normalIndex]);

            if (currentMaterial) {
              colorArray.push(...currentMaterial.color);
            } else {
              colorArray.push(1.0, 1.0, 1.0, 1.0); // Default white color
            }

            indexArray.push(vertexArray.length / 3 - 1);
          }
        }
      }
    }
  };

  parseMtlFile(mtlData);
  parseObjFile(objData);

  return {
    vertexArray,
    normalArray,
    indexArray,
    colorArray,
  };
}

interface Material {
  name: string;
  color: [number, number, number, number]; // RGBA
}

interface ObjData {
  name: string;
  data: {
    vertexArray: number[];
    normalArray: number[];
    indexArray: number[];
    colorArray: number[];
  };
}

export function parseObjAndMtlForWebGLByGroup(
  objData: string,
  mtlData: string,
) {
  const objects: ObjData[] = [];
  const materials: Material[] = [];
  const materialMap: { [name: string]: Material } = {};
  let currentMaterial: Material | null = null;

  // Temporary data for the current object
  let currentObject: ObjData | null = null;

  // All vertices and normals for referencing by indices
  const vertices: number[][] = [];
  const normals: number[][] = [];

  // Parse .mtl file
  const parseMtlFile = (mtlData: string) => {
    const lines = mtlData.split("\n");
    let currentMaterialName: string | null = null;
    let currentColor: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("newmtl")) {
        if (currentMaterialName) {
          materials.push({ name: currentMaterialName, color: currentColor });
          materialMap[currentMaterialName] = {
            name: currentMaterialName,
            color: currentColor,
          };
        }
        currentMaterialName = trimmed.split(" ")[1];
        currentColor = [1.0, 1.0, 1.0, 1.0]; // Reset to default color
      } else if (trimmed.startsWith("Kd")) {
        const [_, r, g, b] = trimmed.split(/\s+/).map(Number);
        currentColor = [r, g, b, currentColor[3]]; // Update RGB
      } else if (trimmed.startsWith("d")) {
        const alpha = parseFloat(trimmed.split(" ")[1]);
        currentColor[3] = alpha; // Update Alpha
      }
    }

    // Save last material
    if (currentMaterialName) {
      materials.push({ name: currentMaterialName, color: currentColor });
      materialMap[currentMaterialName] = {
        name: currentMaterialName,
        color: currentColor,
      };
    }
  };

  // Finalize current object and start a new one
  const finalizeCurrentObject = () => {
    if (currentObject) {
      objects.push(currentObject);
    }
  };

  // Parse .obj file
  const parseObjFile = (objData: string) => {
    const lines = objData.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("v ")) {
        const [, x, y, z] = trimmed.split(/\s+/).map(Number);
        vertices.push([x, y, z]);
      } else if (trimmed.startsWith("vn ")) {
        const [, x, y, z] = trimmed.split(/\s+/).map(Number);
        normals.push([x, y, z]);
      } else if (trimmed.startsWith("usemtl")) {
        const materialName = trimmed.split(" ")[1];
        currentMaterial = materialMap[materialName] || null;
      } else if (trimmed.startsWith("g ")) {
        finalizeCurrentObject();
        const groupName = trimmed.split(" ")[1];
        currentObject = {
          name: groupName,
          data: {
            vertexArray: [],
            normalArray: [],
            indexArray: [],
            colorArray: [],
          },
        };
      } else if (trimmed.startsWith("f ") && currentObject) {
        const face = trimmed
          .split(" ")
          .slice(1)
          .map((vertex) => vertex.split("/").map(Number));

        const vertexIndices = face.map((v) => v[0] - 1);
        const normalIndices = face.map((v) => v[2] - 1);

        // Triangulate face
        for (let i = 1; i < face.length - 1; i++) {
          const indices = [0, i, i + 1];
          for (const index of indices) {
            const vertexIndex = vertexIndices[index];
            const normalIndex = normalIndices[index];

            currentObject.data.vertexArray.push(...vertices[vertexIndex]);
            currentObject.data.normalArray.push(...normals[normalIndex]);

            if (currentMaterial) {
              currentObject.data.colorArray.push(...currentMaterial.color);
            } else {
              currentObject.data.colorArray.push(1.0, 1.0, 1.0, 1.0); // Default white color
            }

            currentObject.data.indexArray.push(
              currentObject.data.vertexArray.length / 3 - 1,
            );
          }
        }
      }
    }

    finalizeCurrentObject(); // Finalize the last object
  };

  parseMtlFile(mtlData);
  parseObjFile(objData);

  return objects;
}
