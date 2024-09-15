export const get2dCoordinates = ({
  ev,
  canvas,
}: {
  ev: MouseEvent;
  canvas: HTMLCanvasElement;
}) => {
  const target = ev.target as HTMLCanvasElement;
  const rect = target.getBoundingClientRect();
  const x = (ev.clientX - rect.left - canvas.width / 2) / (canvas.width / 2);
  const y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);

  return {
    x,
    y,
  };
};
