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
        
        // Создаем текстуры, если их нет
        this.createTextures();
        
        // Создаем фон
        this.createBackground();
        
        // Создаем игрока
        this.createPlayer();
        
        // Создаем группы врагов
        this.createEnemies();
        
        // Создаем группы пуль
        this.createBullets();
        
        // Настройка коллизий
        this.setupCollisions();
        
        // Создаем UI
        this.createUI();
        
        // Включаем управление
        this.setupInput();
        
        // Запускаем таймеры атак врагов
        this.startEnemyAttacks();
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
        // Создаем игрока (используем класс Player)
        this.player = new Player(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height - 100
        );
    }

    createEnemies() {
        // Создаем группу врагов (используем класс EnemyGroup)
        this.enemyGroup = new EnemyGroup(this);
        
        // Инициализируем первую волну врагов
        this.enemyGroup.createWave();
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
        // Создаем текст для отображения счета
        this.scoreText = this.add.text(20, 20, 'Счет: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        });
        
        // Создаем отображение жизней
        this.livesGroup = this.add.group();
        this.updateLivesDisplay();
        
        // Создаем кнопку паузы
        this.pauseButton = this.add.rectangle(
            this.cameras.main.width - 30,
            30,
            40, 
            40,
            0x3498db, 
            0.7
        ).setInteractive({ useHandCursor: true });
        
        this.pauseButton.on('pointerdown', () => {
            this.togglePause();
        });
        
        this.pauseIcon = this.add.grid(
            this.cameras.main.width - 30,
            30,
            10, 
            20,
            5, 
            20,
            0xffffff
        ).setOrigin(0.5);
    }

    setupInput() {
        // Создаем управление клавиатурой
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
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
        if (this.isPaused || this.gameOver) return;
        
        // Обновляем игрока
        this.player.update(this.cursors);
        
        // Обновляем группу врагов
        this.enemyGroup.update(delta);
        
        // Анимируем фон (звезды)
        this.updateBackground(delta);
        
        // Проверяем условие победы
        if (this.enemyGroup.isEmpty() && !this.gameOver) {
            this.createNextWave();
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
        // Обрабатываем попадание пули игрока по врагу
        bullet.destroy();
        
        // Уменьшаем здоровье врага
        const destroyed = enemy.damage();
        
        if (destroyed) {
            // Увеличиваем счет
            this.increaseScore(enemy.getScoreValue());
            
            // Создаем анимацию взрыва
            this.createExplosion(enemy.x, enemy.y);
        }
    }

    onBulletHitPlayer(bullet, player) {
        // Обрабатываем попадание пули врага по игроку
        bullet.destroy();
        
        // Уменьшаем жизни игрока, если он не неуязвим
        if (!player.isInvulnerable()) {
            this.decreaseLives();
            
            // Делаем игрока временно неуязвимым
            player.setInvulnerable(true);
            
            // Создаем анимацию взрыва
            this.createExplosion(player.x, player.y);
        }
    }

    onPlayerHitEnemy(player, enemy) {
        // Обрабатываем столкновение игрока с врагом
        if (!player.isInvulnerable()) {
            // Уничтожаем врага
            enemy.destroy();
            
            // Уменьшаем жизни игрока
            this.decreaseLives();
            
            // Делаем игрока временно неуязвимым
            player.setInvulnerable(true);
            
            // Создаем анимацию взрыва
            this.createExplosion(enemy.x, enemy.y);
        }
    }

    createExplosion(x, y) {
        // Создаем простую анимацию взрыва с использованием частиц и формы
        const explosion = this.add.circle(x, y, 20, 0xff6600, 1);
        
        // Анимация увеличения и исчезновения
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 3,
            duration: 300,
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // Добавляем частицы для эффекта
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 50;
            const distance = 20 + Math.random() * 30;
            
            const particle = this.add.circle(
                x, 
                y, 
                2 + Math.random() * 3, 
                0xff9900
            );
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.5,
                duration: 300 + Math.random() * 300,
                onComplete: () => {
                    particle.destroy();
                }
            });
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
        // Очищаем предыдущее отображение жизней
        this.livesGroup.clear(true, true);
        
        // Создаем иконки жизней
        for (let i = 0; i < this.lives; i++) {
            const lifeIcon = this.add.rectangle(
                this.cameras.main.width - 30 - (i * 40),
                80,
                30,
                30,
                0x3498db
            );
            
            this.livesGroup.add(lifeIcon);
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
        
        // Сохраняем финальный счет
        window.gameSettings.score = this.score;
        
        // Переходим на сцену Game Over
        this.scene.start('GameOverScene');
    }
}
