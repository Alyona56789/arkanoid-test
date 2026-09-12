function getColor(varName) {
    const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return parseInt(color.replace('#', ''), 16);
}

function getStyle(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

class ArkanoidGame {
    constructor() {
        this.WIDTH = 800;
        this.HEIGHT = 600;
        
        this.app = new PIXI.Application({
            width: this.WIDTH, 
            height: this.HEIGHT,
            backgroundColor: getColor('--color-bg'), 
            antialias: true
        });
        document.getElementById('game-container').appendChild(this.app.view);

        this.paddle = null; 
        this.ball = null; 
        this.bricks = [];
        this.scoreText = null; 
        this.messageText = null;

        this.init();
    }

    init() {
        this.createUI(); 
        this.createPaddle(); 
        this.createBall(); 
        this.createBricks();
    }

    createUI() {
        this.scoreText = new PIXI.Text('Очки: 0', { 
            fontFamily: getStyle('--font-family'),       
            fontSize: parseInt(getStyle('--font-size-score')),
            fill: getColor('--color-score')          
        });
        this.scoreText.x = 10; 
        this.scoreText.y = 10; 
        this.app.stage.addChild(this.scoreText);

        this.messageText = new PIXI.Text('', { 
            fontFamily: getStyle('--font-family'),       
            fontSize: parseInt(getStyle('--font-size-message')), 
            fill: getColor('--color-message'),           
            align: 'center' 
        });
        this.messageText.anchor.set(0.5); 
        this.messageText.x = this.WIDTH / 2; 
        this.messageText.y = this.HEIGHT / 2;
        this.app.stage.addChild(this.messageText);
    }

    createPaddle() {
        this.paddle = new PIXI.Graphics();
        this.paddle.beginFill(getColor('--color-paddle')); 
        this.paddle.drawRoundedRect(0, 0, 100, 16, 8); 
        this.paddle.endFill();
        this.paddle.x = (this.WIDTH - 100) / 2; 
        this.paddle.y = this.HEIGHT - 40;
        this.app.stage.addChild(this.paddle);
    }

    createBall() {
        this.ball = new PIXI.Graphics();
        this.ball.beginFill(getColor('--color-ball')); 
        this.ball.drawCircle(0, 0, 8); 
        this.ball.endFill();
        this.ball.x = this.WIDTH / 2; 
        this.ball.y = this.HEIGHT - 60;
        this.app.stage.addChild(this.ball);
    }

    createBricks() {
        const brickColors = [
            getColor('--color-brick-1'),
            getColor('--color-brick-2'),
            getColor('--color-brick-3'),
            getColor('--color-brick-4'),
            getColor('--color-brick-5')
        ];
        
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 10; c++) {
                const brick = new PIXI.Graphics();
                brick.beginFill(brickColors[r]); 
                brick.drawRoundedRect(0, 0, 70, 20, 4); 
                brick.endFill();
                brick.x = c * 80 + 5; 
                brick.y = r * 30 + 50; 
                brick.active = true;
                this.app.stage.addChild(brick); 
                this.bricks.push(brick);
            }
        }
    }
}
window.gameInstance = new ArkanoidGame();