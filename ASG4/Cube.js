class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.cubeBuff = gl.createBuffer();
        this.vertices = new Float32Array([
            0,0,0, 1,1,0, 1,0,0,  0,0,0, 0,1,0, 1,1,0,
            0,0,1, 1,1,1, 1,0,1,  0,0,1, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,  0,1,0, 0,1,1, 1,1,1,
            0,0,0, 1,0,1, 1,0,0,  0,0,0, 0,0,1, 1,0,1,
            0,0,0, 0,1,1, 0,0,1,  0,0,0, 0,1,0, 0,1,1,
            1,0,0, 1,1,1, 1,0,1,  1,0,0, 1,1,0, 1,1,1,
        ]);
        this.frontBack = gl.createBuffer();
        this.topBottom = gl.createBuffer();
        this.leftRight = gl.createBuffer();
        if (!this.frontBack || !this.topBottom || !this.leftRight) {
            console.log('Failed to create buffer');
            return;
        }
        this.uvBuff = gl.createBuffer();
        this.uvVert = new Float32Array([
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
            1,0, 0,1, 0,0,  1,0, 1,1, 0,1,
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
            0,1, 1,0, 1,1,  0,1, 0,0, 1,0,
            1,0, 0,1, 0,0,  1,0, 1,1, 0,1,
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
        ]);
        this.normBuff = gl.createBuffer();
        this.normals = new Float32Array([
            0,0,-1, 0,0,-1, 0,0,-1,  0,0,-1, 0,0,-1, 0,0,-1,
            0,0,1, 0,0,1, 0,0,1,  0,0,1, 0,0,1, 0,0,1,
            0,1,0, 0,1,0, 0,1,0,  0,1,0, 0,1,0, 0,1,0,
            0,-1,0, 0,-1,0, 0,-1,0,  0,-1,0, 0,-1,0, 0,-1,0,
            -1,0,0, -1,0,0, -1,0,0,  -1,0,0, -1,0,0, -1,0,0,
            1,0,0, 1,0,0, 1,0,0,  1,0,0, 1,0,0, 1,0,0,
        ]);
        if (!this.cubeBuff || !this.uvBuff || !this.normBuff) {
            console.log('Failed to create Buff');
            return;
        }
        this.whichTexture = 0;
    }

    render() {
        const [r, g, b, a] = this.color;

        gl.uniform1i(u_whichTexture, this.whichTexture);
        gl.uniform4f(u_FragColor, r, g, b, a);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        drawCubeNorm(this.cubeBuff, this.vertices, this.uvBuff, this.uvVert, this.normBuff, this.normals);
        if (this.whichTexture == -1) {
            drawCubeUV(this.cubeBuff, this.vertices, this.uvBuff, this. uvVert);
        } else {
            // lighting, then drawing for front & back
            gl.uniform4f(u_FragColor, r, g, b, a);
            const front = [0,0,0, 1,1,0, 1,0,0,  0,0,0, 0,1,0, 1,1,0];
            const back = [1,1,1, 0,0,1, 0,1,1,  1,0,1, 1,1,1, 0,0,1];
            drawCube(this.frontBack, new Float32Array(front.concat(back)));

            // lighting, then drawing for top & bottom
            gl.uniform4f(u_FragColor, r*0.9, g*0.9, b*0.9, a);
            const top = [0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0];
            const bottom = [0,0,0, 0,0,1, 1,0,1,  1,0,1, 0,0,0, 1,0,0];
            drawCube(this.topBottom, new Float32Array(top.concat(bottom)));

            // lighting, then drawing for left & right
            gl.uniform4f(u_FragColor, r*0.3, g*0.3, b*0.3, a);
            const left = [0,0,1, 0,1,1, 0,0,0,  0,1,0, 0,0,0, 0,1,1];
            const right = [1,0,1, 1,1,1, 1,0,0,  1,1,0, 1,0,0, 1,1,1];
            drawCube(this.leftRight, new Float32Array(left.concat(right)));
        }
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

function drawCubeUV(buffer, matrix, uvBuff, uvMat) {
    // OBJ Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, matrix, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // UV Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuff);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, uvMat, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, matrix.length / 3);
}

function drawCubeNorm(buffer, matrix, uvBuff, uvMat, normBuff, normals) {
    // OBJ Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, matrix, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // UV Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuff);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, uvMat, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_UV);

    // NORM Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuff);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, matrix.length / 3);
}
