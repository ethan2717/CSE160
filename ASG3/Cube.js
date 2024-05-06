class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.buff = gl.createBuffer();
        this.uvBuff = gl.createBuffer();
        if (!this.buff || !this.uvBuff) {
            console.log('Failed to create buffer');
            return;
        }
    }

    render() {
        const rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const front = [0,0,0, 1,1,0, 1,0,0,  0,0,0, 0,1,0, 1,1,0];
        const back = [1,1,1, 0,0,1, 0,1,1,  1,0,1, 1,1,1, 0,0,1];
        const frontUV = [0,0, 1,1, 1,0,  0,0, 0,1, 1,1];
        const backUV = [0,0, 1,1, 1,0,  0,0, 0,1, 1,1];
        const top = [0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0];
        const bottom = [0,0,0, 0,0,1, 1,0,1,  1,0,1, 0,0,0, 1,0,0];
        const topUV = [0,0, 0,1, 1,1,  0,0, 1,1, 1,0];
        const bottomUV = [0,0, 0,1, 1,1,  0,0, 1,1, 1,0];
        const left = [0,0,1, 0,1,1, 0,0,0,  0,1,0, 0,0,0, 0,1,1];
        const right = [1,0,1, 1,1,1, 1,0,0,  1,1,0, 1,0,0, 1,1,1];
        const leftUV = [1,0, 1,1, 0,0,  0,0, 0,1, 1,1];
        const rightUV = [1,0, 1,1, 0,0,  0,0, 0,1, 1,1];

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawCubeUV(this.buff,
            new Float32Array(front.concat(back).concat(top.concat(bottom)).concat(left.concat(right))),
            this.uvBuff,
            new Float32Array(frontUV.concat(backUV).concat(topUV.concat(bottomUV)).concat(leftUV.concat(rightUV))),
        );

        /* drawCube(this.buff, new Float32Array(front.concat(back)));

        // lighting, then drawing for top & bottom
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawCube(this.buff, new Float32Array(top.concat(bottom)));
        
        // lighting, then drawing for left & right
        gl.uniform4f(u_FragColor, rgba[0]*0.3, rgba[1]*0.3, rgba[2]*0.3, rgba[3]);
        drawCube(this.buff, new Float32Array(left.concat(right))); */
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

function drawCubeUV(buffer, matrix, uvBuffer, uvMatrix) {
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, matrix, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvMatrix, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.drawArrays(gl.TRIANGLES, 0, matrix.length / 3);
}
