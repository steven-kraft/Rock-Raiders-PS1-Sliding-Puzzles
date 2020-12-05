const PUZZLE_X = 117;
const PUZZLE_Y = 38;
const POSITIONS = [
    [{x:0, y:0}, {x:122, y:0}, {x:244, y:0}],
    [{x:0, y:122}, {x:122, y:122}, {x:244, y:122}],
    [{x:0, y:244}, {x:122, y:244}, {x:244, y:244}],
]
const EMPTY = [0,0,8,8,0,2,0,2,0] //Location of the initial empty square in each puzzle
const urlParams = new URLSearchParams(window.location.search);
const kermit = urlParams.get('kermit');


class mainScene extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.image('message', 'assets/message.png');
        this.load.image('shuffling', 'assets/shuffling.png');
        this.load.image('complete', 'assets/complete.png');
        for (let i = 1; i < 10; i++) {
            this.load.spritesheet(`puzzle${i}`, `assets/puzzle${i}.png`, { frameWidth: 122, frameHeight: 122 });
        }
        this.load.spritesheet('kermit', `assets/kermit.png`, { frameWidth: 122, frameHeight: 122 });
        this.load.audio('slide', 'assets/slide.wav')
    }

    create() {
        this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.staging_step = 0;

        var puzzle_id = Math.floor(Math.random() * 9);
        var puzzle = `puzzle${puzzle_id + 1}`
        this.cur_pos = {x:(Math.floor(EMPTY[puzzle_id]/3)), y:(EMPTY[puzzle_id]%3)}

        if(kermit) {
            puzzle = 'kermit'
            this.cur_pos = {x:0, y:0}
        }

        this.add.image(320, 240, 'background');
        
        this.pieces = []
        
        for (let i = 0; i < 3; i++) {
            var row = []
            for (let j = 0; j < 3; j++) {
                row.push(this.add.sprite(PUZZLE_X + POSITIONS[i][j].x, PUZZLE_Y + POSITIONS[i][j].y, puzzle, (i*3 + j)).setOrigin(0));
            }
            this.pieces.push(row);
        }
        this.message = this.add.image(105, 434, 'message').setOrigin(0);
        this.message.setTexture('message');
    }

    staging() {
        if (this.staging_step % 2 == 0) {
            let moving = false;
            var choice;
            while (moving == false) {
                choice = Math.floor(Math.random() * 4);
                if (choice == 0) {
                    moving = this.move_piece("left", false);
                } else if (choice == 1) {
                    moving = this.move_piece("right", false);
                } else if (choice == 2) {
                    moving = this.move_piece("up", false);
                } else if (choice == 3) {
                    moving = this.move_piece("down", false);
                } 
            }
        }
        this.staging_step += 1;
        if (this.staging_step >= 150) {
            this.sound.play('slide');
            this.message.setTexture('message');
            this.complete = false;
        }
        
    }

    move_piece(direction, sound=true) {
        var moving = false;
        if (direction == "left" && this.cur_pos.y != 2) {
            new_pos = {x: this.cur_pos.x, y: this.cur_pos.y + 1}
            moving = true;
        } else if (direction == "right" && this.cur_pos.y != 0) {
            new_pos = {x: this.cur_pos.x, y: this.cur_pos.y - 1}
            moving = true;
        } else if (direction == "up" && this.cur_pos.x != 2) {
            new_pos = {x: this.cur_pos.x + 1, y: this.cur_pos.y}
            moving = true;
        } else if (direction == "down" && this.cur_pos.x != 0) {
            new_pos = {x: this.cur_pos.x - 1, y: this.cur_pos.y}
            moving = true;
        }
        if(moving) {
            var new_pos;
            var blank_piece = this.pieces[this.cur_pos.x][this.cur_pos.y];
            var new_piece = this.pieces[new_pos.x][new_pos.y];
            new_piece.x = PUZZLE_X + POSITIONS[this.cur_pos.x][this.cur_pos.y].x;
            new_piece.y = PUZZLE_Y + POSITIONS[this.cur_pos.x][this.cur_pos.y].y;
            blank_piece.x = PUZZLE_X + POSITIONS[new_pos.x][new_pos.y].x;
            blank_piece.y = PUZZLE_Y + POSITIONS[new_pos.x][new_pos.y].y;
            this.pieces[this.cur_pos.x][this.cur_pos.y] = new_piece;
            this.pieces[new_pos.x][new_pos.y] = blank_piece;
            this.cur_pos.x = new_pos.x;
            this.cur_pos.y = new_pos.y;
            if(sound) {this.sound.play('slide');}
        }
        if(this.is_complete()) {
            this.message.setTexture('complete');
            this.complete = true;
        }
        return moving;
    }

    is_complete() {
        let order = []
        for (var row in this.pieces) {
            for (var p in this.pieces[row]) {
                order.push(this.pieces[row][p].frame.name)
            }
        }
        return !!order.reduce((n, item) => n !== false && item >= n && item);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.restart();
        }
        if (this.staging_step < 150) {
            this.message.setTexture('shuffling');
            this.staging();
            return;
        }
        
        if (!this.complete) {
            if (Phaser.Input.Keyboard.JustDown(this.left)) {
                this.move_piece("left");
            } else if (Phaser.Input.Keyboard.JustDown(this.right)) {
                this.move_piece("right");
            } else if (Phaser.Input.Keyboard.JustDown(this.up)) {
                this.move_piece("up");
            } else if (Phaser.Input.Keyboard.JustDown(this.down)) {
                this.move_piece("down");;
            }
        }
    }
}

window.onload = function() {
    var config = {
        width: 640,
        height: 480,
        backgroundColor: 0x000000,
        parent: 'parent',
        scene: [mainScene],
        scale: {
            autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        }
    }

    var game = new Phaser.Game(config);
}