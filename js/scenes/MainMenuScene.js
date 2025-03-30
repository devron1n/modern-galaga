class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Добавляем фоновое изображение
        this.add.image(0, 0, 'background').setOrigin(0);
        
        // Создаем заголовок игры
        const title = this.add.text(
            this.cameras.main.width / 2,
            100,
            'MODERN GALAGA',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6,
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, stroke: true, fill: true }
            }
        ).setOrigin(0.5);
        
        // Эффекты для заголовка
        this.tweens.add({
            targets: title,
            scale: { from: 0.9, to: 1.1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Создаем кнопку "Начать игру"
        const startButton = this.createButton(
            this.cameras.main.width / 2,
            300,
            'Начать игру',
            () => {
                this.scene.start('GameScene');
            }
        );
        
        // Кнопка настроек (заглушка)
        const settingsButton = this.createButton(
            this.cameras.main.width / 2,
            380,
            'Настройки',
            () => {
                console.log('Настройки (не реализовано)');
            }
        );
        
        // Отображаем рекорд
        const highScore = window.gameSettings.highScore || 0;
        this.add.text(
            this.cameras.main.width / 2,
            500,
            `Лучший результат: ${highScore}`,
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Добавляем информацию о разработчике
        this.add.text(
            this.cameras.main.width - 10,
            this.cameras.main.height - 10,
            'Made with Phaser 3',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#cccccc'
            }
        ).setOrigin(1);
    }
    
    createButton(x, y, text, callback) {
        // Создаем кнопку с фоном и текстом
        const button = this.add.rectangle(x, y, 250, 60, 0x3498db, 0.8)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback);
            
        // Эффекты при наведении мыши
        button.on('pointerover', () => {
            button.setFillStyle(0x2980b9, 0.8);
            buttonText.setScale(1.1);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x3498db, 0.8);
            buttonText.setScale(1);
        });
        
        // Добавляем текст на кнопку
        const buttonText = this.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        return button;
    }
}
