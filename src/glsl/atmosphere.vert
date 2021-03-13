uniform float atmosphereRadius;

varying vec4 vertexWorldPosition;

void main() {
    vertexWorldPosition = modelMatrix * vec4(position * atmosphereRadius, 1.0);
    gl_Position = projectionMatrix * viewMatrix * vertexWorldPosition;
}