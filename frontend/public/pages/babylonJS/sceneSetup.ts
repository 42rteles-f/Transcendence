import * as BABYLON from 'babylonjs';

// block WEBGL_debug_renderer_info so Firefox never warns
(() => {
  const wrap = (proto: any) => {
    if (!proto || !proto.getExtension) return;
    const orig = proto.getExtension;
    proto.getExtension = function (name: string, ...rest: any[]) {
      if (name === 'WEBGL_debug_renderer_info' || name === 'MOZ_WEBGL_debug_renderer_info') {
        return null; // pretend the extension doesn't exist
      }
      return orig.call(this, name, ...rest);
    };
  };

  wrap((window as any).WebGLRenderingContext?.prototype);
  wrap((window as any).WebGL2RenderingContext?.prototype);
})();


export function createEngine(canvas: HTMLCanvasElement): BABYLON.Engine {
	if (!canvas)
			//("No canvas")
	const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, antialias: true });
	window.addEventListener('resize', () => { engine.resize(); });
	return engine;
}

export function createScene(engine: BABYLON.Engine): BABYLON.Scene {
	if (!engine)
		//("No engine");
	const scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color4(0.02, 0.02, 0.05, 1);
	return scene;
}

export function setupCamera(scene: BABYLON.Scene): BABYLON.UniversalCamera {
	const cameraPos = new BABYLON.Vector3(0, 0, -10);
	const cameraLookAt = new BABYLON.Vector3(0, 0, 0);

	const camera = new BABYLON.UniversalCamera( "camera", cameraPos, scene);
	camera.setTarget(cameraLookAt);
	camera.fov = 1.5;
	//camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
	return camera;
}

export function setupLighting(scene: BABYLON.Scene): void {
	const dirLightDir = new BABYLON.Vector3(-0.5, -1, 0.5);
	const dirLight = new BABYLON.DirectionalLight( "dirLight", dirLightDir, scene );
	dirLight.intensity = 0.8;
	dirLight.position = new BABYLON.Vector3(5, 10, -5);
	
	const envLightDir = new BABYLON.Vector3(0, 1, 0);
	const envLight = new BABYLON.HemisphericLight('hemiLight',envLightDir , scene);
	envLight.intensity = 0.3;
	envLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);
}

export function startRenderLoop(engine: BABYLON.Engine, scene: BABYLON.Scene): void {
	engine.runRenderLoop(() => { scene.render();});
}