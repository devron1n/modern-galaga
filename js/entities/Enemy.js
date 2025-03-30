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
        // Логика атаки врага
        // По умолчанию просто двигаемся к игроку
        const player = this.scene.player;
        
        if (player && player.active) {
            // Вычисляем направление к игроку
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            
            // Устанавливаем скорость в направлении игрока
            this.body.setVelocity(
                Math.cos(angle) * this.speed,
                Math.sin(angle) * this.speed
            );
            
            // Поворачиваем спрайт в направлении движения
            this.rotation = angle + Math.PI/2;
        }
        
        // Возвращаем врага в формацию, если он вышел за пределы экрана
        if (this.y > this.scene.cameras.main.height + 50 ||
            this.y < -50 ||
            this.x > this.scene.cameras.main.width + 50 ||
            this.x < -50) {
            
            this.returnToFormation();
        }
    }
    
    startAttack() {
        // Начинаем атаку
        this.isAttacking = true;
        this.isInFormation = false;
        
        // Останавливаем эффект парения
        if (this.hoverTween) {
            this.hoverTween.stop();
        }
        
        // Включаем физику для движения
        this.body.setEnable(true);
        
        // Случайное направление атаки с уклоном вниз
        const randomAngle = Phaser.Math.FloatBetween(-0.5, 0.5) + Math.PI/2;
        
        // Устанавливаем начальную скорость
        this.body.setVelocity(
            Math.cos(randomAngle) * this.speed,
            Math.sin(randomAngle) * this.speed
        );
        
        // Поворачиваем спрайт в направлении движения
        this.rotation = randomAngle + Math.PI/2;
    }
    
    returnToFormation() {
        // Прекращаем атаку и возвращаемся в формацию
        this.isAttacking = false;
        this.isInFormation = true;
        
        // Останавливаем движение
        this.body.setEnable(false);
        this.body.setVelocity(0, 0);
        
        // Сбрасываем вращение
        this.rotation = 0;
        
        // Возобновляем эффект парения
        this.hoverTween = this.scene.tweens.add({
            targets: this,
            y: this.formationY + 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Плавно перемещаемся в позицию формации
        this.scene.tweens.add({
            targets: this,
            x: this.formationX,
            y: this.formationY,
            duration: 500,
            ease: 'Sine.easeOut'
        });
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
