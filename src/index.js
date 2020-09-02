import * as PIXI from "pixi.js";
import Sound from "pixi-sound";
import scale from "./lib/scale";
import Particle from "./lib/particle";
import loadFonts from "./lib/webfont";
import Bunney from "./bunney";
import SplashScreen from "./splash";
import {
    randInt
} from "./lib/math";
import {
    loadFrames
} from "./lib/utils";


const app = new PIXI.Application({
    width: 1024,
    height: 768,
    antialias: true,
    backgroundColor: 0x1099bb
});

let splashScreen;

loadFonts(["Press Start 2P"], init);

function init() {
    document.body.appendChild(app.view);
    scale(app.view);
    window.addEventListener('resize', () => scale(app.view));

    splashScreen = new SplashScreen({
        app: app,
        width: app.screen.width,
        height: app.screen.height
    });

    app.stage.addChild(splashScreen);

    app.loader.onProgress.add(e => {
        splashScreen.progress.text = `Loading ${e.progress}%`
    });
    app.loader
        .add('music', './assets/sounds/music.mp3')
        .add('tileset', './assets/sprites/tileset.json')
        .load(setup);
}

function setup(loader, resources) { 
    let isMuted = false;
    const particle = new Particle();
    const tileset = resources.tileset.textures;
    const music = resources.music.sound;

    music.volume = 0.2;
    music.loop = true;
    music.play();
    window.addEventListener("blur", () => {
        music.pause();
    });
    window.addEventListener("focus", () => {
        if (!music.isPlaying)
            music.resume();
    });

    let sky = createSky(tileset['sprite_16.png']);

    let sun = createSun(70, particle);
    sun.position.set(100, 100);

    let title = createTitle("WELCOME\nPirtwo Github Page");
    title.anchor.set(0.5);
    title.position.set(app.screen.width / 2, 100);

    let ground = createGround(tileset['sprite_09.png']);
    ground.tileScale.set(0.7);
    ground.position.set(0, app.screen.height - ground.height);

    let plantsCnt = createPlants(15, tileset['sprite_17.png']);
    plantsCnt.position.set(0, ground.y - plantsCnt.height);

    let frames = loadFrames({
        tileset: tileset,
        name: 'sprite_',
        format: 'png',
        frames: ['00', '01', '02', '03', '04', '05', '06', '07']
    });
    let {
        bunnies,
        bunniesCnt
    } = createBunnies(randInt(2, 3), frames);

    bunniesCnt.position.set(0, 535);
    setInterval(() => {
        for (let i = 0; i < bunnies.length; i++) {
            const bunney = bunnies[i];

            let r = Math.random();

            if (r >= 0 && r <= 0.3)
                bunney.lookLeft();
            if (r > 0.3 && r <= 0.6)
                bunney.lookRight();
            if (r > 0.6 && r <= 0.8 && bunney.state !== 'runLeft')
                bunney.runLeft();
            if (r > 0.8 && r <= 1 && bunney.state !== 'runRight')
                bunney.runRight();
        }
    }, 2000);

    let linksCnt = createLinks([{
            title: 'Sliding Puzzle',
            url: 'https://pirtwo.github.io/8puzzle/index.html'
        },
        {
            title: 'XO Game',
            url: 'https://pirtwo.github.io/tictactoe/index.html'
        },
        {
            title: 'Rabbit Sweeper',
            url: 'https://pirtwo.github.io/rabbitsweeper/index.html'
        }
    ]);
    linksCnt.position.set(app.screen.width / 2 - linksCnt.width / 2, 220);

    let soundBtn = createSoundBtn(tileset['audioOn.png']);
    soundBtn.position.set(app.screen.width - 70, 20);
    soundBtn.on("pointerdown", e => {
        if (isMuted) {
            Sound.unmuteAll();
            soundBtn.texture = tileset['audioOn.png'];
        } else {
            Sound.muteAll();
            soundBtn.texture = tileset['audioOff.png'];
        }
        isMuted = !isMuted;
    });

    splashScreen.hide();
    splashScreen.ticker.destroy();
    app.stage.removeChild(splashScreen);

    app.stage.addChild(sky, sun, title, ground, plantsCnt, bunniesCnt, linksCnt, soundBtn);

    // game loop
    app.ticker.add((delta) => {       
        sky.tilePosition.x += 0.2;

        for (let i = 0; i < bunnies.length; i++) {
            const bunney = bunnies[i];
            if (bunney.sprite.x < 100)
                bunney.runRight();
            if (bunney.sprite.x > app.screen.width - 100)
                bunney.runLeft();
            bunney.update();
        }

        particle.update(delta);
    });
}

function createTitle(text) {
    return new PIXI.Text(text, new PIXI.TextStyle({
        fontSize: 27,
        fontFamily: 'Press Start 2P',
        lineHeight: 50,
        align: 'center',
        fontWeight: 'bold'
    }));
}

