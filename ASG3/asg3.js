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
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
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
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else if (u_whichTexture == 5) {
      gl_FragColor = texture2D(u_Sampler5, v_UV);
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
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
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
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }
  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
    return false;
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
let g_camera = new Camera();
let g_horzAngle = 0;
let g_vertAngle = 0;
let g_start = performance.now() / 1000;
let g_seconds = 0;

// ### MAIN ############
function main() {

  setupWebGL();

  connectVariablesToGLSL();

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };
  document.onkeydown = keydown;

  requestAnimationFrame(tick);
}

function keydown(ev) {
  switch(ev.keyCode) {
    case 87: // W
      g_camera.goForward();
      break;
    case 65: // A
      g_camera.goLeft();
      break;
    case 83: // S
      g_camera.goBackward();
      break;
    case 68: // D
      g_camera.goRight();
      break;
    case 81: // Q
      g_camera.turnHorz(2);
      break;
    case 69: // E
      g_camera.turnHorz(-2);
      break;
  }
}

function initTextures() {
  const image0 = new Image();  // Create the image object
  const image1 = new Image();
  const image2 = new Image();
  const image3 = new Image();
  const image4 = new Image();
  const image5 = new Image();
  if (!image0 || !image1 || !image2 || !image3 || !image4 || !image5) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image0.onload = () => { sendImageToTEXTURE(gl.TEXTURE0, image0, u_Sampler0, 0); };
  image1.onload = () => { sendImageToTEXTURE(gl.TEXTURE1, image1, u_Sampler1, 1); };
  image2.onload = () => { sendImageToTEXTURE(gl.TEXTURE2, image2, u_Sampler2, 2); };
  image3.onload = () => { sendImageToTEXTURE(gl.TEXTURE3, image3, u_Sampler3, 3); };
  image4.onload = () => { sendImageToTEXTURE(gl.TEXTURE4, image4, u_Sampler4, 4); };
  image5.onload = () => { sendImageToTEXTURE(gl.TEXTURE5, image5, u_Sampler5, 5); };

  // Tell the browser to load an image
  image0.src = './diamond.png';
  image1.src = './lava.jpg';
  image2.src = './sand.jpg';
  image3.src = './stone.png';
  image4.src = './tnt.png';
  image5.src = './wood.jpg';

  return true;
}

function sendImageToTEXTURE(actTex, image, sampler, num) {
  const texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(actTex); // <--
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(sampler, num); // <--
  console.log(`Finished loading texture ${num}`);
}

function click(ev) {
  g_camera.turnHorz(ev.movementX / 3);
  g_camera.turnVert(ev.movementY / 3);
}

function tick() {
  g_seconds = performance.now() / 1000 - g_start;
  // console.log(g_seconds);
  renderAllShapes();
  requestAnimationFrame(tick);
}

function renderAllShapes() {
  const start = performance.now();

  const projMat = new Matrix4();
  projMat.setPerspective(50, canvas.width/canvas.height, 0.1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  const viewMat = new Matrix4().rotate(g_horzAngle, 0, 1, 0);
  const [eye1, eye2, eye3] = g_camera.eye.elements;
  const [at1, at2, at3] = g_camera.at.elements;
  const [up1, up2, up3] = g_camera.up.elements;
  viewMat.setLookAt(eye1, eye2, eye3, at1, at2, at3, up1, up2, up3);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  let globalRotMat = new Matrix4().rotate(g_horzAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(g_vertAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 0 diamond
  // 1 lava
  // 2 sand
  // 3 stone
  // 4 tnt
  // 5 wood

  const ground = new Cube();
  ground.textureNum = 1; // lava
  ground.matrix.translate(0, -0.75, 0);
  ground.matrix.scale(200, -0.1, 200);
  ground.matrix.translate(-0.5, 0, -0.5);
  ground.render();

  const sky = new Cube();
  sky.color = [0.4, 0.8, 1, 1];
  sky.matrix.scale(200, 200, 200);
  sky.matrix.translate(-0.5, -0.1, -0.5);
  sky.render();
  
  drawMap();

  const duration = performance.now() - start;
  const indicator = document.getElementById('indicator');
  if (!indicator) {
    console.log('Failed to get "indicator" from HTML');
    return;
  }
  indicator.innerHTML = `
    MS: ${Math.floor(duration)}  //  FPS: ${ Math.floor(10000 / duration) / 10}`;
}

function drawMap() {
  const map1 = [
    [6, 6, 6, 5, 6, 6, 6, 3],
    [0, 5, 6, 5, 4, 3, 6, 3],
    [5, 5, 6, 5, 3, 3, 6, 3],
    [5, 6, 6, 6, 6, 6, 6, 3],
    [5, 6, 2, 6, 2, 2, 2, 2],
    [5, 6, 2, 6, 4, 2, 0, 2],
    [5, 6, 2, 2, 2, 2, 6, 2],
    [5, 6, 6, 6, 6, 6, 6, 2],
  ];
  const block = new Cube();
  block.matrix.translate(0, 2, 0);
  block.matrix.scale(3, 3, 3);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      switch (map1[r][c]) {
        case 0:
          block.textureNum = 0;
          block.matrix.setTranslate(0, 0, 0);
          block.matrix.translate(r, 0, c);
          block.render();
          break;
        case 1:
          block.textureNum = 1;
          block.matrix.setTranslate(0, 0, 0);
          block.matrix.translate(r, 0, c);
          block.render();
          break;
        case 2:
          block.textureNum = 2;
          block.matrix.setTranslate(0, 0, 0);
          block.matrix.translate(r, 0, c);
          block.render();
          break;
        case 3:
          block.textureNum = 3;
          block.matrix.setTranslate(0, 0, 0);
          block.matrix.translate(r, 0, c);
          block.render();
          break;
        case 4:
          block.textureNum = 4;
          block.matrix.setTranslate(0, 0, 0);
          block.matrix.translate(r, 0, c);
          block.render();
          break;
        case 5:
          block.textureNum = 5;
          block.matrix.setTranslate(0, 0, 0);
          block.matrix.translate(r, 0, c);
          block.render();
          break;
        default:
          continue;
      }
    }
  }
}
