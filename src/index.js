import * as PIXI from "pixi.js";
import Sound from "pixi-sound";
import Stats from "stats.js";
import scale from "./lib/scale";
import loadFonts from "./lib/webfont";
import math, {
    randInt
} from "./lib/math";

const app = new PIXI.Application({
    width: 1024,
    height: 768,
    antialias: true,
    backgroundColor: 0x1099bb
});

loadFonts(["Press Start 2P"], init);

function init() {
    document.body.appendChild(app.view);
    scale(app.view);
    window.addEventListener('resize', () => scale(app.view));

    app.loader.onProgress.add(p => {
        console.log(p);
    });
    app.loader.add('tileset', './assets/sprites/tileset.json').load(setup);
}

function setup(loader, resources) {
    let stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const tileset = resources.tileset.textures;
    // const sounds = resourses.sounds.sound

    let sky = new PIXI.TilingSprite(tileset['sprite_16.png'], app.screen.width, app.screen.height);

    let ground = new PIXI.TilingSprite(tileset['sprite_09.png'], 1024, 100);
    ground.tileScale.set(0.7);
    ground.position.set(0, app.screen.height - ground.height);

    let bushes = new PIXI.Container();
    for (let i = 0; i < 20; i++) {
        let bush = new PIXI.Sprite(tileset['sprite_17.png']);
        bush.width = bush.height = randInt(20, 50);
        bush.position.set(randInt(30, app.screen.width - 30), 50 - bush.height);
        bushes.addChild(bush);
    }
    bushes.position.set(0, ground.y - bushes.height);

    let title = new PIXI.Text("WELCOME\nPirtwo Github Page", new PIXI.TextStyle({
        fontSize: 35,
        fontFamily: 'Press Start 2P',
        lineHeight: 50,
        align: 'center'
    }));
    title.anchor.set(0.5);
    title.position.set(app.screen.width / 2, 100);

    app.stage.addChild(sky, ground, bushes, title);

    // game loop
    app.ticker.add((delta) => {
        stats.begin();

        // update game here
        sky.tilePosition.x += 0.2;

        stats.end();
    });
}