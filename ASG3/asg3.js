// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
const VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1, 0.2, 0.2, 1);
    }
  }`;

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
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

// ### MAIN ############
function main() {

  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  initTextures0();
  initTextures1();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };

  requestAnimationFrame(tick);
}

function initTextures0() {
  const image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE0(image); };
  // Tell the browser to load an image
  image.src = './grass.png';

  return true;
}

function sendImageToTEXTURE0(image) {
  const texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  console.log('Finished loading texture 0');
}

function initTextures1() {
  const image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE1(image); };
  // Tell the browser to load an image
  image.src = './stone.jpg';

  return true;
}

function sendImageToTEXTURE1(image) {
  const texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 0);
  console.log('Finished loading texture 1');
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
  if (g_reset) {
    g_animation = false;
    g_poke = false;
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

  const projMat = new Matrix4();
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  const viewMat = new Matrix4();
  viewMat.setLookAt(0,0,-1, 0,0,0, 0,1,0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  let globalRotMat = new Matrix4().rotate(g_horzAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(g_vertAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const ground = new Cube();
  ground.color = [0, 0.6, 0.1, 1];
  ground.matrix.translate(0, -0.75, 0);
  ground.matrix.scale(200, -0.1, 200);
  ground.matrix.translate(-0.5, 0, -0.5);
  ground.render();

  const sky = new Cube();
  sky.color = [0.4, 0.8, 1, 1];
  sky.matrix.scale(200, 200, 200);
  sky.matrix.translate(-0.5, -0.1, -0.5);
  sky.render();

	// body
	const body = new Cube();
  body.color = [0.1, 0.1, 0.1, 1];
	body.textureNum = 1;
	body.matrix.rotate(0, 1, 1, 1);
	body.matrix.translate(-0.25, -0.25, 0.0);
	body.matrix.scale(0.5, 0.65, 0.3);
	body.render();

  // arms
	const leftArm = new Cube();
  leftArm.color = [0.1, 0.1, 0.1, 1];
	leftArm.textureNum = 0;
	leftArm.matrix.rotate(-180, 0, 0, 1);
	leftArm.matrix.translate(0.25, -0.3, -0.025);
	leftArm.matrix.rotate(g_armLeftAngle, 1, 0, 0);
	leftArm.matrix.scale(0.125, 0.45, 0.35);
	leftArm.render();

	const rightArm = new Cube();
  rightArm.color = [0.1, 0.1, 0.1, 1];
	rightArm.textureNum = 0;
	rightArm.matrix.rotate(-180, 0, 0, 1);
	rightArm.matrix.translate(-0.375, -0.3, -0.025);
	rightArm.matrix.rotate(g_armRightAngle, -1, 0, 0);
	rightArm.matrix.scale(0.125, 0.45, 0.35);
	rightArm.render();

	// legs
	const leftLeg = new Cube();
	leftLeg.color = [1, 1, 0, 1];
	leftLeg.matrix.rotate(g_legLeftAngle, 1, 0, 0);
	leftLeg.matrix.translate(-0.175, -0.65, 0.0);
	leftLeg.matrix.scale(0.15, 0.5, 0.325);
	leftLeg.render();

	const rightLeg = new Cube();
	rightLeg.color = [1, 1, 0, 1];
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
