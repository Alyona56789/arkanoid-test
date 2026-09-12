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
        this.state = 'MENU'; 
        this.score = 0;
        this.soundEnabled = true;
        
        this.bgm = new Audio('music/music.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.3;
        
        this.wallSound = new Audio('music/wall-hit.mp3');
        this.wallSound.volume = 0.4;
        
        this.paddleSound = new Audio('music/paddle-hit.mp3');
        this.paddleSound.volume = 0.4;
        
        this.brickSound = new Audio('music/brick-break.mp3');
        this.brickSound.volume = 0.5;
        
        this.gameOverSound = new Audio('music/game-over.mp3');
        this.gameOverSound.volume = 0.6;
        
        this.victorySound = new Audio('music/victory.mp3');
        this.victorySound.volume = 0.6;

        this.app = new PIXI.Application({
            width: this.WIDTH, height: this.HEIGHT,
            backgroundColor: getColor('--color-bg'), antialias: true
        });
        document.getElementById('game-container').appendChild(this.app.view);

        this.paddle = null; this.ball = null; this.bricks = [];
        this.scoreText = null; this.messageText = null;
        this.ballVX = 4; this.ballVY = -4;

        this.init();
    }

    init() {
        this.createUI(); this.createPaddle(); this.createBall(); this.createBricks();
        
        this.app.view.addEventListener('mousemove', (e) => this.handleInput(e));
        this.app.view.addEventListener('click', () => this.handleClick());
        document.addEventListener('keydown', (e) => this.handleKeyInput(e));
        this.app.ticker.add((delta) => this.update(delta));
        this.showMessage('АРКАНОИД\n\nНажмите ПРОБЕЛ или КЛИКНИТЕ\nдля начала обучения\nM - вкл/выкл звук');
    }

    playEffect(audioElement) {
        if (!this.soundEnabled) return;
        
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        if (this.soundEnabled) {
            if (this.state === 'PLAYING' || this.state === 'TUTORIAL') {
                this.bgm.play().catch(() => {});
            }
            this.bgm.volume = 0.3;
            this.wallSound.volume = 0.4;
            this.paddleSound.volume = 0.4;
            this.brickSound.volume = 0.5;
            this.gameOverSound.volume = 0.6;
            this.victorySound.volume = 0.6;
        } else {
            this.bgm.pause();
            this.bgm.volume = 0;
            this.wallSound.volume = 0;
            this.paddleSound.volume = 0;
            this.brickSound.volume = 0;
            this.gameOverSound.volume = 0;
            this.victorySound.volume = 0;
        }
        
        const status = this.soundEnabled ? 'Звук ВКЛ' : 'Звук ВЫКЛ';
        if (this.state === 'MENU' || this.state === 'GAME_OVER') {
            const currentText = this.messageText.text.split('\nM - ')[0];
            this.showMessage(currentText + `\nM - ${status}`);
        }
    }

    showMessage(text) {
        this.messageText.text = text;
        this.messageText.visible = true;
        this.ball.visible = (this.state !== 'MENU');
    }

    hideMessage() {
        this.messageText.visible = false;
        this.ball.visible = true;
    }

    resetPositions() {
        this.ball.x = this.WIDTH / 2; 
        this.ball.y = this.HEIGHT - 60;
        this.ballVX = 4; this.ballVY = -4;
        this.paddle.x = (this.WIDTH - 100) / 2;
        this.paddle.scale.set(1); 
    }

    createUI() {
        this.scoreText = new PIXI.Text('Очки: 0', { 
            fontFamily: getStyle('--font-family'), fontSize: parseInt(getStyle('--font-size-score')), fill: getColor('--color-score')
        });
        this.scoreText.x = 10; this.scoreText.y = 10; 
        this.app.stage.addChild(this.scoreText);

        this.messageText = new PIXI.Text('', { 
            fontFamily: getStyle('--font-family'), fontSize: parseInt(getStyle('--font-size-message')), fill: getColor('--color-message'), align: 'center' 
        });
        this.messageText.anchor.set(0.5); 
        this.messageText.x = this.WIDTH / 2; this.messageText.y = this.HEIGHT / 2;
        this.app.stage.addChild(this.messageText);
    }

    createPaddle() {
        this.paddle = new PIXI.Graphics();
        this.paddle.beginFill(getColor('--color-paddle'));
        this.paddle.drawRoundedRect(0, 0, 100, 16, 8); this.paddle.endFill();
        this.paddle.x = (this.WIDTH - 100) / 2; this.paddle.y = this.HEIGHT - 40;
        this.app.stage.addChild(this.paddle);
    }

    createBall() {
        this.ball = new PIXI.Graphics();
        this.ball.beginFill(getColor('--color-ball'));
        this.ball.drawCircle(0, 0, 8); this.ball.endFill();
        this.ball.x = this.WIDTH / 2; this.ball.y = this.HEIGHT - 60;
        this.app.stage.addChild(this.ball);
    }

    createBricks() {
        const brickColors = [getColor('--color-brick-1'), getColor('--color-brick-2'), getColor('--color-brick-3'), getColor('--color-brick-4'), getColor('--color-brick-5')];
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 10; c++) {
                const brick = new PIXI.Graphics();
                brick.beginFill(brickColors[r]); brick.drawRoundedRect(0, 0, 70, 20, 4); brick.endFill();
                brick.x = c * 80 + 5; brick.y = r * 30 + 50; brick.active = true;
                this.app.stage.addChild(brick); this.bricks.push(brick);
            }
        }
    }

    handleInput(e) {
        if (this.state === 'PLAYING' || this.state === 'TUTORIAL') {
            const rect = this.app.view.getBoundingClientRect();
            this.paddle.x = (e.clientX - rect.left) - 50;
            if (this.paddle.x < 0) this.paddle.x = 0;
            if (this.paddle.x > this.WIDTH - 100) this.paddle.x = this.WIDTH - 100;
        }
    }

    handleKeyInput(e) {
        if (this.state === 'MENU' && e.code === 'Space') {
            this.startTutorial();
        } else if (this.state === 'GAME_OVER' && e.code === 'Space') {
            this.restartGame(); 
        } else if (e.code === 'KeyM') {
            this.toggleSound();
        }
    }

    handleClick() {
        if (this.state === 'MENU') {
            this.startTutorial();
        } else if (this.state === 'GAME_OVER') {
            this.restartGame();
        }
    }

    startTutorial() {
        this.state = 'TUTORIAL';
        this.showMessage('ОБУЧЕНИЕ\n\nУправляйте мышью');
        this.resetPositions();
        this.ballVX = 1; 
        this.ballVY = -1; 
        
        if (this.soundEnabled) {
            this.bgm.currentTime = 0;
            this.bgm.play().catch(() => {});
        }
        
        setTimeout(() => {
            if (this.state === 'TUTORIAL') {
                this.state = 'PLAYING';
                this.hideMessage();
                this.ballVX = 4 * Math.sign(this.ballVX); 
                this.ballVY = -4;
            }
        }, 4000);
    }

    restartGame() {
        this.score = 0;
        this.scoreText.text = 'Очки: 0';
        this.bricks.forEach(b => { 
            b.active = true; 
            b.visible = true; 
            b.scale.set(1); 
            b.alpha = 1;
        }); 
        this.startTutorial(); 
    }

    update(delta) {
        if (this.state !== 'PLAYING' && this.state !== 'TUTORIAL') {
            if (this.bgm && !this.bgm.paused && this.state === 'GAME_OVER') {
                this.bgm.pause();
            }
            return;
        }

        this.ball.x += this.ballVX * delta; this.ball.y += this.ballVY * delta;
        
        if (this.ball.x < 8 || this.ball.x > this.WIDTH - 8) {
            this.ballVX = -this.ballVX;
            this.playEffect(this.wallSound);
        }
        if (this.ball.y < 8) {
            this.ballVY = -this.ballVY;
            this.playEffect(this.wallSound);
        }
        
        if (this.ball.y > this.HEIGHT) {
            this.state = 'GAME_OVER';
            this.showMessage(`ИГРА ОКОНЧЕНА\nОчки: ${this.score}\n\nНажмите ПРОБЕЛ для рестарта`);
            this.playEffect(this.gameOverSound);
            if (this.bgm) this.bgm.pause();
            return;
        }
        
        if (this.ball.y + 8 >= this.paddle.y && this.ball.y - 8 <= this.paddle.y + 16 &&
            this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + 100) {
            this.ballVY = -Math.abs(this.ballVY);
            this.ballVX = (this.ball.x - (this.paddle.x + 50)) * 0.15;
            
            this.paddle.scale.y = 0.6;
            setTimeout(() => { this.paddle.scale.y = 1; }, 100);
            
            this.playEffect(this.paddleSound);
        }

        let activeBricks = 0;
        this.bricks.forEach(brick => {
            if (!brick.active) return;
            activeBricks++;
            
            if (this.ball.x + 8 > brick.x && this.ball.x - 8 < brick.x + 70 &&
                this.ball.y + 8 > brick.y && this.ball.y - 8 < brick.y + 20) {
                
                brick.active = false; 
                this.ballVY = -this.ballVY;
                this.score += 10;
                this.scoreText.text = `Очки: ${this.score}`;
                
                this.playEffect(this.brickSound);

                let frames = 0;
                const animateDestruction = () => {
                    frames++;
                    brick.scale.x -= 0.1;
                    brick.scale.y -= 0.1;
                    brick.alpha -= 0.1;
                    
                    if (frames < 10) {
                        requestAnimationFrame(animateDestruction);
                    } else {
                        brick.visible = false;
                    }
                };
                animateDestruction();
            }
        });

        if (activeBricks === 0) {
            this.state = 'GAME_OVER';
            this.showMessage(`ПОБЕДА!\nОчки: ${this.score}\n\nНажмите ПРОБЕЛ для новой игры`);
            this.playEffect(this.victorySound);
            if (this.bgm) this.bgm.pause();
        }
    }
}
window.gameInstance = new ArkanoidGame();