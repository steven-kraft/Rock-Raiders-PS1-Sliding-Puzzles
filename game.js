class mainScene extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload(){
        this.load.image('background', 'assets/background.png');
    }

    create() {
        this.add.image(320, 240, 'background');
    }
}

window.onload = function() {
    var config = {
        width: 640,
        height: 480,
        backgroundColor: 0x000000,
        scene: [mainScene],
    }

    var game = new Phaser.Game(config);
}