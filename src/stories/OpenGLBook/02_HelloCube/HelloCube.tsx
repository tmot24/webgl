import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { mat4, vec3 } from "gl-matrix";
import { Fps } from "../../../fps/Fps.tsx";
import { getRadianFromDegree } from "../../../common/getRadianFromDegree.ts";
import { indicesData, colorsData, verticesData } from "./data.ts";
import { InitArrayBuffer } from "../../../classes/InitArrayBuffer.ts";
import { InitElementArrayBuffer } from "../../../classes/InitElementArrayBuffer.ts";
import { WebGL } from "../../../classes/WebGL.ts";
import { Program } from "../../../classes/Program.ts";
import { rotateHandler } from "../../../common/rotateHandler.ts";

export const HelloCube = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = new WebGL(ref.current);

    const { gl, canvas } = context;
    const instance = new Program({
      gl,
      vertexSource: vertexSource,
      fragmentSource: fragmentSource,
    });

    if (!instance.program) return;

    const vertex = new InitArrayBuffer({
      gl,
      data: verticesData,
      num: 3,
    });
    const color = new InitArrayBuffer({
      gl,
      data: colorsData,
      num: 3,
    });
    const index = new InitElementArrayBuffer({
      gl,
      data: indicesData,
    });

    vertex.initAttributeVariable({
      attributeName: "a_Position",
      program: instance.program,
    });
    color.initAttributeVariable({
      attributeName: "a_Color",
      program: instance.program,
    });
    index.initBuffer();

    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      getRadianFromDegree(30),
      canvas.width / canvas.height,
      1,
      100,
    );

    const viewMatrix = mat4.create();
    mat4.lookAt(
      viewMatrix,
      vec3.fromValues(3, 3, 7),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );

    const baseMvpMatrix = mat4.create();
    mat4.multiply(baseMvpMatrix, projectionMatrix, viewMatrix);

    const currentAngle: [number, number] = [0, 0];

    rotateHandler({
      canvas,
      currentAngle,
      draw: () =>
        draw({ context, index, instance, baseMvpMatrix, currentAngle }),
    });

    draw({
      context,
      index,
      instance,
      baseMvpMatrix,
      currentAngle,
    });

    return () => {
      // Удаление программы
      instance.delete();
      // Удаление буферов
      vertex.delete();
      color.delete();
      index.delete();
      // Удаление обработчиков событий
      canvas.onmousedown = null;
      canvas.onmousemove = null;
      canvas.onmouseup = null;
      canvas.onmouseleave = null;
    };
  }, []);

  return (
    <>
      <canvas width={800} height={600} ref={ref} />
      <Fps />
    </>
  );
});

function draw({
  context,
  instance,
  index,
  baseMvpMatrix,
  currentAngle,
}: {
  context: WebGL;
  instance: Program;
  index: InitElementArrayBuffer;
  baseMvpMatrix: mat4;
  currentAngle: [number, number];
}) {
  const { gl } = context;

  const mvpMatrix = mat4.create();
  mat4.copy(mvpMatrix, baseMvpMatrix); // Обновляем mvpMatrix перед вращениями

  mat4.rotateX(mvpMatrix, mvpMatrix, getRadianFromDegree(currentAngle[0]));
  mat4.rotateY(mvpMatrix, mvpMatrix, getRadianFromDegree(currentAngle[1]));

  instance.uniformMatrix4fv({
    uniformName: "u_MvpMatrix",
    matrix4: mvpMatrix,
  });

  context.clear();
  gl.drawElements(gl.TRIANGLES, index.count, index.type, 0);
}
