import { Material } from "./types.ts";

export const parseMTLFileModified = (
  mtlFile: string,
): Record<string, Material> => {
  const materials: Record<string, Material> = {};
  let currentMaterial: Material = {
    name: "",
    Ka: [],
    Kd: [],
    Ks: [],
    Ns: 0,
    Ni: 0,
    d: 0,
    illum: 0,
  };

  const lines = mtlFile.split("\n").map((line) => line.trim());

  lines.forEach((line) => {
    if (line.startsWith("#") || !line) return; // Пропускаем комментарии и пустые строки

    const parts = line.split(/\s+/);
    const keyword = parts[0];

    switch (keyword) {
      case "newmtl":
        // Начало нового материала
        currentMaterial = {
          ...currentMaterial,
          name: parts[1],
        };
        materials[parts[1]] = currentMaterial;
        break;
      case "Ka":
        if (currentMaterial)
          currentMaterial.Ka = parts.slice(1).map(parseFloat);
        break;
      case "Kd":
        if (currentMaterial)
          currentMaterial.Kd = parts.slice(1).map(parseFloat);
        break;
      case "Ks":
        if (currentMaterial)
          currentMaterial.Ks = parts.slice(1).map(parseFloat);
        break;
      case "Ns":
        if (currentMaterial) currentMaterial.Ns = parseFloat(parts[1]);
        break;
      case "Ni":
        if (currentMaterial) currentMaterial.Ni = parseFloat(parts[1]);
        break;
      case "d":
        if (currentMaterial) currentMaterial.d = parseFloat(parts[1]);
        break;
      case "illum":
        if (currentMaterial) currentMaterial.illum = parseInt(parts[1]);
        break;
    }
  });

  return materials;
};
