export const createProgram = ({
  gl,
  vertexShader,
  fragmentShader,
}: {
  gl: WebGL2RenderingContext;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
}) => {
  // 4. Создание объекта программы
  const program = gl.createProgram();
  if (!program) return;

  // 5. Подключение шейдеров к программе
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  // 6. Компонует объект программы
  gl.linkProgram(program);

  const programCompiled = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (!programCompiled) {
    const error = gl.getProgramInfoLog(program);
    console.error(`Ошибка компоновки программы: ${error}`);
    gl.deleteProgram(program);

    return;
  }

  // 7. Сообщает что объект программы готов к использованию
  gl.useProgram(program);

  return program;
};
