var THREE = require('three')

export default {
  buildQuadGeometry: function() {
    return new THREE.SphereGeometry(1.0, 30, 30);
  },
  material: function(planetInfo) {
    return {
      transparent: true,
      uniforms: {
        resolution:       {value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
        planetCenter:     {value: planetInfo.center},
        planetRadius:     {value: planetInfo.radius},
        atmosphereRadius: {value: planetInfo.radius + planetInfo.atmosphereHeight},
        sunPosition:      {value: new THREE.Vector3(1.0, 0.0, 0.0)},
        scatterRGB:       {value: new THREE.Vector3(0.0, 0.0, 0.0)},
        densityFalloff:   {value: planetInfo.densityFalloff}
      },
      defines: {
        FLT_MAX: 10000.0,
        SCATTER_POINT_COUNT: 5,
        OPTICAL_DEPTH_POINT_COUNT: 5
      },
      vertexShader: `
        uniform float atmosphereRadius;

        varying vec4 vertexWorldPosition;

        void main() {
          vertexWorldPosition = modelMatrix * vec4(position * atmosphereRadius, 1.0);
          gl_Position = projectionMatrix * viewMatrix * vertexWorldPosition;
        }
      `,
      fragmentShader: `
        uniform vec2  resolution;
        uniform vec3  planetCenter;
        uniform float planetRadius;
        uniform float atmosphereRadius;
        uniform vec3  sunPosition;
        uniform vec3  scatterRGB;
        uniform float densityFalloff;

        varying vec4 vertexWorldPosition;

        vec2 raySphere(
          in vec3 rayOrigin,
          in vec3 rayDirection,
          in vec3 sphereCenter, 
          in float sphereRadius
        ) {
          vec3 offset = rayOrigin - sphereCenter;
          float a = 1.0; // dot(rayDirection, rayDirection);
          float b = 2.0 * dot(offset, rayDirection);
          float c = dot(offset, offset) - sphereRadius * sphereRadius;
          float d = b * b - 4.0 * a * c; // Discriminant from quadratic formula

          // d < 0 => 0 point
          // d = 1 => 1 point
          // d > 0 => 2 points
          if (d > 0.0) {
            float s = sqrt(d);
            float dstToSphereNear = max(0.0, (-b - s) / (2.0 * a));
            float dstToSphereFar  = (-b + s) / (2.0 * a);

            // Ignore intersections behind the ray
            if (dstToSphereFar >= 0.0) {
              return vec2(dstToSphereNear, dstToSphereFar - dstToSphereNear);
            }
          }

          // No intersection
          return vec2(FLT_MAX, 0.0);
        }

        float densityAtPoint(
          in vec3 densitySamplePoint
        ) {
          float heightAboveSurface = length(densitySamplePoint - planetCenter) - planetRadius;
          float height01           = heightAboveSurface / (atmosphereRadius - planetRadius);
          float localDensity       = exp(-height01 * densityFalloff) * (1.0 - height01);
          return localDensity;
        }

        float opticalDepth(
          in vec3 rayOrigin,
          in vec3 rayDirection,
          in float rayLength
        ) {
          vec3 densitySamplePoint = rayOrigin;
          float stepSize          = rayLength / float(OPTICAL_DEPTH_POINT_COUNT - 1);
          float opticalDepth      = 0.0;

          for (int i = 0; i < OPTICAL_DEPTH_POINT_COUNT; i++) {
            float localDensity  = densityAtPoint(densitySamplePoint);
            opticalDepth       += localDensity * stepSize;
            densitySamplePoint += rayDirection * stepSize;
          }

          return opticalDepth;
        }

        vec3 calculateLight(
          in vec3 rayOrigin,
          in vec3 rayDirection,
          in float rayLength,
          in vec3 originalColor
        ) {
          vec3 dirToSun             = normalize(sunPosition - planetCenter);
          vec3 scatterPoint         = rayOrigin;
          float stepSize            = rayLength / float(SCATTER_POINT_COUNT - 1);
          vec3 scatterLight         = vec3(0.0, 0.0, 0.0);
          
          for (int i = 0; i < SCATTER_POINT_COUNT; i++) {
            float sunRayLength        = raySphere(scatterPoint, dirToSun, planetCenter, atmosphereRadius).y;
            float sunRayOpticalDepth  = opticalDepth(scatterPoint, dirToSun, sunRayLength);
            float viewRayOpticalDepth = opticalDepth(scatterPoint, -rayDirection, stepSize * float(i));
            float localDensity        = densityAtPoint(scatterPoint);
            vec3 transmittance        = exp(-(sunRayOpticalDepth + viewRayOpticalDepth) * scatterRGB);

            // scatterLight += localDensity * stepSize * transmittance * vec3(0.10662, 0.324441564, 0.6830134);
            scatterLight += localDensity * stepSize * transmittance * scatterRGB;
            scatterPoint += rayDirection * stepSize;
          }

          // float originalColorTransmittance = exp(-viewRayOpticalDepth);
          // return originalColorTransmittance * originalColor + scatterLight;

          return scatterLight;
        }

        void main() {
          vec3 rayOrigin    = cameraPosition;
          vec3 rayDirection = normalize(vertexWorldPosition.xyz - cameraPosition);

          vec2 planetHitInfo     = raySphere(rayOrigin, rayDirection, planetCenter, planetRadius);
          vec2 atmosphereHitInfo = raySphere(rayOrigin, rayDirection, planetCenter, atmosphereRadius);

          float dstToAtmosphere      = atmosphereHitInfo.x;
          float dstThroughAtmosphere = min(atmosphereHitInfo.y, planetHitInfo.x - dstToAtmosphere);

          if (dstThroughAtmosphere > 0.0) {
            const float epsilon    = 0.0001;
            vec3 pointInAtmosphere = rayOrigin + rayDirection * (dstToAtmosphere + epsilon);
            vec3 light             = calculateLight(pointInAtmosphere, rayDirection, dstThroughAtmosphere - epsilon * 2.0, vec3(0, 0, 0));
          
            gl_FragColor = vec4(light, 1.0);
          } else {
            gl_FragColor = vec4(0, 0, 0, 1);
          }          
        }
      `
    }
  }
  
}