function createSky(texture) {
    return new PIXI.TilingSprite(texture, app.screen.width, app.screen.height);
}

function createSun(radius, particle) {
    let ctx;
    let cnt = new PIXI.Container();

    ctx = new PIXI.Graphics();
    ctx.beginFill(0xffeb3b);
    ctx.drawCircle(0, 0, radius);
    ctx.endFill();
    let sun = new PIXI.Sprite(app.renderer.generateTexture(ctx));

    ctx = new PIXI.Graphics();
    ctx.beginFill(0xffeb3b);
    ctx.drawRect(0, 0, 10, 10);
    ctx.endFill();
    let sunrayTexture = app.renderer.generateTexture(ctx);
    let sunrays = new PIXI.ParticleContainer(1500, {
        uvs: true,
        alpha: true,
        scale: true,
        rotation: true,
    });
    sunrays.position.set(sun.width / 2, sun.height / 2);

    let emmiter = particle.emitter({
        x: 0,
        y: 0,
        number: 20,
        minSpeed: 0.5,
        maxSpeed: 2,
        minFadeSpeed: 0.01,
        maxFadeSpeed: 0.01,
        gravity: 0,
        container: sunrays,
        sprite: () => {
            let sp = new PIXI.Sprite(sunrayTexture);
            sp.anchor.set(0.5);
            return sp;
        }
    }, 1000);

    emmiter.start();

    cnt.addChild(sun, sunrays);
    return cnt;
}

function createGround(texture) {
    return new PIXI.TilingSprite(texture, 1024, 100);
}

function createPlants(number, texture) {
    let plants = new PIXI.Container();
    for (let i = 0; i < number; i++) {
        let plant = new PIXI.Sprite(texture);
        plant.width = plant.height = randInt(20, 50);
        plant.position.set(randInt(30, app.screen.width - 30), 50 - plant.height);
        plants.addChild(plant);
    }
    return plants;
}

function createBunnies(number, frames) {
    let bunnies = [];
    let bunniesCnt = new PIXI.Container();

    for (let i = 0; i < number; i++) {
        const bunney = new Bunney({
            speed: 1,
            frames: frames
        });
        bunney.sprite.width = bunney.sprite.height = randInt(100, 150);
        bunney.speed = Math.floor(bunney.sprite.height / 150 * 5);
        bunney.sprite.position.set(randInt(50, app.screen.width - 50), 155 - bunney.sprite.height);
        bunney.lookRight();
        bunnies.push(bunney);
        bunniesCnt.addChild(bunney.sprite);
    }

    return {
        bunnies,
        bunniesCnt
    }
}

function createLinks(list) {
    let ctx = new PIXI.Graphics();
    let cnt = new PIXI.Container();

    ctx.beginFill(0xf5f5f5);
    ctx.lineStyle(3, 0xe5e5e5);
    ctx.drawRoundedRect(0, 0, 150, 150, 10);
    ctx.endFill();
    let texture = app.renderer.generateTexture(ctx);

    for (let i = 0; i < list.length; i++) {
        let link = new PIXI.Container();
        let linkBg = new PIXI.Sprite(texture);
        let text = new PIXI.Text(list[i].title, new PIXI.TextStyle({
            fill: 0x000000,
            align: 'center',
            fontSize: 17,
            fontFamily: 'Press Start 2P',
            wordWrap: true,
            lineHeight: 25
        }));
        text.anchor.set(0.5);
        text.position.set(linkBg.width / 2, linkBg.height / 2);

        link.addChild(linkBg, text);
        link.position.set(i * (link.width + 50), 0);
        cnt.addChild(link);

        link.interactive = true;
        link.buttonMode = true;
        link.on("pointerdown", () => {
            window.location.assign(list[i].url);
        });
        link.on("pointerover", () => {
            linkBg.tint = 0xba68c8;
            text.style = new PIXI.TextStyle({
                fill: 0xffffff,
                align: 'center',
                fontSize: 17,
                fontFamily: 'Press Start 2P',
                wordWrap: true,
                lineHeight: 25
            });
        });
        link.on("pointerout", () => {
            linkBg.tint = 0xffffff;
            text.style = new PIXI.TextStyle({
                fill: 0x000000,
                align: 'center',
                fontSize: 17,
                fontFamily: 'Press Start 2P',
                wordWrap: true,
                lineHeight: 25
            });
        });
    }

    return cnt;
}

function createSoundBtn(onTexture) {
    let soundBtn = new PIXI.Sprite(onTexture);
    soundBtn.buttonMode = true;
    soundBtn.interactive = true;
    soundBtn.width = soundBtn.height = 50;
    soundBtn.tint = 0x000000;
    return soundBtn;
}