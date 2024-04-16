function drawPicture() {
    ret = [];

    for (let x = -0.9; x < 1.0; x += getRandInt(30, 60) / 100) {
        for (let y = 0.4; y < 1.0; y += getRandInt(20, 40) / 100) {
            if (Math.random() > 0.6) {
                let star = new Triangle(true);
                star.position = [x + Math.random() / 10, y, 0.0];
                star.color = [0.9, 0.9, 0.0, 1.0];
                star.size = 10.0;
                ret.push(star);
            }
        }
    }

    let moon = new Circle();
    moon.position = [0.8, 0.8, 0.0];
    moon.size = 50.0;
    moon.segments = 40;
    ret.push(moon);

    if (Math.random() > 0.3) {
        let moonPhase = new Circle();
        moonPhase.position = [0.75, 0.77, 0.0];
        moonPhase.color = [0.0, 0.0, 0.0, 1.0];
        moonPhase.size = 50.0;
        moonPhase.segments = 40;
        ret.push(moonPhase);
    }

    for (let i = -1.0; i < 1.1; i += getRandInt(20, 40) / 100) {
        let mountain = new Triangle(false);
        mountain.position = [i, -0.9 + (i/50), 0];
        mountain.color = [0.5, 0.15, 0.5, 1.0];
        mountain.size = 200.0;
        ret.push(mountain);
    }

    let tent = new Triangle();
    tent.position = [-0.7, -0.9, 0.0];
    tent.color = [0.8, 0.5, 0.0, 1.0];
    tent.size = 50.0;
    ret.push(tent);
    
    for (let i = -1.0; i < 1.1; i += getRandInt(5, 10) / 100) {
        let grass = new Circle();
        grass.position = [i, -0.95, 0];
        grass.color = [0.2, 0.8, 0.2, 1.0];
        grass.size = 30.0;
        grass.segments = 8;
        ret.push(grass);
    }

    for (let i = -0.4; i < -0.3; i += 0.01) {
        let wood = new Point();
        wood.position = [i, -0.88, 0.0];
        wood.color = [0.25, 0.05, 0.0, 1.0];
        wood.size = 8.0;
        ret.push(wood);

        let rand = Math.random() / 5;
        let fire = new Triangle(true);
        fire.position = [i + (rand / 40), -0.87 + (rand / 4), 0.0];
        fire.color = [0.99, 0.5 + rand, 0.0, 0.9];
        ret.push(fire);
    }

    return ret;
}

function getRandInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}
