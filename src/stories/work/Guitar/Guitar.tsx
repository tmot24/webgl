import { memo, useEffect, useRef } from "react";
import vertexSource from "./shaders/vertex.vert?raw";
import fragmentSource from "./shaders/fragment.frag?raw";
import { mat4, vec3 } from "gl-matrix";
import { getRadianFromDegree } from "../../../common/getRadianFromDegree.ts";
import { getAnimateAngle } from "../../../common/getAnimateAngle.ts";
import { WebGL } from "../../../classes/WebGL.ts";
import { Program } from "../../../classes/Program.ts";
import { InitArrayBuffer } from "../../../classes/InitArrayBuffer.ts";
import { InitElementArrayBuffer } from "../../../classes/InitElementArrayBuffer.ts";
import { Fps } from "../../../fps/Fps.tsx";
import objFile from "../../../resources/guitar/V.obj?raw";
import mtlFile from "../../../resources/guitar/V.mtl?raw";
import { parseObjAndMtlForWebGLByGroup } from "../../../fileReader/parseObjAndMtlForWebGL.ts";

export const Guitar = memo(() => {
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

    const result = parseObjAndMtlForWebGLByGroup(objFile, mtlFile);

    console.log("result", result);

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

      for (let i = 0; i < 1; i++) {
        result.forEach(({ name, data }) => {
          const { vertexArray, normalArray, colorArray, indexArray } = data;

          const vertex = new InitArrayBuffer({
            gl,
            data: new Float32Array(vertexArray),
            num: 3,
          });
          const normal = new InitArrayBuffer({
            gl,
            data: new Float32Array(normalArray),
            num: 3,
          });
          const color = new InitArrayBuffer({
            gl,
            data: new Float32Array(colorArray),
            num: 4,
          });
          const index = new InitElementArrayBuffer({
            gl,
            data: new Uint8Array(indexArray),
          });

          const projectionMatrix = mat4.create();
          mat4.perspective(
            projectionMatrix,
            // getRadianFromDegree(30),
            radian,
            canvas.width / canvas.height,
            1,
            10000,
          );
          const viewMatrix = mat4.create();
          mat4.lookAt(
            viewMatrix,
            vec3.fromValues(1928.08 + 275, 1197.62, -13.04 + 600), // eye
            vec3.fromValues(1928.08, 1197.62, -13.04), // target
            vec3.fromValues(0, 1, 0), // up
          );
          const viewProjectionMatrix = mat4.create();
          mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

          gl.useProgram(instance.program);

          const modelMatrix = mat4.create();
          mat4.rotateY(modelMatrix, modelMatrix, getRadianFromDegree(45));

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
          instance.uniformMatrix4fv = {
            uniformName: "u_NormalMatrix",
            transpose: true,
            matrix4: normalMatrix,
          };

          instance.uniformMatrix4fv = {
            uniformName: "u_MvpMatrix",
            matrix4: mvpMatrix,
          };

          gl.drawElements(gl.TRIANGLES, index.count, index.type, 0);
        });
      }

      animationId.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      // // Удаление программы
      // instance.delete();
      // // Удаление буферов
      // vertex.delete();
      // normal.delete();
      // // color.delete();
      // index.delete();

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
