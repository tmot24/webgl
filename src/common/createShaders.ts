// Создаем шейдеры
export const createShaders = ({
  gl,
  vertexSource,
  fragmentSource,
}: {
  gl: WebGL2RenderingContext;
  vertexSource: string;
  fragmentSource: string;
}) => {
  // 1. Создание объекта шейдеров
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return;

  // 2. Привязать шейдеры
  gl.shaderSource(vertexShader, vertexSource);
  gl.shaderSource(fragmentShader, fragmentSource);
  // 3. Компиляция шейдеров
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  const vertexShaderCompiled = gl.getShaderParameter(
    vertexShader,
    gl.COMPILE_STATUS,
  );
  const fragmentShaderCompiled = gl.getShaderParameter(
    fragmentShader,
    gl.COMPILE_STATUS,
  );

  if (!vertexShaderCompiled) {
    const error = gl.getShaderInfoLog(vertexShader);
    console.error(`Ошибка компиляции вершинного шейдера: ${error}`);
    gl.deleteShader(vertexShader);

    return;
  }
  if (!fragmentShaderCompiled) {
    const error = gl.getShaderInfoLog(fragmentShader);
    console.error("Ошибка компиляции фрагментного шейдера: " + error);
    gl.deleteShader(fragmentShader);

    return;
  }

  return {
    vertexShader,
    fragmentShader,
  };
};
