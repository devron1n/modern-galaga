class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        console.log('GameOverScene запущена');
        
        // Получаем данные об игре
        const score = window.gameSettings.score;
        const highScore = window.gameSettings.highScore;
        
        // Определяем размеры в зависимости от устройства
        const isMobile = this.isMobileDevice();
        const titleSize = isMobile ? '36px' : '48px';
        const scoreSize = isMobile ? '24px' : '32px';
        const highScoreSize = isMobile ? '20px' : '24px';
        const titleY = isMobile ? this.cameras.main.height * 0.2 : 150;
        const scoreY = isMobile ? this.cameras.main.height * 0.35 : 250;
        const recordY = isMobile ? this.cameras.main.height * 0.45 : 300;
        
        // Создаем фон
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033)
            .setOrigin(0);
        
        // Заголовок
        this.add.text(
            this.cameras.main.width / 2,
            titleY,
            'ИГРА ОКОНЧЕНА',
            {
                fontFamily: 'Arial',
                fontSize: titleSize,
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        
        // Отображаем счет
        this.add.text(
            this.cameras.main.width / 2,
            scoreY,
            `Ваш счет: ${score}`,
            {
                fontFamily: 'Arial',
                fontSize: scoreSize,
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Отображаем рекорд
        this.add.text(
            this.cameras.main.width / 2,
            recordY,
            `Лучший результат: ${highScore}`,
            {
                fontFamily: 'Arial',
                fontSize: highScoreSize,
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Если установлен новый рекорд
        if (score >= highScore && score > 0) {
            const newRecordY = isMobile ? this.cameras.main.height * 0.55 : 350;
            const newRecordSize = isMobile ? '28px' : '36px';
            
            const newRecord = this.add.text(
                this.cameras.main.width / 2,
                newRecordY,
                'НОВЫЙ РЕКОРД!',
                {
                    fontFamily: 'Arial',
                    fontSize: newRecordSize,
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
        
        // Определяем позиции кнопок
        const buttonY1 = isMobile ? this.cameras.main.height * 0.7 : 450;
        const buttonY2 = isMobile ? this.cameras.main.height * 0.85 : 520;
        
        // Создаем кнопку рестарта
        const restartButton = this.createButton(
            this.cameras.main.width / 2,
            buttonY1,
            'Играть снова',
            () => {
                // Сбрасываем настройки и перезапускаем игру
                window.gameSettings.score = 0;
                window.gameSettings.lives = 3;
                window.gameSettings.gameSpeed = 1;
                window.gameSettings.difficulty = 1;
                this.scene.start('GameScene');
            }
        );
        
        // Создаем кнопку "В меню"
        const menuButton = this.createButton(
            this.cameras.main.width / 2,
            buttonY2,
            'В главное меню',
            () => {
                this.scene.start('BootScene');
            }
        );
        
        // Добавляем обработчик изменения размера
        this.scale.on('resize', this.resize, this);
    }
    
    createButton(x, y, text, callback) {
        // Определяем размеры в зависимости от устройства
        const isMobile = this.isMobileDevice();
        const buttonWidth = isMobile ? 280 : 250;
        const buttonHeight = isMobile ? 80 : 60;
        const fontSize = isMobile ? '28px' : '24px';
        
        // Создаем прямоугольник для кнопки
        const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x3498db, 0.8)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);
        
        // Эффекты при наведении (только для десктопа)
        if (!isMobile) {
            button.on('pointerover', () => {
                button.setFillStyle(0x2980b9, 0.8);
                buttonText.setScale(1.1);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(0x3498db, 0.8);
                buttonText.setScale(1);
            });
        }
        
        // Текст на кнопке
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: fontSize,
            color: '#ffffff'
        }).setOrigin(0.5);
        
        return button;
    }
    
    isMobileDevice() {
        // Определяем, является ли устройство мобильным
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
            (window.innerWidth <= 800)
        );
    }
    
    resize() {
        // Пересоздаем сцену при изменении размера
        this.scene.restart();
    }
}
