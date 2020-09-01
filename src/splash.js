import * as PIXI from "pixi.js";

export default class SplashScreen extends PIXI.Container {
    constructor({
        app,
        width,
        height
    }) {
        super();

        this.ticker = new PIXI.Ticker();
        this.ticker.autoStart = false;
        this.ticker.add(() => {
            app.render();
        });

        let ctx = new PIXI.Graphics();
        ctx.beginFill(0xffffff);
        ctx.drawRect(0, 0, width, height);
        ctx.endFill();

        this.bg = new PIXI.Sprite(app.renderer.generateTexture(ctx));
        this.progress = new PIXI.Text("Loading 0%", new PIXI.TextStyle({
            fontSize: 20,
            fontFamily: 'Press Start 2P'
        }));
        this.progress.position.set(width / 2 - this.progress.width / 2, height / 2 - this.progress.height);

        this.addChild(this.bg, this.progress);
        this.ticker.start();
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }
}