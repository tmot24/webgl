import { computeNormal } from "./computeNormal.ts";
import { parseMTLFile } from "./parseMTLFile.ts";
import { OBJData, INIT_OBJ_DATA, Material } from "./types.ts";

// Регулярное выражение для поиска ключевых слов
const keywordRE = /(\w+)(?:\s*(.*))?/;

export const OBJParser = ({
  objFile,
  mtlFiles,
}: {
  objFile: string;
  mtlFiles: Record<string, string>;
}) => {
  const result: OBJData[] = [];
  let currentObj: OBJData = INIT_OBJ_DATA;
  let materials: Record<string, Material> = {};
  let currentMaterialName = "";

  // Функция для добавления вершины в WebGL данные и индексов
  const addVertex = (vertex: string) => {
    const parts = vertex.split("/");
    parts.forEach((indexStr, i) => {
      if (!indexStr) return;
      const index = parseInt(indexStr);
      // скорректированный индекс
      const adjustedIndex =
        index >= 0 ? index : currentObj.vertexData[0][i].length + index;
      const vertices = currentObj.vertexData[i][adjustedIndex];
      currentObj.webGLData[i].push(...vertices);
    });

    // Добавляем индекс в массив
    const index = currentObj.webGLData[0].length / 3 - 1; // Индекс вершины
    currentObj.indices.push(index);
  };

  // Функция для добавления цвета для вершины
  const addColor = () => {
    const material = materials[currentMaterialName];

    if (material) {
      const color = material.Kd; // Используем рассеянный цвет (Kd) материала
      const dissolve = material.d; // Используем прозрачность (d) материала
      // Добавляем цвет на каждую вершину в массив цветов
      currentObj.colors.push(...color, dissolve);
      currentObj.colors.push(...color, dissolve);
      currentObj.colors.push(...color, dissolve);
    } else {
      console.warn("Необработанное ключевое слово: ", currentMaterialName);
      // Если материал не найден, используем дефолтный цвет (например, белый)
      currentObj.colors.push(1, 1, 1, 1); // Белый цвет
    }
  };

  // Обработчики для различных ключевых слов
  const keywords: Record<string, (args: string) => void> = {
    o: (args) => {
      const parts = args.split(/\s+/);
      const name = parts[0];
      currentObj = {
        ...INIT_OBJ_DATA,
        name,
      };
      result.push(currentObj);
    },
    v: (args) => {
      const parts = args.split(/\s+/);
      currentObj.vertexData[0].push(parts.map(parseFloat));
    },
    f: (args) => {
      const parts = args.split(/\s+/);
      // Для каждой грани создаем треугольники (4 вершины = 2 треугольника)
      const numTriangles = parts.length - 2;
      for (let i = 0; i < numTriangles; i++) {
        // Индексы для трех вершин треугольника (если множество значений в f)
        const v1 = parts[0].split("/").map(Number);
        const v2 = parts[i + 1].split("/").map(Number);
        const v3 = parts[i + 2].split("/").map(Number);

        // Извлекаем только позиции (первые элементы в индексе, другие это текстовые координаты и нормали)
        const p1 = currentObj.vertexData[0][v1[0]];
        const p2 = currentObj.vertexData[0][v2[0]];
        const p3 = currentObj.vertexData[0][v3[0]];

        // Если нормали не были заданы в файле, вычисляем их
        let normal: [number, number, number];
        if (v1[2] && v2[2] && v3[2]) {
          // Если нормали есть в файле (предполагаем, что это индексы нормалей)
          normal = [
            currentObj.vertexData[2][v1[2]][0],
            currentObj.vertexData[2][v1[2]][1],
            currentObj.vertexData[2][v1[2]][2],
          ];
        } else {
          // Иначе вычисляем нормаль для грани
          normal = computeNormal({ p1, p2, p3 });
        }

        // Добавляем вершины и нормали в данные WebGL
        addVertex(parts[0]); // Первый индекс вершины
        addVertex(parts[i + 1]); // Второй индекс вершины
        addVertex(parts[i + 2]); // Третий индекс вершины

        // Добавляем цвет для каждой вершины
        addColor();

        // Добавляем нормаль для каждой вершины
        currentObj.webGLData[2].push(...normal); // Добавляем нормаль для каждой вершины
        currentObj.webGLData[2].push(...normal); // Повторяем для второй вершины
        currentObj.webGLData[2].push(...normal); // Повторяем для третьей вершины
      }
    },
    mtllib: (args) => {
      const mtlFile = mtlFiles[args];
      materials = mtlFile ? parseMTLFile(mtlFile) : {}; // Применение материала к объекту, если он был указан
    },
    usemtl: (args) => {
      currentMaterialName = args;
    },
  };

  const lines = objFile.split("\n").map((line) => line.trim());

  // Основной цикл обработки строк
  lines.forEach((line) => {
    if (!line || line.startsWith("#")) return;

    const match = keywordRE.exec(line);
    if (!match) return;

    const [, keyword, args] = match;
    const handler = keywords[keyword];
    if (handler) {
      handler(args);
    } else {
      console.warn("Необработанное ключевое слово: ", keyword);
    }
  });

  return result;
};
