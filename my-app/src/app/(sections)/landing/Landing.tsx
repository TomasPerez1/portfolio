"use client";

import Spline from "@splinetool/react-spline";

export default function Landing() {
  const getCanvas = async () => {
    const canvas = document.getElementsByTagName("canvas")[0];
    const gl = canvas.getContext("webgl2");
    console.log(gl);
    const width = canvas.width;
    const height = canvas.height;
    const fov = 45; // Ángulo de visión de la cámara (en grados)
    const aspectRatio = width / height;
    const near = 0.1; // Plano cercano
    const far = 1000; // Plano lejano

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      console.log(vendor, renderer);
    }
    // console.log("RENDERER", gl.getParameter(gl.PRENDERER));
    // console.log("VENDOR", gl.getParameter(gl.VENDOR));

    // console.log(gl);
    // const texture = gl.getParameter(gl.TEXTURE_BINDING_2D);
    // console.log("texture", texture);
    // if (texture) {
    //   const width = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WIDTH);
    //   const height = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_HEIGHT);
    //   console.log("Texture dimensions:", { width, height });

    //   const wrapS = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S);
    //   const wrapT = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T);
    //   const minFilter = gl.getTexParameter(
    //     gl.TEXTURE_2D,
    //     gl.TEXTURE_MIN_FILTER,
    //   );
    //   const magFilter = gl.getTexParameter(
    //     gl.TEXTURE_2D,
    //     gl.TEXTURE_MAG_FILTER,
    //   );

    //   console.log("Texture parameters:", {
    //     wrapS,
    //     wrapT,
    //     minFilter,
    //     magFilter,
    //   });
    // } else {
    //   console.log("No texture bound to TEXTURE_2D.");
    // }
    // const a = await fetch(
    //   "https://prod.spline.design/RwbkyO8LXGVxotsj/scene.splinecode",
    // );
    // console.log("data", a.body);
    // const camera = gl.getParameter(gl.VIEWPORT);
    // console.log(camera);
  };

  return (
    <section
      id="about-me"
      className="min-h-screen w-full border-2 border-yellow-400 flex flex-col justify-between"
    >
      {/* <article className="text-center">
        <span className="border-2">
          <h1 className="text-8xl">
            Tomas <br /> Perez
          </h1>
          <h2 className="text-2xl text-[#cda3ff]">FULL STACK DEVELOPER</h2>
        </span>
      </article> */}
      <button
        onClick={getCanvas}
        className="border-2 w-fit bg-blue-600 text-white text-2xl"
      >
        GET CANVAS
      </button>
      <div className="flex gap-10">
        <div className="w-fit border-2 border-red-500">
          <Spline
            scene="https://prod.spline.design/RwbkyO8LXGVxotsj/scene.splinecode"
            width={1080}
            height={1080}
          />
        </div>
        <div className="border-2 border-red-500 w-[420px] h-[420px]">
          <h1>Soy el three js</h1>
        </div>
      </div>

      {/* <div className="w-fit mx-auto mb-8 animate-bounce ">
        <p className="text-5xl ">👇</p>
      </div> */}
    </section>
  );
}
