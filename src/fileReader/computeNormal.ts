// Функция для вычисления нормали для треугольной грани
export function computeNormal({
  p1,
  p2,
  p3,
}: {
  p1: number[];
  p2: number[];
  p3: number[];
}): [number, number, number] {
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
}
