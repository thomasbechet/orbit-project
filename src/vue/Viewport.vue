<template>
  <div id="container"></div>
</template>

<script>
var THREE         = require('three')
var OrbitControls = require('three-orbit-controls')(THREE)

import { SceneRenderer } from '../js/SceneRenderer.js';

export default {
  mounted: function() {
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50, 
      window.innerWidth / window.innerHeight, 
      0.01, 
      1100
    );
    camera.position.z = 5;
    new OrbitControls(camera);

    // Create scene
    const sceneRenderer = new SceneRenderer(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(sceneRenderer.domElement);
    
    // Add a planet
    sceneRenderer.addPlanet({
      center: [0, 0, 0],
      radius: 3.0,
      texturePath: './earth_8k.jpg',
      atmosphere: {
        height:         0.3,
        densityFalloff: 5.0,
        strength:       5.0,
        scatterRGB:     [700, 530, 440]
      }
    });

    // Set sun position
    sceneRenderer.sunPosition = [1000, 10, 5];

    const animate = function() {
      setTimeout( function() {
        requestAnimationFrame(animate);
      }, 1000 / 30);

      sceneRenderer.render(camera);
    }

    const onWindowResize = function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      sceneRenderer.resolution = [window.innerWidth, window.innerHeight];
    }

    window.addEventListener('resize', onWindowResize, false);

    animate();
  }
}
</script>

<style>
</style>
