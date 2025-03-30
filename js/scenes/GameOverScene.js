class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        console.log('GameOverScene запущена');
        
        // Получаем данные об игре
        const score = window.gameSettings.score;
        const highScore = window.gameSettings.highScore;
        
        // Создаем фон
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033)
            .setOrigin(0);
        
        // Заголовок
        this.add.text(
            this.cameras.main.width / 2,
            150,
            'ИГРА ОКОНЧЕНА',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        
        // Отображаем счет
        this.add.text(
            this.cameras.main.width / 2,
            250,
            `Ваш счет: ${score}`,
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Отображаем рекорд
        this.add.text(
            this.cameras.main.width / 2,
            300,
            `Лучший результат: ${highScore}`,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Если установлен новый рекорд
        if (score >= highScore && score > 0) {
            const newRecord = this.add.text(
                this.cameras.main.width / 2,
                350,
                'НОВЫЙ РЕКОРД!',
                {
                    fontFamily: 'Arial',
                    fontSize: '36px',
                    fontStyle: 'bold',
                    color: '#ffd700'
                }
            ).setOrigin(0.5);
            
            // Анимация для текста нового рекорда
            this.tweens.add({
                targets: newRecord,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Создаем кнопку рестарта
        const restartButton = this.createButton(
            this.cameras.main.width / 2,
            450,
            'Играть снова',
            () => {
                // Сбрасываем настройки и перезапускаем игру
                window.gameSettings.score = 0;
                window.gameSettings.lives = 3;
                this.scene.start('GameScene');
            }
        );
        
        // Создаем кнопку "В меню"
        const menuButton = this.createButton(
            this.cameras.main.width / 2,
            520,
            'В главное меню',
            () => {
                this.scene.start('BootScene');
            }
        );
    }
    
    createButton(x, y, text, callback) {
        // Создаем прямоугольник для кнопки
        const button = this.add.rectangle(x, y, 250, 60, 0x3498db, 0.8)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);
        
        // Эффекты при наведении
        button.on('pointerover', () => {
            button.setFillStyle(0x2980b9, 0.8);
            buttonText.setScale(1.1);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x3498db, 0.8);
            buttonText.setScale(1);
        });
        
        // Текст на кнопке
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        return button;
    }
}
