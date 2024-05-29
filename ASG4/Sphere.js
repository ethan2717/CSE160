class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.sphereBuff = gl.createBuffer();
        this.vertices = null;
        this.uvBuff = gl.createBuffer();
        this.uvVert = null;
        this.normBuff = gl.createBuffer();
        this.normals = null;
        if (!this.sphereBuff || !this.uvBuff || !this.normBuff) {
            console.log('Failed to create Buff');
            return;
        }
        this.whichTexture = 0;
    }

    render() {
        const [r, g, b, a] = this.color;
        gl.uniform4f(u_FragColor, r, g, b, a);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        if (this.vertices === null) {
            this.generate();
        }
        drawSphereNorm(this.sphereBuff, this.vertices, this.uvBuff, this.uvVert, this.normBuff, this.normals);
        drawSphere(this.sphereBuff, this.vertices.slice(0, 36));
        gl.uniform4f(u_FragColor, r*0.9, g*0.9, b*0.9, a);
        drawSphere(this.sphereBuff, this.vertices.slice(36, 72));
        gl.uniform4f(u_FragColor, r*0.8, g*0.8, b*0.8, a);
        drawSphere(this.sphereBuff, this.vertices.slice(72));
    }

    generate() {
        const arr = [];
        const uvArr = [];
        const p = Math.PI / 25;
        for (let i = 0; i < Math.PI; i += p) {
            for (let j = 0; j < Math.PI*2; j += p) {
                arr.push(sin(i)*cos(j), sin(i)*sin(j), cos(i));
                arr.push(sin(i+p)*cos(j+p), sin(i+p)*sin(j+p), cos(i+p));
                arr.push(sin(i)*cos(j+p), sin(i)*sin(j+p), cos(i));
                uvArr.push(i/Math.PI, j/(2*Math.PI));
                uvArr.push((i+p)/Math.PI, (j+p)/(2*Math.PI));
                uvArr.push(i/Math.PI, (j+p)/(2*Math.PI));

                arr.push(sin(i)*cos(j), sin(i)*sin(j), cos(i));
                arr.push(sin(i+p)*cos(j), sin(i+p)*sin(j), cos(i+p));
                arr.push(sin(i+p)*cos(j+p), sin(i+p)*sin(j+p), cos(i+p));
                uvArr.push(i/Math.PI, j/(2*Math.PI));
                uvArr.push((i+p)/Math.PI, j/(2*Math.PI));
                uvArr.push((i+p)/Math.PI, (j+p)/(2*Math.PI));
            }
        }
        this.vertices = new Float32Array(arr);
        this.uvVert = new Float32Array(uvArr);
        this.normals = new Float32Array(arr);
    }
}

function drawSphere(buffer, matrix) {
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

function drawSphereNorm(buffer, matrix, uvBuff, uvMat, normBuff, normals) {
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

function sin(theta) {
    return Math.sin(theta);
}

function cos(theta) {
    return Math.cos(theta);
}
