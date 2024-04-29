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
let g_headHorzAngle = 0;
let g_headVertAngle = 0;
let g_armLeftAngle = 0;
let g_armRightAngle = 0;
let g_legLeftAngle = 0;
let g_legRightAngle = 0;

// Animation-related global variables
let g_poke = false;
let g_animation = false;
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
}

function click(ev) {
  if (ev.shiftKey) {
    g_poke = !g_poke;
  }
}

function tick() {
  g_seconds = performance.now() / 1000 - g_start;
  console.log(g_seconds);
  renderAllShapes();
  requestAnimationFrame(tick);
}

function renderAllShapes() {
  const start = performance.now();

  let globalRotMat = new Matrix4().rotate(g_horzAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(g_vertAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const body = new Cube();
  body.color = [1, 0, 0, 1];
  body.matrix.translate(-0.25, -0.75, 0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  const leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.setTranslate(0, -0.5, 0);
  leftArm.matrix.rotate(-5, 1, 0, 0);
  leftArm.matrix.rotate(-g_headHorzAngle, 0, 0, 1);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.matrix.translate(-0.5, 0, 0);
  leftArm.render();

  const box = new Cube();
  box.color = [1, 0, 1, 1];
  box.matrix = leftArm.matrix;
  box.matrix.translate(0, 0.7, 0, 0);
  /*box.matrix.rotate(-30, 1, 0, 0);
  box.matrix.scale(0.2, 0.4, 0.2);*/
  box.render();

  const duration = performance.now() - start;
  const indicator = document.getElementById('indicator');
  if (!indicator) {
    console.log('Failed to get "indicator" from HTML');
    return;
  }
  indicator.innerHTML = `
    MS: ${Math.floor(duration)}  //  FPS: ${ Math.floor(10000 / duration) / 10}`;
}
