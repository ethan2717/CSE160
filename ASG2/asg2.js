// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function main() {

  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };

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

  const identityMat = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMat.elements);
}

// More global variables
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
let g_poke = false;
let g_animation = false;
let g_reset = false;
let g_start = performance.now() / 1000;
let g_seconds = 0;

function addActionsForHtmlUI() {
  document.getElementById('horzSlide').addEventListener('mousemove', function() {
    g_horzAngle = this.value;
    renderAllShapes();
  });
  document.getElementById('vertSlide').addEventListener('mousemove', function() {
    g_vertAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('earLeftSlide').addEventListener('mousemove', function() {
    g_earLeftAngle = this.value;
    renderAllShapes();
  });
  document.getElementById('earRightSlide').addEventListener('mousemove', function() {
    g_earRightAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('headHorzSlide').addEventListener('mousemove', function() {
    g_headHorzAngle = this.value;
    renderAllShapes();
  });
  document.getElementById('headVertSlide').addEventListener('mousemove', function() {
    g_headVertAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('armLeftSlide').addEventListener('mousemove', function() {
    g_armLeftAngle = this.value;
    renderAllShapes();
  });
  document.getElementById('armRightSlide').addEventListener('mousemove', function() {
    g_armRightAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('legLeftSlide').addEventListener('mousemove', function() {
    g_legLeftAngle = this.value;
    renderAllShapes();
  });
  document.getElementById('legRightSlide').addEventListener('mousemove', function() {
    g_legRightAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('animation').onclick = function() {
    g_animation = !g_animation;
  };
  document.getElementById('reset').onclick = function() {
    g_reset = true;
  };
}

function click(ev) {
  if (ev.shiftKey) {
    g_poke = !g_poke;
  }
}

function tick() {
  g_seconds = performance.now() / 1000 - g_start;
  // console.log(g_seconds);
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    g_earLeftAngle = animate(15);
    g_earRightAngle = animate(15);
    g_headHorzAngle = animate(10);
    g_headVertAngle = animate(10);
    g_armLeftAngle = animate(50);
    g_armRightAngle = animate(50);
    g_legLeftAngle = animate(40);
    g_legRightAngle = animate(40);
  }
  if (g_poke) {
    g_earLeftAngle = animate(180);
    g_earRightAngle = animate(180);
    g_headHorzAngle = animate(180);
    g_headVertAngle = animate(180);
    g_armLeftAngle = animate(180);
    g_armRightAngle = animate(180);
    g_legLeftAngle = animate(180);
    g_legRightAngle = animate(180);
  } 
  if (!g_animation && !g_poke) {
    g_earLeftAngle = g_earLeftAngle;
    g_earRightAngle = g_earRightAngle;
    g_headHorzAngle = g_headHorzAngle;
    g_headVertAngle = g_headVertAngle;
    g_armLeftAngle = g_armLeftAngle;
    g_armRightAngle = g_armRightAngle;
    g_legLeftAngle = g_legLeftAngle;
    g_legRightAngle = g_legRightAngle;
  }
  if (g_reset) {
    g_horzAngle = 0;
    g_vertAngle = 0;
    g_earLeftAngle = 0;
    g_earRightAngle = 0;
    g_headHorzAngle = 0;
    g_headVertAngle = 0;
    g_armLeftAngle = 0;
    g_armRightAngle = 0;
    g_legLeftAngle = 0;
    g_legRightAngle = 0;
    g_reset = false;
  }
}

function animate(num) {
  return num * Math.sin(g_seconds * 2);
}

function renderAllShapes() {
  const start = performance.now();

  let globalRotMat = new Matrix4().rotate(g_horzAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(g_vertAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // colors
  const lightPink = [1.0, 0.8, 1.0, 1.0];
	const pink = [1.0, 0.6, 1.0, 1.0];
	const darkPink = [0.9, 0.01, 0.6, 1.0];
  const black = [0.0, 0.0, 0.0, 1.0];
	
	// head
	const head = new Cube();
	head.color = lightPink;
	head.matrix.translate(-0.225, 0.4, -0.05);
	head.matrix.rotate(g_headHorzAngle, 0, 1, 0);
	head.matrix.rotate(g_headVertAngle, 1, 0, 0);
	head.matrix.scale(0.45, 0.35, 0.4);
	head.render();

	// left ear
	const leftEar = new Cube();
	leftEar.matrix = new Matrix4(head.matrix);
	leftEar.color = lightPink;
	leftEar.matrix.rotate(-g_earLeftAngle, 0, 1, 0);
	leftEar.matrix.translate(-0.05, 0.8, 0.0);
	leftEar.matrix.scale(0.2, 0.4, 0.2);
	leftEar.render();

	const leftInEar = new Cube();
	leftInEar.matrix = new Matrix4(leftEar.matrix);
	leftInEar.color = pink;
	leftInEar.matrix.translate(0.2, 0.0, -0.3);
	leftInEar.matrix.scale(0.6, 0.7, 0.3);
	leftInEar.render();

	// right ear
	const rightEar = new Cube();
	rightEar.matrix = new Matrix4(head.matrix);
	rightEar.color = lightPink;
	rightEar.matrix.translate(0.85, 0.8, 0.0);
	rightEar.matrix.rotate(g_earRightAngle, 0, -1, 0);
	rightEar.matrix.scale(0.2, 0.4, 0.2);
	rightEar.render();

	const rightInEar = new Cube();
	rightInEar.matrix = new Matrix4(rightEar.matrix);
	rightInEar.color = pink;
	rightInEar.matrix.translate(0.2, 0.0, -0.3);
	rightInEar.matrix.scale(0.6, 0.7, 0.3);
	rightInEar.render();

	// face
	const leftEye = new Cube();
	leftEye.matrix = new Matrix4(head.matrix);
	leftEye.color = black;
	leftEye.matrix.translate(0.3, 0.55, 0.01);
	leftEye.matrix.scale(0.05, 0.1, -0.02);
	leftEye.render();

	const rightEye = new Cube();
	rightEye.matrix = new Matrix4(head.matrix);
	rightEye.color = black;
	rightEye.matrix.translate(0.65, 0.55, 0.01);
	rightEye.matrix.scale(0.05, 0.1, -0.02);
	rightEye.render();

	const mouth = new Cube();
	mouth.matrix = new Matrix4(head.matrix);
	mouth.color = black;
	mouth.matrix.translate(0.35, 0.2, -0.01);
	mouth.matrix.scale(0.3, 0.1, 0.01);
	mouth.render();

  const lip = new Cube();
	lip.matrix = new Matrix4(mouth.matrix);
	lip.color = lightPink;
	lip.matrix.translate(0.175, 0.6, -0.01);
	lip.matrix.scale(0.65, 0.45, 0.01);
	lip.render();

	const nose = new Cube();
	nose.matrix = new Matrix4(head.matrix);
	nose.color = darkPink;
	nose.matrix.translate(0.425, 0.35, -0.01);
	nose.matrix.scale(0.15, 0.15, -0.05);
	nose.render();

	// body
	const body = new Cube();
	body.color = darkPink;
	body.matrix.rotate(0, 1, 1, 1);
	body.matrix.translate(-0.25, -0.25, 0.0);
	body.matrix.scale(0.5, 0.65, 0.3);
	body.render();

  // arms
	const leftArm = new Cube();
	leftArm.color = lightPink;
	leftArm.matrix.rotate(-180, 0, 0, 1);
	leftArm.matrix.translate(0.25, -0.3, -0.025);
	leftArm.matrix.rotate(g_armLeftAngle, 1, 0, 0);
	leftArm.matrix.scale(0.125, 0.45, 0.35);
	leftArm.render();

	const rightArm = new Cube();
	rightArm.color = lightPink;
	rightArm.matrix.rotate(-180, 0, 0, 1);
	rightArm.matrix.translate(-0.375, -0.3, -0.025);
	rightArm.matrix.rotate(g_armRightAngle, -1, 0, 0);
	rightArm.matrix.scale(0.125, 0.45, 0.35);
	rightArm.render();

	// legs
	const leftLeg = new Cube();
	leftLeg.color = lightPink;
	leftLeg.matrix.rotate(g_legLeftAngle, 1, 0, 0);
	leftLeg.matrix.translate(-0.175, -0.65, 0.0);
	leftLeg.matrix.scale(0.15, 0.5, 0.325);
	leftLeg.render();

	const rightLeg = new Cube();
	rightLeg.color = lightPink;
	rightLeg.matrix.rotate(g_legRightAngle, -1, 0, 0);
	rightLeg.matrix.translate(0.03, -0.65, 0.0);
	rightLeg.matrix.scale(0.15, 0.5, 0.325);
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
