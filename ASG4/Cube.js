class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.frontBack = gl.createBuffer();
        this.topBottom = gl.createBuffer();
        this.leftRight = gl.createBuffer();
        if (!this.frontBack || !this.topBottom || !this.leftRight) {
            console.log('Failed to create buffer');
            return;
        }
    }

    render() {
        const rgba = this.color;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // lighting, then drawing for front & back
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        const front = [0,0,0, 1,1,0, 1,0,0,  0,0,0, 0,1,0, 1,1,0];
        const back = [1,1,1, 0,0,1, 0,1,1,  1,0,1, 1,1,1, 0,0,1];
        drawCube(this.frontBack, new Float32Array(front.concat(back)));

        // lighting, then drawing for top & bottom
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        const top = [0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0];
        const bottom = [0,0,0, 0,0,1, 1,0,1,  1,0,1, 0,0,0, 1,0,0];
        drawCube(this.topBottom, new Float32Array(top.concat(bottom)));
        
        // lighting, then drawing for left & right
        gl.uniform4f(u_FragColor, rgba[0]*0.3, rgba[1]*0.3, rgba[2]*0.3, rgba[3]);
        const left = [0,0,1, 0,1,1, 0,0,0,  0,1,0, 0,0,0, 0,1,1];
        const right = [1,0,1, 1,1,1, 1,0,0,  1,1,0, 1,0,0, 1,1,1];
        drawCube(this.leftRight, new Float32Array(left.concat(right)));
    }
}

function drawCube(buffer, matrix) {
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, matrix, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, matrix.length / 3);
}
