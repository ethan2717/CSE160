class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.cubeBuff = gl.createBuffer();
        if (!this.cubeBuff) {
            console.log('Failed to create buffer');
            return;
        }
        this.vertices = null;
        this.normals = null;
    }

    render() {
        const [r, g, b, a] = this.color;
        gl.uniform4f(u_FragColor, r, g, b, a);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        if (this.vertices === null) {
            this.generate();
        }
        drawCube(this.cubeBuff, this.vertices.slice(0, 36));
        gl.uniform4f(u_FragColor, r*0.9, g*0.9, b*0.9, a);
        drawCube(this.cubeBuff, this.vertices.slice(36, 72));
        gl.uniform4f(u_FragColor, r*0.8, g*0.8, b*0.8, a);
        drawCube(this.cubeBuff, this.vertices.slice(72));
    }

    generate() {
        const arr = [];
        const p = Math.PI / 25;
        for (let i = 0; i < Math.PI; i += p) {
            for (let j = 0; j < Math.PI*2; j += p) {
                arr.push(sin(i)*cos(j), sin(i)*sin(j), cos(i));
                arr.push(sin(i+p)*cos(j+p), sin(i+p)*sin(j+p), cos(i+p));
                arr.push(sin(i)*cos(j+p), sin(i)*sin(j+p), cos(i));
                arr.push(sin(i)*cos(j), sin(i)*sin(j), cos(i));
                arr.push(sin(i+p)*cos(j), sin(i+p)*sin(j), cos(i+p));
                arr.push(sin(i+p)*cos(j+p), sin(i+p)*sin(j+p), cos(i+p));
            }
        }
        this.vertices = new Float32Array(arr);
        this.normals = new Float32Array(arr);
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

function sin(theta) {
    return Math.sin(theta);
}

function cos(theta) {
    return Math.cos(theta);
}
