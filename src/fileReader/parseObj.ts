export const parseObj = ({
  objFile,
  mtlFile,
}: {
  objFile: string;
  mtlFile?: string;
}) => {
  // Индексы начинаются с 1, добавим фиктивные элементы в начало
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // тот же порядок, что и у индексов f
  const objVertexData = [objPositions, objTexcoords, objNormals];

  // Массивы для хранения данных, которые мы будем передавать в WebGL
  const webglVertexData: [number[], number[], number[]] = [[], [], []];

  // Массив для хранения индексов
  const indices: number[] = [];

  // Функция для добавления вершины в WebGL данные и индексов
  const addVertex = (vertex: string) => {
    const parts = vertex.split("/");
    parts.forEach((indexStr, i) => {
      if (!indexStr) return;
      const index = parseInt(indexStr, 10);
      const adjustedIndex =
        index >= 0 ? index : objVertexData[i].length + index;
      webglVertexData[i].push(...objVertexData[i][adjustedIndex]);
    });

    // Добавляем индекс в массив
    const index = webglVertexData[0].length / 3 - 1; // Индекс вершины
    indices.push(index);
  };

  // Функция для вычисления нормали для треугольной грани
  const computeNormal = (
    p1: number[],
    p2: number[],
    p3: number[],
  ): number[] => {
    // Вектор AB = B - A
    const AB = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    // Вектор AC = C - A
    const AC = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

    // Векторное произведение AB x AC
    const normal = [
      AB[1] * AC[2] - AB[2] * AC[1], // x
      AB[2] * AC[0] - AB[0] * AC[2], // y
      AB[0] * AC[1] - AB[1] * AC[0], // z
    ];

    // Нормализация нормали
    const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
    if (length === 0) return [0, 0, 0]; // Защита от деления на 0
    return [normal[0] / length, normal[1] / length, normal[2] / length];
  };

  // Обработчики для различных ключевых слов
  const keywords: Record<string, (parts: string[]) => void> = {
    v: (parts) => objPositions.push(parts.map(parseFloat)),
    vn: (parts) => objNormals.push(parts.map(parseFloat)),
    vt: (parts) => objTexcoords.push(parts.map(parseFloat)),
    f: (parts) => {
      // Для каждой грани создаем треугольники
      const numTriangles = parts.length - 2;
      for (let i = 0; i < numTriangles; i++) {
        // Индексы для трех вершин треугольника
        const v1 = parts[0].split("/").map(Number);
        const v2 = parts[i + 1].split("/").map(Number);
        const v3 = parts[i + 2].split("/").map(Number);

        // Извлекаем только позиции (первые элементы в индексе)
        const p1 = objPositions[v1[0]];
        const p2 = objPositions[v2[0]];
        const p3 = objPositions[v3[0]];

        // Если нормали не были заданы в файле, вычисляем их
        let normal: number[];
        if (v1[2] && v2[2] && v3[2]) {
          // Если нормали есть в файле (предполагаем, что это индексы нормалей)
          normal = [
            objNormals[v1[2]][0],
            objNormals[v1[2]][1],
            objNormals[v1[2]][2],
          ];
        } else {
          // Иначе вычисляем нормаль для грани
          normal = computeNormal(p1, p2, p3);
        }

        // Добавляем вершины и нормали в данные WebGL
        addVertex(parts[0]); // Первый индекс вершины
        addVertex(parts[i + 1]); // Второй индекс вершины
        addVertex(parts[i + 2]); // Третий индекс вершины

        // Добавляем нормаль для каждой вершины
        webglVertexData[2].push(...normal); // Добавляем нормаль для каждой вершины
        webglVertexData[2].push(...normal); // Повторяем для второй вершины
        webglVertexData[2].push(...normal); // Повторяем для третьей вершины
      }
    },
  };

  // Регулярное выражение для поиска ключевых слов
  const keywordRE = /(\w+)(?:\s*(.*))?/;
  const lines = objFile.split("\n").map((line) => line.trim());

  // Основной цикл обработки строк
  lines.forEach((line) => {
    if (!line || line.startsWith("#")) return;

    const match = keywordRE.exec(line);
    if (!match) return;

    const [, keyword, args] = match;
    const handler = keywords[keyword];
    if (handler) {
      const parts = args ? args.split(/\s+/) : [];
      handler(parts);
    } else {
      console.warn("Необработанное ключевое слово: ", keyword);
    }
  });

  return {
    position: webglVertexData[0],
    texcoord: webglVertexData[1],
    normals: webglVertexData[2],
    indices: indices, // Добавляем массив индексов
  };
};
