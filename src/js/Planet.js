export class Planet {
	#center;
	#radius;
	#atmosphere;

	/**
	 * Build a new planet visual component.
	 * 
	 * @param {Object} parameters 
	 * @param {Object} parameters.center
	 * @param {Object} parameters.radius
	 * @param {Object} parameters.atmosphereInfo
	 */
	constructor(parameters) {
		this.#center = parameters.center;
		this.#radius = parameters.radius;
		this.#atmosphere = parameters.atmosphere;
	}

	get center() {
		return this.#center;
	}
}