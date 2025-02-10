export const rotateHandler = ({
  canvas,
  currentAngle,
  draw,
}: {
  canvas: HTMLCanvasElement;
  currentAngle: [number, number];
  draw: () => void;
}) => {
  const targetAngle: [number, number] = [0, 0];

  let dragging = false; // Вращать или нет
  let lastX = -1;
  let lastY = -1;

  canvas.onmousedown = (ev) => {
    const x = ev.clientX;
    const y = ev.clientY;
    const rect = canvas.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x;
      lastY = y;
      dragging = true;
    }
  };

  canvas.onmouseup = () => {
    dragging = false;
  };
  canvas.onmouseleave = () => {
    dragging = false;
  };

  // Квадратичные параметры для кубической интерполяции
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  canvas.onmousemove = (ev) => {
    const x = ev.clientX;
    const y = ev.clientY;

    if (dragging) {
      const factor = 200 / canvas.height; // Скорость вращения
      const dx = factor * (x - lastX);
      const dy = factor * (y - lastY);
      // Ограничить угол поворота по оси X от -90 до 90 градусов
      targetAngle[0] = Math.max(Math.min(targetAngle[0] + dy, 90), -90);
      targetAngle[1] += dx;

      const interpolationFactor = 0.5; // Степень интерполяции
      currentAngle[0] +=
        (targetAngle[0] - currentAngle[0]) *
        easeInOutCubic(interpolationFactor);
      currentAngle[1] +=
        (targetAngle[1] - currentAngle[1]) *
        easeInOutCubic(interpolationFactor);

      draw();
    }

    lastX = x;
    lastY = y;
  };
};
