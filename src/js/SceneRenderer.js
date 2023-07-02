import { Atmosphere } from './Atmosphere';
import { Planet } from './Planet';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';

var THREE = require('three');

export class SceneRenderer {
	// Visual components
	#atmospheres;
	#planets;
	#lightSource;
	#sunMesh;

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
		// Initialize data
		this.#atmospheres = new Array();
		this.#planets = new Array();

		this.#scene = new THREE.Scene();
		this.#atmosphereScene = new THREE.Scene();

		// Create light source and sun
		this.#sunMesh = new THREE.Mesh(
			new THREE.SphereGeometry(10, 100, 100),
			new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
		);
		this.#scene.add(this.#sunMesh);

		this.#lightSource = new THREE.DirectionalLight({ color: 0xFFFFFF, intensity: 1.0 });
		this.#lightSource.position.set(0, 0, 0);
		this.#scene.add(this.#lightSource);

		// Create line
		const points = [];
		const subdivision = 200;
		const radius = 4;
		for (let i = 0; i <= subdivision; i++) {
			let angle = (i / subdivision) * Math.PI * 2;
			points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
		}
		const line = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints(points),
			new THREE.LineBasicMaterial({ color: 0xFFFFFF, linewidth: 10 })
		);
		this.#scene.add(line);

		// Create renderer
		this.#renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		this.#renderer.setSize(width, height);
		this.#renderer.autoClear = false;
		this.#GL = this.#renderer.getContext();
		this.#depthBuffer = new THREE.DepthTexture(width, height);
		this.#sceneRenderTarget = new THREE.WebGLMultisampleRenderTarget(
			width, height, {
			Filter: THREE.LinearFilter,
			magFilter: THREE.NearestFilter,
			depthBuffer: this.#depthBuffer
		});

		const copyPass = new TexturePass(this.#sceneRenderTarget.texture);
		copyPass.renderToScreen = true;
		this.#composer = new EffectComposer(this.#renderer);
		this.#composer.addPass(copyPass);
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

	updateResolution(resolution) {
		this.#renderer.setSize(resolution.x, resolution.y);
		this.#sceneRenderTarget.setSize(resolution.x, resolution.y);
		this.#atmospheres.forEach((atmosphere) => {
			atmosphere.resolution = resolution;
		});
	}

	addPlanet(parameters) {
		const planet = new Planet(parameters);
		this.#planets.push(planet);
		this.#scene.add(planet.mesh);

		if (parameters.atmosphere) {
			const atmosphere = new Atmosphere(planet, parameters.atmosphere);
			atmosphere.colorBuffer = this.#sceneRenderTarget.texture;
			atmosphere.depthBuffer = this.#depthBuffer;
			atmosphere.resolution = new THREE.Vector2(
				this.#sceneRenderTarget.texture.image.width,
				this.#sceneRenderTarget.texture.image.height
			);
			atmosphere.sunPosition = this.#sunMesh.position;
			this.#atmospheres.push(atmosphere);
			this.#atmosphereScene.add(atmosphere.mesh);
		}
	}

	set sunPosition(value) {
		this.#lightSource.position.copy(new THREE.Vector3().fromArray(value));
		this.#sunMesh.position.copy(new THREE.Vector3().fromArray(value));
	}

	set resolution(value) {
		this.updateResolution(new THREE.Vector2().fromArray(value));
	}

	get domElement() {
		return this.#renderer.domElement;
	}
}