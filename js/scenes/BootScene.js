class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Создаем временные изображения для прелоадера
        this.createLoadingAssets();
    }

    createLoadingAssets() {
        // Создаем временное изображение для фона загрузки
        const bgGraphics = this.make.graphics();
        bgGraphics.fillStyle(0x000033);
        bgGraphics.fillRect(0, 0, 400, 30);
        bgGraphics.generateTexture('loading-background', 400, 30);
        bgGraphics.destroy();

        // Создаем временное изображение для полосы загрузки
        const barGraphics = this.make.graphics();
        barGraphics.fillStyle(0x3498db);
        barGraphics.fillRect(0, 0, 400, 30);
        barGraphics.generateTexture('loading-bar', 400, 30);
        barGraphics.destroy();

        console.log('Временные ассеты для загрузки созданы');
    }

    create() {
        console.log('BootScene завершена, отображаем стартовое меню');
        
        // Определяем размеры в зависимости от устройства
        const isMobile = this.isMobileDevice();
        const titleSize = isMobile ? '40px' : '64px';
        const subtitleSize = isMobile ? '20px' : '28px';
        const titleY = isMobile ? this.cameras.main.height * 0.2 : this.cameras.main.height * 0.3;
        
        // Создаем фон
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033)
            .setOrigin(0);
            
        // Создаем звезды для фона
        this.createStars();
        
        // Заголовок игры
        const title = this.add.text(
            this.cameras.main.width / 2,
            titleY,
            'MODERN GALAGA',
            {
                fontFamily: 'Arial',
                fontSize: titleSize,
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        
        // Подзаголовок
        this.add.text(
            this.cameras.main.width / 2,
            titleY + 80,
            'Космический шутер',
            {
                fontFamily: 'Arial',
                fontSize: subtitleSize,
                color: '#3498db'
            }
        ).setOrigin(0.5);
        
        // Определяем позиции кнопок
        const buttonY1 = isMobile ? this.cameras.main.height * 0.6 : this.cameras.main.height * 0.6;
        
        // Создаем кнопку "Начать игру"
        this.createButton(
            this.cameras.main.width / 2,
            buttonY1,
            'НАЧАТЬ ИГРУ',
            () => {
                console.log('Кнопка НАЧАТЬ ИГРУ нажата');
                // Сбрасываем настройки и запускаем игру
                window.gameSettings.score = 0;
                window.gameSettings.lives = 3;
                window.gameSettings.gameSpeed = 1;
                window.gameSettings.difficulty = 1;
                
                try {
                    console.log('Пытаемся запустить GameScene');
                    this.scene.start('GameScene');
                    console.log('GameScene запущена');
                } catch (error) {
                    console.error('Ошибка при запуске GameScene:', error);
                }
            }
        );
        
        // Добавляем информацию об управлении
        const controlsY = isMobile ? this.cameras.main.height * 0.8 : this.cameras.main.height * 0.75;
        const controlsSize = isMobile ? '16px' : '18px';
        
        if (isMobile) {
            this.add.text(
                this.cameras.main.width / 2,
                controlsY,
                'Управление: левая часть экрана - движение, правая - стрельба',
                {
                    fontFamily: 'Arial',
                    fontSize: controlsSize,
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: this.cameras.main.width * 0.8 }
                }
            ).setOrigin(0.5);
        } else {
            this.add.text(
                this.cameras.main.width / 2,
                controlsY,
                'Управление: стрелки - движение, пробел - стрельба',
                {
                    fontFamily: 'Arial',
                    fontSize: controlsSize,
                    color: '#ffffff'
                }
            ).setOrigin(0.5);
        }
        
        // Добавляем анимацию для заголовка
        this.tweens.add({
            targets: title,
            y: title.y - 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
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
        
        // Добавляем пульсацию для кнопки на мобильных устройствах
        if (isMobile) {
            this.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 1000,
                yoyo: true,
                repeat: -1
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
    
    createStars() {
        // Создаем звезды для фона
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 3);
            
            const star = this.add.circle(x, y, size, 0xffffff, 0.8)
                .setDepth(-1);
                
            // Добавляем мерцание для некоторых звезд
            if (Phaser.Math.Between(0, 10) > 7) {
                this.tweens.add({
                    targets: star,
                    alpha: 0.3,
                    duration: Phaser.Math.Between(1000, 3000),
                    yoyo: true,
                    repeat: -1
                });
            }
            
            this.stars.push(star);
        }
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
