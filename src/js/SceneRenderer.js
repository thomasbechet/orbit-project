import { WebGLRenderTarget } from 'three';

var THREE = require('three');

export class SceneRenderer {
	// Visual components
	#atmospheres;
	#planets;
	#lights;

	// Scene attributes
	#scene;
	#atmosphereScene;

	// Rendering attributes
	#renderer;
	#GL;
	#depthBuffer;
	#sceneRenderTarget;
	#composer;

	constructor(width, height) {
		this.#atmospheres = new Array();
		this.#planets     = new Array();
		this.#lighs       = new Array();

		this.#scene           = new THREE.Scene();
		this.#atmosphereScene = new THREE.Scene();

		this.#renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		this.#renderer.setSize(width, height);
		this.#GL = this.#renderer.getContext();
		this.#depthBuffer = new THREE.DepthTexture(width, height);
		this.#sceneRenderTarget = new THREE.WebGLRenderTarget(
			width, height, {
			Filter: THREE.LinearFilter,
			magFilter: THREE.NearestFilter,
			depthBuffer: this.#depthBuffer
		});

		const copyPass = new TexturePass(this.#sceneRenderTarget.texture);
		copyPass.renderToScreen = true;
		this.#composer.addPass(copyPass);
		this.#composer = new EffectComposer(this.#renderer);
	}

	render(camera) {
		// Scene pass (render to texture)
		this.#GL.enable(this.#GL.DEPTH_TEST);
		this.#renderer.setRenderTarget(this.#sceneRenderTarget);
		this.#renderer.clear();
		this.#renderer.render(this.#scene, camera);

		// Blit pass (render to screen)
		this.#GL.disable(this.#GL.DEPTH_TEST);
		this.#renderer.setRenderTarget(null);
		this.#composer.render();

		// Atmosphere pass (render to screen)
		this.#renderer.render(this.#atmosphereScene, camera);
	}

	addPlanet(planet) {

		if (planet.atmosphere) {

		}
	}

	updateResolution(width, height) {
		this.#renderer.setSize(width, height);
	}

	get domElement() {
		return this.#renderer.domElement;
	}
}