const INTERPOLATION = 0.7; // Степень интерполяции

export const rotateHandler = ({
  canvas,
  currentAngle,
  draw,
}: {
  canvas: HTMLCanvasElement;
  currentAngle: [number, number];
  draw: () => void;
}) => {
  const targetAngle: [number, number] = [...currentAngle];

  let dragging = false; // Вращать или нет
  let lastX = -1;
  let lastY = -1;
  let animationFrameId: number | null = null;

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

  const stopAnimation = () => {
    dragging = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  canvas.onmouseup = stopAnimation;
  canvas.onmouseleave = stopAnimation;

  const animateRotation = () => {
    const diffX = Math.abs(targetAngle[0] - currentAngle[0]);
    const diffY = Math.abs(targetAngle[1] - currentAngle[1]);

    if (diffX >= 1 || diffY >= 1) {
      currentAngle[0] += (targetAngle[0] - currentAngle[0]) * INTERPOLATION;
      currentAngle[1] += (targetAngle[1] - currentAngle[1]) * INTERPOLATION;

      draw();

      animationFrameId = requestAnimationFrame(animateRotation);
    } else {
      animationFrameId = null;
    }
  };

  canvas.onmousemove = (ev) => {
    if (!dragging) return;

    const x = ev.clientX;
    const y = ev.clientY;
    const factor = 200 / canvas.height; // Скорость вращения
    const dx = factor * (x - lastX);
    const dy = factor * (y - lastY);

    targetAngle[0] = Math.max(Math.min(targetAngle[0] + dy, 90), -90);
    targetAngle[1] += dx;

    lastX = x;
    lastY = y;

    if (animationFrameId === null) {
      animationFrameId = requestAnimationFrame(animateRotation);
    }
  };
};
