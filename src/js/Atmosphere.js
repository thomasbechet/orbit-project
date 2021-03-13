var THREE = require('three')
import fragmentShaderSource from 'raw-loader!../assets/atmosphere.frag'
import vertexShaderSource from 'raw-loader!../assets/atmosphere.vert'

export class Atmosphere {
  #geometry;
  #material;
  #mesh;
  #scatterRGB;
  #strength;
  #planet;

  /**
   * Build a new atmosphere visual component.
   * 
   * @param {Planet} planet
   * @param {Object} parameters
   * @param {Object} parameters.height
   * @param {Object} [parameters.strength]
   * @param {Object} [parameters.densityFalloff]
   * @param {Object} [parameters.scatterRGB]
   */
  constructor(planet, parameters) {
    this.#planet = planet;

    this.#strength   = parameters.strength   ?? 10.0;
    this.#scatterRGB = parameters.scatterRGB ?? [700.0, 530.0, 440.0];

    const planetRadius     = planet.radius ?? 5.0;
    const atmosphereHeight = parameters.atmosphereHeight ?? 0.3;
    const densityFalloff   = parameters.densityFalloff   ?? 5.0;

    // Create material
    this.#material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        resolution:       {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
        planetCenter:     {value: this.#planet.center},
        planetRadius:     {value: planetRadius},
        atmosphereRadius: {value: planetRadius + atmosphereHeight},
        sunPosition:      {value: new THREE.Vector3(1.0, 0.0, 0.0)},
        scatterRGB:       {value: new THREE.Vector3(0.0, 0.0, 0.0)},
        densityFalloff:   {value: densityFalloff},
        colorBuffer:      {value: null},
        depthBuffer:      {value: null}
      },
      defines: {
        FLT_MAX: 10000.0,
        SCATTER_POINT_COUNT: 4,
        OPTICAL_DEPTH_POINT_COUNT: 4
      },
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource
    });

    // Create geometry
    this.#geometry = new THREE.SphereGeometry(1.0, 30, 30);
  
    // Create mesh
    this.#mesh = new THREE.Mesh(this.#geometry, this.#material);

    // Configure material scatterRGB
    this.updateScatterRGB(); 
  }

  get mesh() {
    return this.#mesh;
  }

  set sunPosition(position) {
    this.#material.uniforms.sunPosition.value = position;
  }

  set scatterRGB(value) {
    this.#scatterRGB = value;
    this.updateScatterRGB();
  }

  set strength(value) {
    this.#strength = value;
    this.updateScatterRGB();
  }

  set resolution(value) {
    this.#material.uniforms.resolution.value.x = value[0];
    this.#material.uniforms.resolution.value.y = value[1];
  }

  set depthBuffer(value) {
    this.#material.uniforms.depthBuffer.value = value;
  }

  set colorBuffer(value) {
    this.#material.uniforms.colorBuffer.value = value;
  }

  updateScatterRGB() {
    this.#material.uniforms.scatterRGB.value.x = Math.pow(400 / this.#scatterRGB[0], 4.0) * this.#strength;
    this.#material.uniforms.scatterRGB.value.y = Math.pow(400 / this.#scatterRGB[1], 4.0) * this.#strength;
    this.#material.uniforms.scatterRGB.value.z = Math.pow(400 / this.#scatterRGB[2], 4.0) * this.#strength;
  }
}