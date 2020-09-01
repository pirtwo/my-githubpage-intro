import * as PIXI from "pixi.js";

export default class Bunney {
    constructor({
        speed,
        frames = []
    }) {
        this.speed = speed;
        this.state = 'lookLeft';
        this.sprite = new PIXI.AnimatedSprite(frames);
        this.sprite.animationSpeed = 0.15;
        this.sprite.onFrameChange = () => {
            if (this.state === 'runLeft' && this.sprite.currentFrame === 0)
                this.sprite.gotoAndPlay(5)
            if (this.state === 'runRight' && this.sprite.currentFrame === 4)
                this.sprite.gotoAndPlay(1)
        }
    }

    lookLeft() {
        this.state = 'lookLeft';
        this.sprite.gotoAndStop(4);
    }

    lookRight() {
        this.state = 'lookRight';
        this.sprite.gotoAndStop(0);
    }

    runLeft() {
        this.state = 'runLeft';
        this.sprite.gotoAndPlay(5);
    }

    runRight() {
        this.state = 'runRight';
        this.sprite.gotoAndPlay(1);
    }

    stop() {
        if (this.state === 'runLeft')
            this.lookLeft();
        if (this.state === 'runRight')
            this.lookRight();
    }

    update() {
        if (this.state === 'runLeft')
            this.sprite.position.x -= this.speed;
        if (this.state === 'runRight')
            this.sprite.position.x += this.speed;
    }

}