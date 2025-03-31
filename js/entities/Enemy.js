class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'enemy-1') {
        super(scene, x, y, type);
        
        // Добавляем спрайт на сцену и включаем физику
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Настраиваем тип врага
        this.enemyType = type;
        
        // Настраиваем свойства в зависимости от типа
        switch (type) {
            case 'enemy-1':
                this.health = 1;
                this.scoreValue = 100;
                this.speed = 100;
                break;
            case 'enemy-2':
                this.health = 2;
                this.scoreValue = 200;
                this.speed = 120;
                break;
            case 'enemy-3':
                this.health = 3;
                this.scoreValue = 300;
                this.speed = 150;
                break;
            default:
                this.health = 1;
                this.scoreValue = 100;
                this.speed = 100;
        }
        
        // Флаги состояния
        this.isAttacking = false;
        this.isInFormation = true;
        this.formationX = x;
        this.formationY = y;
        
        // Настраиваем размер коллизии
        this.setSize(30, 30);
        
        // Настраиваем эффекты
        this.setupEffects();
    }
    
    setupEffects() {
        // Добавляем эффект парения в строю
        this.hoverTween = this.scene.tweens.add({
            targets: this,
            y: this.y + 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    update() {
        // Если враг в атаке, обрабатываем логику атаки
        if (this.isAttacking) {
            this.updateAttack();
        }
        // Если враг в формации, поддерживаем его позицию
        else if (this.isInFormation) {
            this.updateFormation();
        }
    }
    
    updateFormation() {
        // Плавно возвращаемся в позицию формации, если враг отклонился
        const dx = this.formationX - this.x;
        const dy = this.formationY - this.y;
        
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            this.x += dx * 0.1;
            this.y += dy * 0.1;
        }
    }
    
    updateAttack() {
        try {
            // Логика атаки врага
            // По умолчанию просто двигаемся к игроку
            const player = this.scene.player;
            
            if (player && player.active) {
                // Вычисляем направление к игроку
                const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                
                // Устанавливаем скорость в направлении игрока
                if (this.body) {
                    this.body.setVelocity(
                        Math.cos(angle) * this.speed,
                        Math.sin(angle) * this.speed
                    );
                }
                
                // Поворачиваем спрайт в направлении движения
                this.rotation = angle + Math.PI/2;
            }
            
            // Проверяем границы экрана для атакующих врагов
            const screenHeight = this.scene.cameras.main.height;
            const screenWidth = this.scene.cameras.main.width;
            
            // Заменяем отражение на более правильное поведение - возврат в формацию
            const bottomMargin = 80; // Увеличиваем отступ от нижнего края
            
            // Если враг находится слишком близко к нижней границе, возвращаем его в формацию
            if (this.y > screenHeight - bottomMargin) {
                // Вместо отражения просто возвращаем в формацию
                this.returnToFormation();
                return; // Выходим из метода
            }
            
            // Возвращаем врага в формацию, если он вышел за боковые или верхнюю границы экрана
            if (this.y < -50 || this.x > screenWidth + 50 || this.x < -50) {
                this.returnToFormation();
            }
        } catch (error) {
            console.error('Ошибка в методе updateAttack врага:', error);
            
            // При ошибке лучше вернуть врага в формацию
            try {
                this.returnToFormation();
            } catch (e) {
                // Если даже это не работает, хотя бы пытаемся остановить движение
                if (this.body) {
                    this.body.setVelocity(0, 0);
                }
            }
        }
    }
    
    startAttack() {
        try {
            // Проверка активности врага
            if (!this.active) {
                console.log('Попытка запустить атаку неактивного врага');
                return;
            }
            
            // Начинаем атаку
            this.isAttacking = true;
            this.isInFormation = false;
            
            // Останавливаем эффект парения
            if (this.hoverTween && typeof this.hoverTween.stop === 'function') {
                this.hoverTween.stop();
            }
            
            // Проверка существования тела физики
            if (!this.body) {
                console.error('Физическое тело врага не существует');
                return;
            }
            
            // Включаем физику для движения
            this.body.setEnable(true);
            
            // Модифицируем углы атаки, чтобы враги меньше стремились вниз экрана
            // и больше атаковали в сторону игрока
            let randomAngle;
            
            // Если игрок существует, с большей вероятностью атакуем в его сторону
            if (this.scene.player && this.scene.player.active) {
                const playerAngle = Phaser.Math.Angle.Between(
                    this.x, this.y, 
                    this.scene.player.x, this.scene.player.y
                );
                
                // Слегка варьируем угол вокруг направления к игроку
                randomAngle = playerAngle + Phaser.Math.FloatBetween(-0.3, 0.3);
                
                // Ограничиваем максимальное отклонение вниз
                if (randomAngle > Math.PI/2 + 0.3) randomAngle = Math.PI/2 + 0.3;
                if (randomAngle < Math.PI/2 - 0.3) randomAngle = Math.PI/2 - 0.3;
            } else {
                // Если игрок не доступен, используем более горизонтальное движение
                randomAngle = Phaser.Math.FloatBetween(-0.6, 0.6) + Math.PI/2;
            }
            
            // Устанавливаем начальную скорость с вариацией
            const attackSpeed = this.speed * Phaser.Math.FloatBetween(0.9, 1.1);
            
            this.body.setVelocity(
                Math.cos(randomAngle) * attackSpeed,
                Math.sin(randomAngle) * attackSpeed
            );
            
            // Поворачиваем спрайт в направлении движения
            this.rotation = randomAngle + Math.PI/2;
            
            // Добавляем небольшое увеличение размера при атаке для визуального эффекта
            this.setScale(1.1);
        } catch (error) {
            console.error('Ошибка при начале атаки врага:', error);
            
            // Если произошла ошибка, возвращаем врага в формацию
            try {
                this.returnToFormation();
            } catch (e) {
                console.error('Не удалось вернуть врага в формацию после ошибки:', e);
            }
        }
    }
    
    returnToFormation() {
        try {
            // Прекращаем атаку и возвращаемся в формацию
            this.isAttacking = false;
            this.isInFormation = true;
            
            // Останавливаем движение
            if (this.body) {
                this.body.setEnable(false);
                this.body.setVelocity(0, 0);
            }
            
            // Сбрасываем вращение и другие свойства
            this.rotation = 0;
            this.setScale(1); // Сбрасываем масштаб, если он был изменен
            
            // Останавливаем предыдущий твин парения, если он существует
            if (this.hoverTween && this.hoverTween.stop) {
                this.hoverTween.stop();
            }
            
            // Убедимся, что формация существует
            if (typeof this.formationX === 'undefined' || typeof this.formationY === 'undefined') {
                // Если позиция формации не определена, задаем ее в центре экрана
                this.formationX = this.scene.cameras.main.width / 2;
                this.formationY = 150;
            }
            
            // Проверяем, что сцена существует перед созданием tweens
            if (this.scene && this.scene.tweens) {
                // Возобновляем эффект парения
                this.hoverTween = this.scene.tweens.add({
                    targets: this,
                    y: this.formationY + 5,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                // Плавно перемещаемся в позицию формации с более длительной анимацией
                this.scene.tweens.add({
                    targets: this,
                    x: this.formationX,
                    y: this.formationY,
                    duration: 800,
                    ease: 'Power2.easeOut'
                });
            } else {
                // Если tweens недоступны, просто телепортируем в позицию формации
                this.x = this.formationX;
                this.y = this.formationY;
            }
        } catch (error) {
            console.error('Ошибка в методе returnToFormation врага:', error);
            
            // При ошибке хотя бы пытаемся переместить врага в безопасную позицию
            try {
                this.x = this.scene.cameras.main.width / 2;
                this.y = 150;
                this.rotation = 0;
                
                if (this.body) {
                    this.body.setVelocity(0, 0);
                }
            } catch (e) {
                // Последняя попытка стабилизировать игру
                console.error('Критическая ошибка при восстановлении врага:', e);
            }
        }
    }
    
    damage() {
        // Уменьшаем здоровье
        this.health--;
        
        // Эффект получения урона
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 50,
            yoyo: true
        });
        
        // Если здоровье закончилось, уничтожаем врага
        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        
        return false;
    }
    
    getScoreValue() {
        return this.scoreValue;
    }
    
    destroy() {
        // Останавливаем твины перед уничтожением
        if (this.hoverTween) {
            this.hoverTween.stop();
        }
        
        // Вызываем родительский метод
        super.destroy();
    }
}
