class EnemyGroup {
    constructor(scene) {
        this.scene = scene;
        
        // Создаем группу для врагов
        this.enemies = scene.physics.add.group();
        
        // Настройки формации
        this.formationWidth = 10;
        this.formationHeight = 5;
        this.enemySpacingX = 50;
        this.enemySpacingY = 50;
        
        // Настройки движения формации
        this.formationDirection = 1; // 1 - вправо, -1 - влево
        this.formationSpeed = 30;
        this.formationX = scene.cameras.main.width / 2 - (this.formationWidth * this.enemySpacingX) / 2;
        this.formationY = 100;
        
        // Флаги состояния формации
        this.isMovingDown = false;
        this.waveCount = 1;
    }
    
    createWave(difficulty = 1) {
        // Очищаем предыдущую волну, если она существует
        this.enemies.clear(true, true);
        
        // Увеличиваем счетчик волн
        this.waveCount = Math.floor(difficulty);
        
        // Вычисляем начальные координаты формации
        this.formationX = this.scene.cameras.main.width / 2 - (this.formationWidth * this.enemySpacingX) / 2;
        this.formationY = 100;
        
        // Создаем новую формацию врагов
        for (let y = 0; y < this.formationHeight; y++) {
            for (let x = 0; x < this.formationWidth; x++) {
                // Определяем тип врага в зависимости от ряда
                let enemyType;
                if (y === 0) {
                    enemyType = 'enemy-3';
                } else if (y === 1 || y === 2) {
                    enemyType = 'enemy-2';
                } else {
                    enemyType = 'enemy-1';
                }
                
                // Вычисляем позицию врага в формации
                const posX = this.formationX + x * this.enemySpacingX;
                const posY = this.formationY + y * this.enemySpacingY;
                
                // Создаем врага
                const enemy = new Enemy(
                    this.scene,
                    posX,
                    posY,
                    enemyType
                );
                
                // Добавляем врага в группу
                this.enemies.add(enemy);
            }
        }
        
        // Настраиваем скорость движения формации в зависимости от сложности
        this.formationSpeed = 30 + (difficulty - 1) * 5;
    }
    
    update(delta) {
        // Если нет врагов, ничего не делаем
        if (this.enemies.getLength() === 0) {
            return;
        }
        
        // Обновляем положение формации
        this.updateFormationPosition(delta);
        
        // Обновляем каждого врага
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.update) {
                enemy.update();
            }
        });
    }
    
    updateFormationPosition(delta) {
        // Находим крайние позиции врагов
        let minX = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isInFormation) {
                minX = Math.min(minX, enemy.formationX);
                maxX = Math.max(maxX, enemy.formationX);
            }
        });
        
        // Если нет врагов в формации, ничего не делаем
        if (minX === Number.MAX_SAFE_INTEGER || maxX === Number.MIN_SAFE_INTEGER) {
            return;
        }
        
        // Проверяем, нужно ли изменить направление
        const margin = 50;
        if (maxX + margin > this.scene.cameras.main.width && this.formationDirection > 0) {
            this.formationDirection = -1;
            this.moveFormationDown();
        } else if (minX - margin < 0 && this.formationDirection < 0) {
            this.formationDirection = 1;
            this.moveFormationDown();
        }
        
        // Если формация двигается вниз, пропускаем обновление позиции
        if (this.isMovingDown) {
            return;
        }
        
        // Обновляем позицию формации
        const moveX = this.formationDirection * this.formationSpeed * delta * 0.01;
        
        // Обновляем позиции врагов в формации
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isInFormation) {
                enemy.formationX += moveX;
            }
        });
    }
    
    moveFormationDown() {
        // Устанавливаем флаг движения вниз
        this.isMovingDown = true;
        
        // Смещаем всю формацию вниз
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.isInFormation) {
                enemy.formationY += 20;
                
                // Создаем анимацию перемещения
                this.scene.tweens.add({
                    targets: enemy,
                    y: enemy.formationY,
                    duration: 500,
                    ease: 'Sine.easeInOut'
                });
            }
        });
        
        // Снимаем флаг через полсекунды
        this.scene.time.delayedCall(500, () => {
            this.isMovingDown = false;
        });
    }
    
    startAttack() {
        // Выбираем случайных врагов для атаки
        const formationEnemies = this.enemies.getChildren().filter(enemy => enemy.isInFormation);
        
        if (formationEnemies.length === 0) {
            return;
        }
        
        // Вычисляем количество атакующих врагов в зависимости от сложности
        const attackCount = Math.min(
            Math.floor(1 + this.waveCount / 2),
            formationEnemies.length,
            3
        );
        
        // Выбираем случайных врагов
        for (let i = 0; i < attackCount; i++) {
            if (formationEnemies.length === 0) break;
            
            const randomIndex = Phaser.Math.Between(0, formationEnemies.length - 1);
            const enemy = formationEnemies[randomIndex];
            
            // Исключаем выбранного врага из списка
            formationEnemies.splice(randomIndex, 1);
            
            // Запускаем атаку
            enemy.startAttack();
        }
    }
    
    getGroup() {
        return this.enemies;
    }
    
    getActiveEnemies() {
        return this.enemies.getChildren();
    }
    
    isEmpty() {
        return this.enemies.getLength() === 0;
    }
}