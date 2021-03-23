var THREE = require('three');

export class Planet {
	#center;
	#radius;
  #mesh;

	/**
	 * Build a new planet visual component.
	 * 
	 * @param {Object} parameters 
	 * @param {Object} parameters.center
	 * @param {Object} parameters.radius
   * @param {Object} parameters.texturePath
	 */
	constructor(parameters) {
		this.#center = new THREE.Vector3().fromArray(parameters.center);
		this.#radius = parameters.radius;

    const texture        = new THREE.TextureLoader().load(parameters.texturePath);
    const planetGeometry = new THREE.SphereGeometry(parameters.radius, 100, 100);
    const planetMaterial = new THREE.MeshPhongMaterial({
      specular: 30.0,
      map: texture
    });
    this.#mesh = new THREE.Mesh(planetGeometry, planetMaterial);
    this.#mesh.position.copy(this.#center);
	}

	get center() {
		return this.#center;
	}

  get radius() {
    return this.#radius;
  }

	get mesh() {
    return this.#mesh;
	}
}