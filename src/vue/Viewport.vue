<template>
  <div id="container"></div>
</template>

<script>
import Atmosphere from '../models/Atmosphere.js';

var THREE         = require('three')
var OrbitControls = require('three-orbit-controls')(THREE)
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { TexturePass } from 'three/examples/jsm/postprocessing/TexturePass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';

import { Renderer } from '../models/SceneRenderer.js';

export default {
  mounted: function() {
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.01, 
      1000
    );
    new OrbitControls(camera);

    let sceneRenderer = new SceneRenderer();


    // Sun
    const sunGeometry = new THREE.SphereGeometry(0.5, 100, 100);
    const sunMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
    const sun         = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(30, 10, 5);

    // Planet
    const texture        = new THREE.TextureLoader().load('./earth_8k.jpg');
    const planetGeometry = new THREE.SphereGeometry(4.0, 100, 100);
    const planetMaterial = new THREE.MeshPhongMaterial({
      specular: 30.0, 
      map: texture
    });
    const planet         = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(0, 0, 0);

    const planet = new Planet({
      center: [],
      radius: 4.0,
      atmosphereParameters: {
        height:         0.25,
        densityFalloff: 5.0,
        strength:       5.0,
        scatterRGB:     [700, 530, 440]
      }
    });

    // Atmosphere
    const planetInfo = {
      center: new THREE.Vector3(),
      radius: 4.0,
      atmosphereHeight: 0.25,
      // atmosphereHeight: 3.0,
      densityFalloff: 5.0
    }
    const atmosphere       = new Atmosphere(planetInfo);
    atmosphere.scatterRGB  = [700.0, 530.0, 440.0];
    atmosphere.strength    = 5.0; 
    atmosphere.sunPosition = sun.position;

    const light = new THREE.DirectionalLight({color: 0xFFFFFF, intensity: 1.0});
    light.position.copy(sun.position);

    camera.position.z = 5;

    // Create scenes
    const scene = new THREE.Scene();
    scene.add(sun);
    scene.add(planet);
    scene.add(light);

    const atmosphereScene = new THREE.Scene();
    atmosphereScene.add(atmosphere.mesh);

    // Create renderer
    const renderer  = new THREE.WebGLRenderer({antialias: true});
    const glContext = renderer.getContext();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    document.getElementById("container").appendChild(renderer.domElement);

    const depthBuffer = new THREE.DepthTexture(window.innerWidth, window.innerHeight);
    const sceneRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter, 
      magFilter: THREE.NearestFilter,
      depthBuffer: depthBuffer
    });

    const composer = new EffectComposer(renderer);
    const copyPass = new TexturePass(sceneRenderTarget.texture);
    copyPass.renderToScreen = true;
    composer.addPass(copyPass);
    // composer.addPass(bloomPass);

    atmosphere.colorBuffer = sceneRenderTarget.texture;
    atmosphere.depthBuffer = depthBuffer;

    const animate = function() {
      setTimeout( function() {
        requestAnimationFrame(animate);
      }, 1000 / 60);

      // Scene pass (render to texture)
      glContext.enable(glContext.DEPTH_TEST);
      renderer.setRenderTarget(sceneRenderTarget);
      renderer.clear();
      renderer.render(scene, camera);
      
      // Blit pass (render to screen)
      glContext.disable(glContext.DEPTH_TEST);
      renderer.setRenderTarget(null);
      composer.render();

      // Atmosphere pass (render to screen)
      renderer.render(atmosphereScene, camera);
    }

    const onWindowResize = function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      atmosphere.resolution = [window.innerWidth, window.innerHeight];
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);

    animate();
  }
}
</script>

<style>
</style>
