class Point {
    constructor() {
        this.type = 'point';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 10.0;
    }

    render() {
        const xy = this.position;
        const rgba = this.color;
        const size = this.size;

        gl.disableVertexAttribArray(a_Position);
        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        gl.uniform1f(u_Size, size);

        // Draw
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}