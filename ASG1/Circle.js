class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 10.0;
        this.segments = 10;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var d = this.size / 350.0;
        let step = 360 / this.segments;
        for (let angle = 0; angle < 360; angle += step) {
            let center = [xy[0], xy[1]];
            let a1 = angle;
            let a2 = angle + step;
            let v1 = [Math.cos(a1 * Math.PI/180) * d, Math.sin(a1 * Math.PI/180) * d];
            let v2 = [Math.cos(a2 * Math.PI/180) * d, Math.sin(a2 * Math.PI/180) * d];
            let p1 = [center[0] + v1[0], center[1] + v1[1]];
            let p2 = [center[0] + v2[0], center[1] + v2[1]];
            drawTriangle([xy[0], xy[1], p1[0], p1[1], p2[0], p2[1]]);
        }
    }
}