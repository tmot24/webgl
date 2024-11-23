import { useEffect, useRef } from "react";

const HEIGHT = 100;
const WIDTH = 100;

export const Fps = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    if (!ref.current) return;

    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 0;
    const tick = () => {
      const now = performance.now();
      frameCount++;

      // Если прошла 1 секунда (1000 мс), обновляем FPS
      if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;

        // Очистить canvas
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Настройка для фона текста
        const text = "FPS: " + fps;
        ctx.font = '18px "Times New Roman"';
        const textWidth = ctx.measureText(text).width; // Измеряем ширину текста
        const textHeight = 18; // Высота текста (в зависимости от шрифта)

        // Рисуем фон для текста (прямоугольник)
        if (fps >= 45) {
          ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
        } else if (fps >= 30) {
          ctx.fillStyle = "rgba(255, 255, 0, 0.7)";
        } else {
          ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
        }
        ctx.fillRect(0, 0, textWidth + 10, textHeight + 4); // Добавляем отступы для фона

        // Нарисовать текст поверх фона
        ctx.fillStyle = "rgba(0, 0, 0, 1)"; // Белый цвет текста
        ctx.fillText(text, 5, 17); // Расположение текста с отступом от края фона
      }

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return (
    <canvas
      style={{ position: "absolute", top: 0, left: 0 }}
      width={WIDTH}
      height={HEIGHT}
      ref={ref}
    />
  );
};
