// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
const VSHADER_SOURCE = `
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec3 a_Normal;
varying vec2 v_UV;
varying vec3 v_Normal;
varying vec4 v_VertPos;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix; 
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  v_UV = a_UV;
  v_Normal = a_Normal;
  v_VertPos = u_ModelMatrix * a_Position;
}`;

// Fragment shader program
const FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
uniform vec4 u_FragColor;
uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
varying vec4 v_VertPos;
uniform bool u_lightOn;
uniform vec3 u_lightColor;
uniform int u_whichTexture;
void main() {
  if (u_whichTexture == -1) {
    gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
  } else if (u_whichTexture == 0) {
    gl_FragColor = u_FragColor;
  } else {
    gl_FragColor = vec4(1, 0, 0, 1);
  }

  vec3 lightVector = u_lightPos - vec3(v_VertPos);
  float r = length(lightVector);

  // N dot L
  vec3 L = normalize(lightVector);
  vec3 N = normalize(v_Normal);
  float nDotL = max(dot(N, L), 0.0);

  // Reflection
  vec3 R = reflect(-L, N);

  // eye
  vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

  // Specular
  float specular = pow(max(dot(E, R), 0.0), 64.0);

  vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.8;
  vec3 ambient = (vec3(gl_FragColor) + u_lightColor) * 0.4;
  if (u_lightOn) {
      gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
  }
}`;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let a_UV;
let a_Normal;
let u_lightPos;
let u_lightOn;
let u_cameraPos;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_lightColor;
let u_whichTexture;

function main() {

  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  requestAnimationFrame(tick);
}

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
  }

// Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
      return;
  }

  // Get the storage location of u_lightColor
	u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
	if (!u_lightColor) {
		console.log('Failed to get the storage location of u_lightColor');
		return;
	}

	// Get the storage location of u_lightPos
	u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
	if (!u_lightPos) {
		console.log('Failed to get the storage location of u_lightPos');
		return;
	}

	// Get the storage location of u_lightPos
	u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
	if (!u_lightOn) {
		console.log('Failed to get the storage location of u_lightOn');
		return;
	}

	// Get the storage location of u_cameraPos
	u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
	if (!u_cameraPos) {
		console.log('Failed to get the storage location of u_cameraPos');
		return;
	}

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	if (!u_ViewMatrix) {
		console.log('Failed to get the storage location of u_ViewMatrix');
		return;
	}

	u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
	if (!u_ProjectionMatrix) {
		console.log('Failed to get the storage location of u_ProjectionMatrix');
		return;
	}

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
	if (!u_whichTexture) {
		console.log('Failed to get the storage location of u_whichTexture');
		return;
	}

  const identityMat = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMat.elements);
}

// More global variables
const g_camera = new Camera();
let g_cameraAngles = [0, 0, 0];
let g_horzAngle = 0;
let g_vertAngle = 0;
let g_earLeftAngle = 0;
let g_earRightAngle = 0;
let g_headHorzAngle = 0;
let g_headVertAngle = 0;
let g_armLeftAngle = 0;
let g_armRightAngle = 0;
let g_legLeftAngle = 0;
let g_legRightAngle = 0;

// Animation-related global variables
let g_start = performance.now() / 1000;
let g_seconds = 0;
let g_normalOn = false; 
let g_lightPos = [0, 1, -2];
let g_lightOn = true;
let g_lightColor = [0, 0, 0];
let g_lightRotate = true;

function addActionsForHtmlUI() {
  document.getElementById('lightX').addEventListener('mousemove', function() {
    g_lightPos[0] = this.value / 100;
    renderAllShapes();
  });
  document.getElementById('lightY').addEventListener('mousemove', function() {
    g_lightPos[1] = this.value / 100;
    renderAllShapes();
  });
  document.getElementById('lightZ').addEventListener('mousemove', function() {
    g_lightPos[2] = this.value / 100;
    renderAllShapes();
  });

  document.getElementById('lightR').addEventListener('mousemove', function() {
    g_lightColor[0] = this.value / 100;
    renderAllShapes();
  });
  document.getElementById('lightG').addEventListener('mousemove', function() {
    g_lightColor[1] = this.value / 100;
    renderAllShapes();
  });
  document.getElementById('lightB').addEventListener('mousemove', function() {
    g_lightColor[2] = this.value / 100;
    renderAllShapes();
  });

  document.getElementById('normal').onclick = function() {
    g_normalOn = !g_normalOn;
  };
  document.getElementById('light').onclick = function() {
    g_lightOn = !g_lightOn;
  };
  document.getElementById('rotate').onclick = function() {
    g_lightRotate = !g_lightRotate;
  };
}

function tick() {
  g_seconds = performance.now() / 1000 - g_start;
  // console.log(g_seconds);
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_lightRotate) {
    g_lightPos[0] = 1.8 * Math.cos(g_seconds);
    g_lightPos[2] = 1.8 * Math.sin(g_seconds);
  }
}

function renderAllShapes() {
  const start = performance.now();

  const projMat = new Matrix4();
  projMat.setPerspective(45, canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  let globalRotMat = new Matrix4().rotate(g_horzAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(g_vertAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  const viewMat = new Matrix4().rotate(g_horzAngle, 0, 1, 0);
  const [eye1, eye2, eye3] = g_camera.eye.elements;
  const [at1, at2, at3] = g_camera.at.elements;
  const [up1, up2, up3] = g_camera.up.elements;
  viewMat.setLookAt(eye1, eye2, eye3, at1, at2, at3, up1, up2, up3);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
	gl.uniform3f(u_cameraPos, eye1, eye2, eye3);
	gl.uniform1i(u_lightOn, g_lightOn);
	gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // colors
  const lightPink = [1.0, 0.8, 1.0, 1.0];
	const pink = [1.0, 0.6, 1.0, 1.0];
	const darkPink = [0.9, 0.01, 0.6, 1.0];
  const black = [0.0, 0.0, 0.0, 1.0];

  // room
  const room = new Cube();
  room.color [0.8, 0.8, 0.8, 1.0];
  room.matrix.scale(-7, -5, -10);
  room.matrix.translate(-0.5, -0.85, -0.5);
  room.whichTexture = 0;
  if (g_normalOn) room.whichTexture = -1;
  room.render();

  const light = new Cube();
  light.color = [1, 1, 0, 1];
  const [x, y, z] = g_lightPos;
  light.matrix.translate(x, y, z);
  light.matrix.translate(0.5, 0.5, 0.5);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.render();

  const sphere = new Sphere();
  sphere.color = [0.25, 0.9, 0.9, 1];
  sphere.matrix.translate(1.75, 0.5, 2);
  if (g_normalOn) sphere.whichTexture = -1;
  sphere.render();
	
	// head
	const head = new Cube();
	head.color = lightPink;
	head.matrix.translate(-0.225, 0.4, -0.05);
	head.matrix.rotate(g_headHorzAngle, 0, 1, 0);
	head.matrix.rotate(g_headVertAngle, 1, 0, 0);
	head.matrix.scale(0.45, 0.35, 0.4);
  if (g_normalOn) head.whichTexture = -1;
	head.render();

	// left ear
	const leftEar = new Cube();
	leftEar.matrix = new Matrix4(head.matrix);
	leftEar.color = lightPink;
	leftEar.matrix.rotate(-g_earLeftAngle, 0, 1, 0);
	leftEar.matrix.translate(-0.05, 0.8, 0.0);
	leftEar.matrix.scale(0.2, 0.4, 0.2);
  if (g_normalOn) leftEar.whichTexture = -1;
	leftEar.render();

	const leftInEar = new Cube();
	leftInEar.matrix = new Matrix4(leftEar.matrix);
	leftInEar.color = pink;
	leftInEar.matrix.translate(0.2, 0.0, -0.3);
	leftInEar.matrix.scale(0.6, 0.7, 0.3);
  if (g_normalOn) leftInEar.whichTexture = -1;
	leftInEar.render();

	// right ear
	const rightEar = new Cube();
	rightEar.matrix = new Matrix4(head.matrix);
	rightEar.color = lightPink;
	rightEar.matrix.translate(0.85, 0.8, 0.0);
	rightEar.matrix.rotate(g_earRightAngle, 0, -1, 0);
	rightEar.matrix.scale(0.2, 0.4, 0.2);
  if (g_normalOn) rightEar.whichTexture = -1;
	rightEar.render();

	const rightInEar = new Cube();
	rightInEar.matrix = new Matrix4(rightEar.matrix);
	rightInEar.color = pink;
	rightInEar.matrix.translate(0.2, 0.0, -0.3);
	rightInEar.matrix.scale(0.6, 0.7, 0.3);
  if (g_normalOn) rightInEar.whichTexture = -1;
	rightInEar.render();

	// face
	const leftEye = new Cube();
	leftEye.matrix = new Matrix4(head.matrix);
	leftEye.color = black;
	leftEye.matrix.translate(0.3, 0.55, 0.01);
	leftEye.matrix.scale(0.05, 0.1, -0.02);
  if (g_normalOn) leftEye.whichTexture = -1;
	leftEye.render();

	const rightEye = new Cube();
	rightEye.matrix = new Matrix4(head.matrix);
	rightEye.color = black;
	rightEye.matrix.translate(0.65, 0.55, 0.01);
	rightEye.matrix.scale(0.05, 0.1, -0.02);
  if (g_normalOn) rightEye.whichTexture = -1;
	rightEye.render();

	const mouth = new Cube();
	mouth.matrix = new Matrix4(head.matrix);
	mouth.color = black;
	mouth.matrix.translate(0.35, 0.2, -0.01);
	mouth.matrix.scale(0.3, 0.1, 0.01);
  if (g_normalOn) mouth.whichTexture = -1;
	mouth.render();

  const lip = new Cube();
	lip.matrix = new Matrix4(mouth.matrix);
	lip.color = lightPink;
	lip.matrix.translate(0.175, 0.6, -0.01);
	lip.matrix.scale(0.65, 0.45, 0.01);
  if (g_normalOn) lip.whichTexture = -1;
	lip.render();

	const nose = new Cube();
	nose.matrix = new Matrix4(head.matrix);
	nose.color = darkPink;
	nose.matrix.translate(0.425, 0.35, -0.01);
	nose.matrix.scale(0.15, 0.15, -0.05);
  if (g_normalOn) nose.whichTexture = -1;
	nose.render();

	// body
	const body = new Cube();
	body.color = darkPink;
	body.matrix.rotate(0, 1, 1, 1);
	body.matrix.translate(-0.25, -0.25, 0.0);
	body.matrix.scale(0.5, 0.65, 0.3);
  if (g_normalOn) body.whichTexture = -1;
	body.render();

  // arms
	const leftArm = new Cube();
	leftArm.color = lightPink;
	leftArm.matrix.rotate(-180, 0, 0, 1);
	leftArm.matrix.translate(0.25, -0.3, -0.025);
	leftArm.matrix.rotate(g_armLeftAngle, 1, 0, 0);
	leftArm.matrix.scale(0.125, 0.45, 0.35);
  if (g_normalOn) leftArm.whichTexture = -1;
	leftArm.render();

	const rightArm = new Cube();
	rightArm.color = lightPink;
	rightArm.matrix.rotate(-180, 0, 0, 1);
	rightArm.matrix.translate(-0.375, -0.3, -0.025);
	rightArm.matrix.rotate(g_armRightAngle, -1, 0, 0);
	rightArm.matrix.scale(0.125, 0.45, 0.35);
  if (g_normalOn) rightArm.whichTexture = -1;
	rightArm.render();

	// legs
	const leftLeg = new Cube();
	leftLeg.color = lightPink;
	leftLeg.matrix.rotate(g_legLeftAngle, 1, 0, 0);
	leftLeg.matrix.translate(-0.175, -0.65, 0.0);
	leftLeg.matrix.scale(0.15, 0.5, 0.325);
  if (g_normalOn) leftLeg.whichTexture = -1;
	leftLeg.render();

	const rightLeg = new Cube();
	rightLeg.color = lightPink;
	rightLeg.matrix.rotate(g_legRightAngle, -1, 0, 0);
	rightLeg.matrix.translate(0.03, -0.65, 0.0);
	rightLeg.matrix.scale(0.15, 0.5, 0.325);
  if (g_normalOn) rightLeg.whichTexture = -1;
	rightLeg.render();

  const duration = performance.now() - start;
  const indicator = document.getElementById('indicator');
  if (!indicator) {
    console.log('Failed to get "indicator" from HTML');
    return;
  }
  indicator.innerHTML = `
    MS: ${Math.floor(duration)}  //  FPS: ${ Math.floor(10000 / duration) / 10}`;
}
