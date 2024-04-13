// original: DrawTriangle.js (c) 2012 matsuda
// derivative work: asg0.js by Ethan Yeung

let canvas;
let ctx;

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  clearCanvas();
}

function clearCanvas() {
  // Draw a black rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';  // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);  // Fill a rectangle with the color
}

function handleDrawEvent() {
  clearCanvas();
  let v1_x = document.getElementById('v1_x').value;
  let v1_y = document.getElementById('v1_y').value;
  let v1 = new Vector3([v1_x, v1_y, 0]);
  drawVector(v1, 'red');
  let v2_x = document.getElementById('v2_x').value;
  let v2_y = document.getElementById('v2_y').value;
  let v2 = new Vector3([v2_x, v2_y, 0]);
  drawVector(v2, 'blue');
  return [v1, v2];
}

function handleDrawOperationEvent() {
  [v1, v2] = handleDrawEvent();
  let op = document.getElementById('op-select').value;
  let scalar = document.getElementById('scalar').value;
  let v3, v4;
  switch(op) {
    case 'add':
      v3 = v1.add(v2);
      drawVector(v3, 'green');
      break;
    case 'sub':
      v3 = v1.sub(v2);
      drawVector(v3, 'green');
      break;
    case 'mul':
      v3 = v1.mul(scalar);
      drawVector(v3, 'green');
      v4 = v2.mul(scalar);
      drawVector(v4, 'green');
      break;
    case 'div':
      v3 = v1.div(scalar);
      drawVector(v3, 'green');
      v4 = v2.div(scalar);
      drawVector(v4, 'green');
      break;
    case 'ang':
      console.log(`Angle: ${angleBetween(v1, v2)}`);
      break;
    case 'are':
      console.log(`Area of the triangle: ${areaTriangle(v1, v2)}`);
      break;
    case 'mag':
      console.log(`Magnitude v1: ${v1.magnitude()}`);
      console.log(`Magnitude v2: ${v2.magnitude()}`);
      break;
    case 'nor':
      v3 = v1.normalize();
      drawVector(v3, 'green');
      v4 = v2.normalize();
      drawVector(v4, 'green');
      break;
  }
}

function angleBetween(v1, v2) {
  let radians = Math.acos(Vector3.dot(v1, v2) / (v1.magnitude() * v2.magnitude()));
  return radians * (180 / Math.PI);
}

function areaTriangle(v1, v2) {
  return Vector3.cross(v1, v2).magnitude() / 2;
}

function drawVector(vector, color) {
  ctx.strokeStyle = color;
  let cx = canvas.width / 2;
  let cy = canvas.height / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + vector.elements[0] * 20, cy - vector.elements[1] * 20);
  ctx.stroke();
}
