import * as PIXI from "pixi.js";
import Sound from "pixi-sound";
import Stats from "stats.js";
import scale from "./lib/scale";
import loadFonts from "./lib/webfont";
import {
    randInt
} from "./lib/math";
import {
    loadFrames
} from "./lib/utils";
import Bunney from "./bunney";
import SplashScreen from "./splash";

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
    window.focus();
    window.addEventListener('resize', () => scale(app.view));

    splashScreen = new SplashScreen({
        app: app,
        width: app.screen.width,
        height: app.screen.height
    });

    app.stage.addChild(splashScreen);

    app.loader.onProgress.add(e => {
        console.log(e)
        splashScreen.progress.text = `Loading ${e.progress}%`
    });
    app.loader
        .add('music', './assets/sounds/music.mp3')
        .add('tileset', './assets/sprites/tileset.json')
        .load(setup);
}

function setup(loader, resources) {
    let stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    let isMuted = false;
    let ctx = new PIXI.Graphics();
    const tileset = resources.tileset.textures;
    const music = resources.music.sound;

    music.volume = 0.2;
    music.loop = true;
    music.play();
    window.addEventListener("blur", () => {
        music.pause();
    });
    window.addEventListener("focus", () => {
        music.play();
    });

    let sky = new PIXI.TilingSprite(tileset['sprite_16.png'], app.screen.width, app.screen.height);

    let title = new PIXI.Text("WELCOME\nPirtwo Github Page", new PIXI.TextStyle({
        fontSize: 35,
        fontFamily: 'Press Start 2P',
        lineHeight: 50,
        align: 'center'
    }));
    title.anchor.set(0.5);
    title.position.set(app.screen.width / 2, 100);

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

    const familyMembers = 3;
    let bunnies = [];
    let bunneyCnt = new PIXI.Container();
    let frames = loadFrames({
        tileset: tileset,
        name: 'sprite_',
        format: 'png',
        frames: ['00', '01', '02', '03', '04', '05', '06', '07']
    });
    for (let i = 0; i < familyMembers; i++) {
        const bunney = new Bunney({
            speed: 1,
            frames: frames
        });
        bunney.sprite.width = bunney.sprite.height = randInt(100, 150);
        bunney.speed = Math.floor(bunney.sprite.height / 150 * 5);
        bunney.sprite.position.set(randInt(50, app.screen.width - 50), 155 - bunney.sprite.height);
        bunney.lookRight();
        bunnies.push(bunney);
        bunneyCnt.addChild(bunney.sprite);
    }    
    bunneyCnt.position.set(0, 535);

    // animating the bunnies here
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

    let linkList = [{
            title: '8Puzzle',
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
    ];
    let linksCnt = new PIXI.Container();
    ctx.beginFill(0xffffff);
    ctx.drawRoundedRect(0, 0, 150, 150, 10);
    ctx.endFill();
    for (let i = 0; i < linkList.length; i++) {
        let link = new PIXI.Container();
        let bg = new PIXI.Sprite(app.renderer.generateTexture(ctx));
        let text = new PIXI.Text(linkList[i].title, new PIXI.TextStyle({
            fontSize: 17,
            align: 'center',
            fontFamily: 'Press Start 2P',
            wordWrap: true
        }));
        text.anchor.set(0.5);
        text.position.set(bg.width / 2, bg.height / 2);

        link.addChild(bg, text);
        link.position.set(i * (link.width + 50), 0);
        linksCnt.addChild(link);

        link.interactive = true;
        link.buttonMode = true;
        link.on("pointerdown", e => {
            window.location.assign(linkList[i].url);
        });
    }
    linksCnt.position.set(app.screen.width / 2 - linksCnt.width / 2, 220);

    let soundBtn = new PIXI.Sprite(tileset['audioOn.png']);
    soundBtn.buttonMode = true;
    soundBtn.interactive = true;
    soundBtn.width = soundBtn.height = 50;
    soundBtn.tint = 0x000000;
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

    app.stage.addChild(sky, ground, bushes, bunneyCnt, linksCnt, soundBtn, title);

    // game loop
    app.ticker.add((delta) => {
        stats.begin();

        // update game here
        sky.tilePosition.x += 0.2;

        for (let i = 0; i < bunnies.length; i++) {
            const bunney = bunnies[i];
            if (bunney.sprite.x < 100)
                bunney.runRight();
            if (bunney.sprite.x > app.screen.width - 100)
                bunney.runLeft();
            bunney.update();
        }

        stats.end();
    });
}