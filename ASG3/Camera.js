class Camera {
    constructor() {
        this.at = new Vector3([0, 0, 0]);
        this.eye = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 0, 0]);
    }

    initFVec() {
        const f = new Vector3();
        f.sub(this.eye);
        f.normalize();
        return f;
    }

    goForward() {
        const f = this.initFVec();
        this.at.add(f);
        this.eye.add(f);
        console.log('forward');
    }

    goBackward() {
        const f = this.initFVec();
        this.at.sub(f);
        this.eye.sub(f);
        console.log('backward');
    }

    goLeft() {
        const f = this.initFVec();
        const s = Vector3.cross(f, this.up);
        s.normalize();
        this.at.sub(s);
        this.eye.sub(s);
        console.log('left');
    }

    goRight() {
        const f = this.initFVec();
        const s = Vector3.cross(f, this.up);
        s.normalize();
        this.at.add(s);
        this.eye.add(s);
        console.log('right');
    }

    turn(direction) {
        // int direction: 2 for left, -2 for right
        const f = this.initFVec();
        const rotMat = new Matrix4();
        const [up1, up2, up3] = this.up.elements;
        rotMat.setRotate(direction, up1, up2, up3);
        const ff = rotMat.multiplyVector3(f);
        this.at = ff.add(this.eye);
        console.log(`pan ${direction}`);
    }
}