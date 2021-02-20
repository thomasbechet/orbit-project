<template>
  <div id="container" class="myclass"></div>
</template>

<script>
import {Component, Vue} from 'vue-class-component';
import atmosphereShader from '../assets/atmosphere-shaders.js';

var THREE         = require('three')
var OrbitControls = require('three-orbit-controls')(THREE)

@Component
export default class Viewport extends Vue {
  mounted() {
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    new OrbitControls(camera);

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);

    const planetInfo = {
      center: new THREE.Vector3(),
      radius: 2.0,
      atmosphereHeight: 0.3,
      densityFalloff: 2.0
    }

    const sunGeometry = new THREE.SphereGeometry(0.5, 100, 100);
    const sunMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(30, 0, 0);

    const setScatterRGB = function(material, r, g, b, scatterStrength) {
      material.uniforms.scatterRGB.value.x = Math.pow(400 / r, 4.0) * scatterStrength;
      material.uniforms.scatterRGB.value.y = Math.pow(400 / g, 4.0) * scatterStrength;
      material.uniforms.scatterRGB.value.z = Math.pow(400 / b, 4.0) * scatterStrength;
    }

    const quadGeometry = atmosphereShader.buildQuadGeometry();
    const quadMaterial = new THREE.ShaderMaterial(atmosphereShader.material(planetInfo));
    setScatterRGB(quadMaterial, 700.0, 530.0, 440.0, 10.0);
    quadMaterial.uniforms.sunPosition.value = sun.position;
    const quad = new THREE.Mesh(quadGeometry, quadMaterial);
    

    // scene.add(planet);
    scene.add(sun);
    scene.add(quad);

    const light = new THREE.DirectionalLight(0xFFFFFF, 0.9);
    light.position.x = 4;
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
    scene.add(light);
    scene.add(ambientLight);

    camera.position.z = 5;

    const animate = function() {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    const onWindowResize = function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      quadMaterial.uniforms.resolution.value.x = window.innerWidth;
      quadMaterial.uniforms.resolution.value.y = window.innerWidth;
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    animate();
  }
}
</script>

<style scoped>
  #myclass {
    margin: 0;
  }
</style>
