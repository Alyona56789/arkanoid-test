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
        this.ballVX = 4; 
        this.ballVY = -4;

        this.init();
    }

    init() {
        this.createUI(); 
        this.createPaddle(); 
        this.createBall(); 
        this.createBricks();
        
        this.app.view.addEventListener('mousemove', (e) => this.handleInput(e));
        this.app.ticker.add((delta) => this.update(delta));
    }

    resetPositions() {
        this.ball.x = this.WIDTH / 2; 
        this.ball.y = this.HEIGHT - 60;
        this.ballVX = 4;
        this.ballVY = -4;
        this.paddle.x = (this.WIDTH - 100) / 2;
    }

    createUI() {
        this.scoreText = new PIXI.Text('Очки: 0', { 
            fontFamily: getStyle('--font-family'),
            fontSize: parseInt(getStyle('--font-size-score')),
            fill: getColor('--color-score')
        });
        this.scoreText.x = 10; this.scoreText.y = 10; 
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
            getColor('--color-brick-1'), getColor('--color-brick-2'),
            getColor('--color-brick-3'), getColor('--color-brick-4'),
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

    handleInput(e) {
        const rect = this.app.view.getBoundingClientRect();
        this.paddle.x = (e.clientX - rect.left) - 50;
        if (this.paddle.x < 0) this.paddle.x = 0;
        if (this.paddle.x > this.WIDTH - 100) this.paddle.x = this.WIDTH - 100;
    }

    update(delta) {
        this.ball.x += this.ballVX * delta; 
        this.ball.y += this.ballVY * delta;
        
        if (this.ball.x < 8 || this.ball.x > this.WIDTH - 8) this.ballVX = -this.ballVX;
        if (this.ball.y < 8) this.ballVY = -this.ballVY;
        
        if (this.ball.y > this.HEIGHT) {
            this.resetPositions();
        }
        
        if (this.ball.y + 8 >= this.paddle.y && this.ball.y - 8 <= this.paddle.y + 16 &&
            this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + 100) {
            this.ballVY = -Math.abs(this.ballVY);
            this.ballVX = (this.ball.x - (this.paddle.x + 50)) * 0.15;
            this.paddle.scale.y = 0.7;
            setTimeout(() => { this.paddle.scale.y = 1; }, 100);
        }

        this.bricks.forEach(brick => {
            if (!brick.active) return; 
            
            if (this.ball.x + 8 > brick.x && 
                this.ball.x - 8 < brick.x + 70 &&
                this.ball.y + 8 > brick.y && 
                this.ball.y - 8 < brick.y + 20) {
                
                brick.active = false;
                brick.visible = false;
                
                this.ballVY = -this.ballVY;
            }
        });
    }
}

window.gameInstance = new ArkanoidGame();