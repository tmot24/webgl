export function getAnimateAngle({
  angle,
  time,
  lastTime,
  angleStep = 20,
}: {
  angle: number;
  time: DOMHighResTimeStamp;
  lastTime: DOMHighResTimeStamp; // Последний раз, когда эта функция была вызвана
  angleStep?: number; // Угол поворота (градусы/секунду)
}) {
  const elapsed = time - lastTime; // Вычисляем прошедшее время
  lastTime = time;

  // Обновляем текущий угол поворота
  const newAngle = angle + (angleStep * elapsed) / 1000.0;

  return {
    angle: newAngle % 360,
    lastTime,
  };
}
