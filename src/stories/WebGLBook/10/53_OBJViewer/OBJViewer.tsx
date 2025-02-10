import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { mat4, vec3 } from "gl-matrix";
import { getRadianFromDegree } from "../../../../common/getRadianFromDegree.ts";
import { getAnimateAngle } from "../../../../common/getAnimateAngle.ts";
import { WebGL } from "../../../../classes/WebGL.ts";
import { Program } from "../../../../classes/Program.ts";
import { InitArrayBuffer } from "../../../../classes/InitArrayBuffer.ts";
import { InitElementArrayBuffer } from "../../../../classes/InitElementArrayBuffer.ts";
import { Fps } from "../../../../fps/Fps.tsx";
import objFile from "../../../../resources/cube.obj?raw";
import mtlFile from "../../../../resources/cube.mtl?raw";
import { OBJParser } from "../../../../fileReader/parseObjFile.ts";

export const OBJViewer = memo(() => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const context = new WebGL(ref.current);
    const { gl, canvas } = context;

    const instance = new Program({
      gl,
      vertexSource: vertexSource,
      fragmentSource: fragmentSource,
    });

    const result = OBJParser({
      objFile,
      mtlFiles: {
        "cube.mtl": mtlFile,
      },
    });

    const { webGLData, indices, colors } = result[0];
    const [position, , normals] = webGLData;

    const vertex = new InitArrayBuffer({
      gl,
      data: new Float32Array(position),
      num: 3,
    });
    const normal = new InitArrayBuffer({
      gl,
      data: new Float32Array(normals),
      num: 3,
    });
    const color = new InitArrayBuffer({
      gl,
      data: new Float32Array(colors),
      num: 4,
    });
    const index = new InitElementArrayBuffer({
      gl,
      data: new Uint8Array(indices),
    });

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
      vec3.fromValues(10, 10, 10),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(0, 1, 0),
    );
    const viewProjectionMatrix = mat4.create();
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

    gl.useProgram(instance.program);

    let currentAngle = 0;
    let currentLastTime: DOMHighResTimeStamp = 0;
    const tick = (time: DOMHighResTimeStamp = 0) => {
      const { angle, lastTime } = getAnimateAngle({
        angle: currentAngle,
        time,
        lastTime: currentLastTime,
      });

      currentAngle = angle;
      currentLastTime = lastTime;
      const radian = getRadianFromDegree(currentAngle);

      context.clear();

      const modelMatrix = mat4.create();
      mat4.rotateY(modelMatrix, modelMatrix, radian);

      const mvpMatrix = mat4.create();
      mat4.multiply(mvpMatrix, viewProjectionMatrix, modelMatrix);

      // Координаты вершин
      vertex.initAttributeVariable({
        attributeName: "a_Position",
        program: instance.program,
      });
      // Координаты нормали
      normal.initAttributeVariable({
        attributeName: "a_Normal",
        program: instance.program,
      });
      // Цвет
      color.initAttributeVariable({
        attributeName: "a_Color",
        program: instance.program,
      });
      // Индексы привязки
      index.initBuffer();

      const normalMatrix = mat4.create();
      // Вычислить матрицу преобразования для нормалей;
      mat4.invert(normalMatrix, modelMatrix);
      // Передать матрицу преобразования для нормалей в u_NormalMatrix (необходимо транспонировать)
      instance.uniformMatrix4fv({
        uniformName: "u_NormalMatrix",
        transpose: true,
        matrix4: normalMatrix,
      });

      instance.uniformMatrix4fv({
        uniformName: "u_MvpMatrix",
        matrix4: mvpMatrix,
      });

      gl.drawElements(gl.TRIANGLES, index.count, index.type, 0);

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      // Удаление программы
      instance.delete();
      // Удаление буферов
      vertex.delete();
      normal.delete();
      color.delete();
      index.delete();

      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return (
    <>
      <canvas width={500} height={500} ref={ref} />
      <Fps />
    </>
  );
});
