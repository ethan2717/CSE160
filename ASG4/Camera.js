class Camera {
    constructor() {
        this.at = new Vector3([0, 0, 0]);
        this.eye = new Vector3([0, 1, -5.5]);
        this.up = new Vector3([0, 1, 0]);
    }

    initFVec() {
        const f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        return f;
    }

    goForward() {
        const f = this.initFVec();
        f.normalize();
        this.at.add(f);
        this.eye.add(f);
        // console.log('forward');
    }

    goBackward() {
        const f = this.initFVec();
        f.normalize();
        this.at.sub(f);
        this.eye.sub(f);
        // console.log('backward');
    }

    goLeft() {
        const f = this.initFVec();
        const s = Vector3.cross(f, this.up);
        s.normalize();
        this.at.sub(s);
        this.eye.sub(s);
        // console.log('left');
    }

    goRight() {
        const f = this.initFVec();
        const s = Vector3.cross(f, this.up);
        s.normalize();
        this.at.add(s);
        this.eye.add(s);
        // console.log('right');
    }

    turnHorz(direction) {
        // int direction: positive for left, negative for right
        const f = this.initFVec();
        const rotMat = new Matrix4();
        const [up1, up2, up3] = this.up.elements;
        rotMat.setRotate(direction, up1, up2, up3);
        const ff = rotMat.multiplyVector3(f);
        this.at = ff.add(this.eye);
        // console.log(`pan horz ${direction}`);
    }

    turnVert(direction) {
        const f = this.initFVec();
        const cross = Vector3.cross(f, this.up);
        cross.normalize();
        const [c1, c2, c3] = cross.elements;
        const rotMat = new Matrix4();
        rotMat.setRotate(direction, c1, c2, c3);
        const ff = rotMat.multiplyVector3(f);
        this.at = ff.add(this.eye);
        // console.log(`pan vert ${direction}`);
    }
}