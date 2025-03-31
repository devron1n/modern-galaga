class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Инициализация переменных
        this.score = 0;
        this.lives = window.gameSettings.lives;
        this.gameSpeed = window.gameSettings.gameSpeed;
        this.difficulty = window.gameSettings.difficulty;
        
        // Игровые таймеры и флаги
        this.enemyAttackTimer = null;
        this.enemyShootTimer = null;
        this.gameOver = false;
        this.isPaused = false;
    }

    create() {
        console.log('GameScene запущена');
        
        try {
            console.log('Создаем текстуры...');
            // Создаем текстуры, если их нет
            this.createTextures();
            
            console.log('Создаем фон...');
            // Создаем фон
            this.createBackground();
            
            console.log('Создаем игрока...');
            // Создаем игрока
            this.createPlayer();
            
            console.log('Создаем группы врагов...');
            // Создаем группы врагов
            this.createEnemies();
            
            console.log('Создаем группы пуль...');
            // Создаем группы пуль
            this.createBullets();
            
            console.log('Настройка коллизий...');
            // Настройка коллизий
            this.setupCollisions();
            
            console.log('Создаем UI...');
            // Создаем UI
            this.createUI();
            
            console.log('Включаем управление...');
            // Включаем управление
            this.setupInput();
            
            console.log('Настраиваем мобильное управление...');
            // Настраиваем мобильное управление
            this.setupMobileControls();
            
            console.log('Запускаем таймеры атак врагов...');
            // Запускаем таймеры атак врагов
            this.startEnemyAttacks();
            
            console.log('Добавляем обработчик изменения размера...');
            // Добавляем обработчик изменения размера
            this.scale.on('resize', this.resize, this);
            
            console.log('GameScene полностью инициализирована');
        } catch (error) {
            console.error('Ошибка при инициализации GameScene:', error);
        }
    }
    
    createTextures() {
        // Создаем текстуры для игры, если их еще нет
        
        // Игрок
        if (!this.textures.exists('player')) {
            const playerGraphics = this.make.graphics();
            playerGraphics.fillStyle(0x3498db);
            playerGraphics.fillRect(0, 0, 48, 48);
            playerGraphics.generateTexture('player', 48, 48);
            playerGraphics.destroy();
        }
        
        // Враги
        const enemyTypes = ['enemy-1', 'enemy-2', 'enemy-3'];
        const enemyColors = [0xe74c3c, 0x9b59b6, 0x2ecc71];
        
        for (let i = 0; i < enemyTypes.length; i++) {
            if (!this.textures.exists(enemyTypes[i])) {
                const enemyGraphics = this.make.graphics();
                enemyGraphics.fillStyle(enemyColors[i]);
                enemyGraphics.fillRect(0, 0, 40, 40);
                enemyGraphics.generateTexture(enemyTypes[i], 40, 40);
                enemyGraphics.destroy();
            }
        }
        
        // Пули
        if (!this.textures.exists('bullet-player')) {
            const bulletPlayerGraphics = this.make.graphics();
            bulletPlayerGraphics.fillStyle(0xf1c40f);
            bulletPlayerGraphics.fillRect(0, 0, 8, 16);
            bulletPlayerGraphics.generateTexture('bullet-player', 8, 16);
            bulletPlayerGraphics.destroy();
        }
        
        if (!this.textures.exists('bullet-enemy')) {
            const bulletEnemyGraphics = this.make.graphics();
            bulletEnemyGraphics.fillStyle(0xe74c3c);
            bulletEnemyGraphics.fillRect(0, 0, 8, 16);
            bulletEnemyGraphics.generateTexture('bullet-enemy', 8, 16);
            bulletEnemyGraphics.destroy();
        }
    }

    createBackground() {
        // Добавляем фоновое изображение
        this.bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000033)
            .setOrigin(0)
            .setDepth(-1);
            
        // Создаем звезды для фона (параллакс эффект)
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(1, 3);
            const speed = Phaser.Math.FloatBetween(0.1, 0.5);
            
            const star = this.add.circle(x, y, size, 0xffffff, 0.8)
                .setDepth(-1);
            
            this.stars.push({ star, speed });
        }
    }

    createPlayer() {
        try {
            console.log('Создание игрока...');
            
            // Определяем, является ли устройство мобильным
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            (window.innerWidth <= 800);
            
            // Для мобильных устройств устанавливаем игрока выше от нижнего края экрана
            const playerY = isMobile 
                ? this.cameras.main.height - 150  // Для мобильных устройств
                : this.cameras.main.height - 100; // Для десктопа
            
            // Создаем игрока (используем класс Player)
            this.player = new Player(
                this,
                this.cameras.main.width / 2,
                playerY
            );
            
            // Для мобильных устройств увеличиваем размер игрока для лучшей видимости
            if (isMobile) {
                this.player.setScale(1.3);
            }
            
            console.log('Игрок создан успешно');
        } catch (error) {
            console.error('Ошибка при создании игрока:', error);
        }
    }

    createEnemies() {
        console.log('Начало создания группы врагов...');
        try {
            // Проверим существование класса EnemyGroup
            if (typeof EnemyGroup === 'undefined') {
                console.error('Класс EnemyGroup не определен!');
                return;
            }
            
            console.log('Создаем группу врагов (используем класс EnemyGroup)');
            // Создаем группу врагов (используем класс EnemyGroup)
            this.enemyGroup = new EnemyGroup(this);
            
            console.log('Инициализируем первую волну врагов');
            // Инициализируем первую волну врагов
            this.enemyGroup.createWave();
            console.log('Группа врагов создана успешно');
        } catch (error) {
            console.error('Ошибка при создании врагов:', error);
        }
    }

    createBullets() {
        // Создаем группу пуль игрока
        this.playerBullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true
        });
        
        // Создаем группу пуль врагов
        this.enemyBullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        });
    }

    setupCollisions() {
        // Коллизии пуль игрока с врагами
        this.physics.add.overlap(
            this.playerBullets,
            this.enemyGroup.getGroup(),
            this.onBulletHitEnemy,
            null,
            this
        );
        
        // Коллизии пуль врагов с игроком
        this.physics.add.overlap(
            this.enemyBullets,
            this.player,
            this.onBulletHitPlayer,
            null,
            this
        );
        
        // Коллизии игрока с врагами
        this.physics.add.overlap(
            this.player,
            this.enemyGroup.getGroup(),
            this.onPlayerHitEnemy,
            null,
            this
        );
    }

    createUI() {
        const fontSize = this.scale.width < 600 ? '18px' : '24px';
        
        // Создаем текст для отображения счета
        this.scoreText = this.add.text(20, 20, 'Счет: 0', {
            fontFamily: 'Arial',
            fontSize: fontSize,
            color: '#ffffff'
        });
        
        // Создаем кнопку паузы - делаем больше для мобильных устройств
        const pauseSize = this.scale.width < 600 ? 60 : 40;
        const pauseX = this.cameras.main.width - pauseSize/2 - 10;
        const pauseY = pauseSize/2 + 10;
        
        this.pauseButton = this.add.circle(
            pauseX,
            pauseY,
            pauseSize/2, 
            0x3498db, 
            0.7
        ).setInteractive({ useHandCursor: true });
        
        this.pauseButton.on('pointerdown', () => {
            this.togglePause();
        });
        
        this.pauseIcon = this.add.grid(
            pauseX,
            pauseY,
            pauseSize/4, 
            pauseSize/2,
            pauseSize/8, 
            pauseSize/2,
            0xffffff
        ).setOrigin(0.5);
        
        // Создаем отображение жизней (после создания кнопки паузы)
        this.livesGroup = this.add.group();
        this.updateLivesDisplay();
    }

    setupInput() {
        try {
            console.log('Настройка управления клавиатурой...');
            // Создаем управление клавиатурой
            this.cursors = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            
            console.log('Настройка обработчиков клавиш...');
            // Обработчик клавиши ESC для паузы
            this.escKey.on('down', () => {
                this.togglePause();
            });
            
            // Обработчик нажатия пробела для стрельбы
            this.spaceKey.on('down', () => {
                if (!this.isPaused && !this.gameOver) {
                    this.shootBullet();
                }
            });
            
            console.log('Управление клавиатурой настроено');
        } catch (error) {
            console.error('Ошибка при настройке управления:', error);
            // Создаем пустой объект cursors, чтобы избежать ошибок в других методах
            this.cursors = {
                left: { isDown: false },
                right: { isDown: false },
                up: { isDown: false },
                down: { isDown: false }
            };
        }
    }

    startEnemyAttacks() {
        // Настраиваем атаки врагов
        this.enemyAttackTimer = this.time.addEvent({
            delay: 2000 / this.difficulty,
            callback: () => {
                if (!this.isPaused && !this.gameOver) {
                    this.enemyGroup.startAttack();
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // Настраиваем стрельбу врагов
        this.enemyShootTimer = this.time.addEvent({
            delay: 1500 / this.difficulty,
            callback: () => {
                if (!this.isPaused && !this.gameOver) {
                    this.enemyShoot();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta) {
        try {
            if (this.isPaused || this.gameOver) return;
            
            // Проверяем, что player существует, прежде чем обновлять его
            if (this.player) {
                // Обновляем игрока (передаем направление с мобильного управления)
                if (this.mobileControls && typeof this.mobileControls.isMobileDevice === 'function' && this.mobileControls.isMobileDevice()) {
                    this.player.update(this.cursors, this.mobileControls.getDirection());
                    
                    // Автоматическая стрельба на мобильных устройствах
                    // (управляется через MobileControls)
                } else {
                    this.player.update(this.cursors);
                }
            }
            
            // Проверяем, что enemyGroup существует, прежде чем обновлять его
            if (this.enemyGroup && typeof this.enemyGroup.update === 'function') {
                // Обновляем группу врагов
                this.enemyGroup.update(delta);
                
                // Проверяем условие победы
                if (typeof this.enemyGroup.isEmpty === 'function' && this.enemyGroup.isEmpty() && !this.gameOver) {
                    this.createNextWave();
                }
            }
            
            // Анимируем фон (звезды)
            this.updateBackground(delta);
        } catch (error) {
            console.error('Ошибка в методе update:', error);
        }
    }

    updateBackground(delta) {
        // Движение звезд с разной скоростью
        this.stars.forEach(({ star, speed }) => {
            star.y += speed * delta * 0.05 * this.gameSpeed;
            
            // Если звезда вышла за пределы экрана, возвращаем ее наверх
            if (star.y > this.cameras.main.height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, this.cameras.main.width);
            }
        });
    }

    shootBullet() {
        // Создаем новую пулю от игрока
        const bullet = this.playerBullets.get();
        if (bullet) {
            bullet.fire(this.player.x, this.player.y - 20, 'bullet-player', -600);
        }
    }

    enemyShoot() {
        // Выбираем случайного врага для стрельбы
        const activeEnemies = this.enemyGroup.getActiveEnemies();
        if (activeEnemies.length > 0) {
            // Выбираем случайных врагов для стрельбы (до 3)
            const shootCount = Phaser.Math.Between(1, Math.min(3, activeEnemies.length));
            for (let i = 0; i < shootCount; i++) {
                const randomIndex = Phaser.Math.Between(0, activeEnemies.length - 1);
                const enemy = activeEnemies[randomIndex];
                
                // Создаем пулю от врага
                const bullet = this.enemyBullets.get();
                if (bullet) {
                    bullet.fire(enemy.x, enemy.y + 20, 'bullet-enemy', 400);
                }
            }
        }
    }

    onBulletHitEnemy(bullet, enemy) {
        try {
            // Обрабатываем попадание пули игрока по врагу
            if (bullet && bullet.active) {
                bullet.destroy();
            }
            
            // Проверяем, что враг существует и активен
            if (enemy && enemy.active) {
                // Уменьшаем здоровье врага
                if (typeof enemy.damage === 'function') {
                    const destroyed = enemy.damage();
                    
                    if (destroyed) {
                        // Увеличиваем счет
                        if (typeof enemy.getScoreValue === 'function') {
                            this.increaseScore(enemy.getScoreValue());
                        } else {
                            this.increaseScore(100); // Значение по умолчанию
                        }
                        
                        // Создаем анимацию взрыва
                        this.createExplosion(enemy.x, enemy.y);
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка при обработке попадания пули по врагу:', error);
        }
    }

    onBulletHitPlayer(bullet, player) {
        try {
            // Обрабатываем попадание пули врага по игроку
            if (bullet && bullet.active) {
                bullet.destroy();
            }
            
            // Проверяем, что игрок существует и активен
            if (player && player.active) {
                // Уменьшаем жизни игрока, если он не неуязвим
                if (typeof player.isInvulnerable === 'function' && !player.isInvulnerable()) {
                    console.log('Игрок получил урон');
                    
                    // Делаем игрока временно неуязвимым ПЕРЕД уменьшением жизней
                    if (typeof player.setInvulnerable === 'function') {
                        player.setInvulnerable(true);
                    }
                    
                    // Создаем анимацию взрыва в позиции игрока
                    this.createSmallExplosion(player.x, player.y);
                    
                    // Затем уменьшаем жизни
                    this.decreaseLives();
                    
                    // НЕ уничтожаем игрока, только мигание
                    player.alpha = 0.5;
                    
                    // Добавим мерцающий эффект вместо исчезновения
                    this.tweens.add({
                        targets: player,
                        alpha: { from: 0.5, to: 1 },
                        duration: 100,
                        repeat: 5,
                        yoyo: true
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка при обработке попадания пули по игроку:', error);
        }
    }

    onPlayerHitEnemy(player, enemy) {
        try {
            // Обрабатываем столкновение игрока с врагом
            if (player && player.active && typeof player.isInvulnerable === 'function' && !player.isInvulnerable()) {
                // Уничтожаем врага если он существует
                if (enemy && enemy.active) {
                    enemy.destroy();
                    
                    // Создаем анимацию взрыва
                    this.createExplosion(enemy.x, enemy.y);
                }
                
                // Уменьшаем жизни игрока
                this.decreaseLives();
                
                // Делаем игрока временно неуязвимым
                if (typeof player.setInvulnerable === 'function') {
                    player.setInvulnerable(true);
                }
            }
        } catch (error) {
            console.error('Ошибка при обработке столкновения игрока с врагом:', error);
        }
    }

    // Обычный большой взрыв для уничтожения врагов
    createExplosion(x, y) {
        try {
            // Определяем, является ли устройство мобильным для адаптации эффектов
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            (window.innerWidth <= 800);
            
            // Увеличиваем размер взрыва для мобильных устройств
            const baseSize = isMobile ? 30 : 20;
            const particleCount = isMobile ? 15 : 10;
            
            // Яркие цвета для лучшей видимости
            const explosionColor = 0xff3300;
            
            // Создаем основной круг взрыва
            const explosion = this.add.circle(x, y, baseSize, explosionColor, 1);
            
            // Добавляем кольцо вокруг взрыва для усиления эффекта
            const explosionRing = this.add.circle(x, y, baseSize + 10, 0xffff00, 0.7)
                .setStrokeStyle(2, 0xffffff);
            
            // Анимация увеличения и исчезновения для основного круга
            this.tweens.add({
                targets: explosion,
                alpha: 0,
                scale: 3,
                duration: 400,
                onComplete: () => {
                    explosion.destroy();
                }
            });
            
            // Анимация для кольца
            this.tweens.add({
                targets: explosionRing,
                alpha: 0,
                scale: 4,
                duration: 500,
                onComplete: () => {
                    explosionRing.destroy();
                }
            });
            
            // Добавляем частицы разных цветов и размеров для эффекта
            const colors = [0xff9900, 0xffff00, 0xff3300, 0xff6600];
            
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 50 + Math.random() * 80;
                const distance = 30 + Math.random() * 50;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                const particle = this.add.circle(
                    x, 
                    y, 
                    3 + Math.random() * 5, 
                    color
                );
                
                // Добавляем свечение для частиц
                particle.setStrokeStyle(1, 0xffffff, 0.8);
                
                // Анимация разлета частиц
                this.tweens.add({
                    targets: particle,
                    x: x + Math.cos(angle) * distance,
                    y: y + Math.sin(angle) * distance,
                    alpha: 0,
                    scale: { from: 1, to: 0.5 },
                    duration: 400 + Math.random() * 400,
                    ease: 'Power2',
                    onComplete: () => {
                        particle.destroy();
                    }
                });
            }
            
            // Добавляем вспышку света
            const flash = this.add.circle(x, y, baseSize * 2, 0xffffff, 0.8);
            this.tweens.add({
                targets: flash,
                alpha: 0,
                scale: 2,
                duration: 200,
                onComplete: () => {
                    flash.destroy();
                }
            });
            
            // Добавляем тактильную обратную связь на мобильных устройствах
            if (isMobile && navigator.vibrate && typeof navigator.vibrate === 'function') {
                try {
                    navigator.vibrate(100); // Короткая вибрация для обратной связи
                } catch (e) {
                    console.log('Вибрация не поддерживается');
                }
            }
        } catch (error) {
            console.error('Ошибка при создании эффекта взрыва:', error);
        }
    }
    
    // Небольшой эффект щитка для попадания по игроку (без уничтожения игрока)
    createSmallExplosion(x, y) {
        try {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                           (window.innerWidth <= 800);
            
            // Создаем эффект щита
            const shield = this.add.circle(x, y, 25, 0x00aaff, 0.6)
                .setStrokeStyle(2, 0xffffff, 0.8);
            
            // Анимация щита
            this.tweens.add({
                targets: shield,
                alpha: 0,
                scale: 1.5,
                duration: 300,
                onComplete: () => {
                    shield.destroy();
                }
            });
            
            // Добавляем несколько искр
            const sparkCount = isMobile ? 8 : 5;
            const colors = [0x00aaff, 0x0088ff, 0x00ffff];
            
            for (let i = 0; i < sparkCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 15 + Math.random() * 20;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                const spark = this.add.circle(
                    x, 
                    y, 
                    2 + Math.random() * 3, 
                    color
                );
                
                // Анимация искр
                this.tweens.add({
                    targets: spark,
                    x: x + Math.cos(angle) * distance,
                    y: y + Math.sin(angle) * distance,
                    alpha: 0,
                    duration: 200 + Math.random() * 200,
                    onComplete: () => {
                        spark.destroy();
                    }
                });
            }
            
            // Короткая вибрация для мобильных
            if (isMobile && navigator.vibrate && typeof navigator.vibrate === 'function') {
                try {
                    navigator.vibrate(50);
                } catch (e) {
                    console.log('Вибрация не поддерживается');
                }
            }
        } catch (error) {
            console.error('Ошибка при создании эффекта попадания по игроку:', error);
        }
    }

    increaseScore(points) {
        // Увеличиваем счет
        this.score += points;
        this.scoreText.setText(`Счет: ${this.score}`);
        
        // Обновляем рекорд, если нужно
        if (this.score > window.gameSettings.highScore) {
            window.gameSettings.highScore = this.score;
            localStorage.setItem('highScore', this.score);
        }
    }

    decreaseLives() {
        // Уменьшаем количество жизней
        this.lives--;
        
        // Обновляем отображение жизней
        this.updateLivesDisplay();
        
        // Проверяем условие проигрыша
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    updateLivesDisplay() {
        try {
            // Очищаем предыдущее отображение жизней
            if (this.livesGroup) {
                this.livesGroup.clear(true, true);
                
                // Определяем размер иконок в зависимости от ширины экрана
                const iconSize = this.scale.width < 600 ? 20 : 30;
                const spacing = this.scale.width < 600 ? 30 : 40;
                
                // Безопасная проверка на существование pauseButton
                const yPos = this.pauseButton && this.pauseButton.y 
                    ? this.pauseButton.y + this.pauseButton.displayHeight/2 + iconSize 
                    : 100; // Запасная позиция, если pauseButton не определен
                
                // Создаем иконки жизней
                for (let i = 0; i < this.lives; i++) {
                    const lifeIcon = this.add.rectangle(
                        this.cameras.main.width - 30 - (i * spacing),
                        yPos,
                        iconSize,
                        iconSize,
                        0x3498db
                    );
                    
                    this.livesGroup.add(lifeIcon);
                }
            }
        } catch (error) {
            console.error('Ошибка при обновлении отображения жизней:', error);
        }
    }

    createNextWave() {
        // Увеличиваем сложность
        this.difficulty += 0.2;
        window.gameSettings.difficulty = this.difficulty;
        
        // Создаем новую волну врагов
        this.enemyGroup.createWave(this.difficulty);
        
        // Обновляем таймеры атак
        this.enemyAttackTimer.delay = 2000 / this.difficulty;
        this.enemyShootTimer.delay = 1500 / this.difficulty;
        
        // Отображаем сообщение о новой волне
        const waveText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'ВОЛНА ' + Math.floor(this.difficulty),
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);
        
        // Анимируем текст и удаляем его через секунду
        this.tweens.add({
            targets: waveText,
            alpha: { from: 1, to: 0 },
            scale: { from: 1, to: 2 },
            ease: 'Power2',
            duration: 1000,
            onComplete: () => {
                waveText.destroy();
            }
        });
    }

    togglePause() {
        // Переключаем состояние паузы
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Приостанавливаем физику
            this.physics.pause();
            
            // Изменяем иконку паузы на иконку воспроизведения
            this.pauseIcon.destroy();
            this.pauseIcon = this.add.triangle(
                this.cameras.main.width - 30,
                30,
                0, 0,
                15, 10,
                0, 20,
                0xffffff
            ).setOrigin(0.5);
            
            // Отображаем сообщение о паузе
            this.pauseText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                'ПАУЗА',
                {
                    fontFamily: 'Arial',
                    fontSize: '48px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 6
                }
            ).setOrigin(0.5);
        } else {
            // Возобновляем физику
            this.physics.resume();
            
            // Изменяем иконку воспроизведения на иконку паузы
            this.pauseIcon.destroy();
            this.pauseIcon = this.add.grid(
                this.cameras.main.width - 30,
                30,
                10, 
                20,
                5, 
                20,
                0xffffff
            ).setOrigin(0.5);
            
            // Удаляем сообщение о паузе
            if (this.pauseText) {
                this.pauseText.destroy();
                this.pauseText = null;
            }
        }
    }

    setupMobileControls() {
        // Создаем мобильное управление
        this.mobileControls = new MobileControls(this);
    }
    
    resize() {
        // Обновляем размеры UI элементов
        const pauseSize = this.scale.width < 600 ? 60 : 40;
        const pauseX = this.cameras.main.width - pauseSize/2 - 10;
        const pauseY = pauseSize/2 + 10;
        
        this.pauseButton.setPosition(pauseX, pauseY);
        this.pauseIcon.setPosition(pauseX, pauseY);
        
        // Обновляем размеры мобильного управления
        if (this.mobileControls) {
            this.mobileControls.resize();
        }
        
        // Обновляем отображение жизней
        this.updateLivesDisplay();
    }
    
    endGame() {
        // Устанавливаем флаг окончания игры
        this.gameOver = true;
        
        // Останавливаем таймеры
        if (this.enemyAttackTimer) {
            this.enemyAttackTimer.remove();
        }
        if (this.enemyShootTimer) {
            this.enemyShootTimer.remove();
        }
        
        // Уничтожаем мобильное управление
        if (this.mobileControls) {
            this.mobileControls.destroy();
        }
        
        // Сохраняем финальный счет
        window.gameSettings.score = this.score;
        
        // Переходим на сцену Game Over
        this.scene.start('GameOverScene');
    }
}
