class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // Добавляем спрайт на сцену и включаем физику
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Настраиваем физическое тело
        this.body.setCollideWorldBounds(true);
        this.setSize(40, 40);
        
        // Настраиваем свойства игрока
        this.speed = 300;
        this.invulnerable = false;
        this.invulnerabilityTimer = null;
        
        // Добавляем эффект двигателя
        this.createEngineEffect();
    }
    
    createEngineEffect() {
        // Создаем эффект двигателя
        this.engines = this.scene.add.rectangle(this.x, this.y + 20, 10, 20, 0x3498db, 0.8)
            .setDepth(-1);
    }
    
    update(cursors) {
        // Обновляем движение игрока
        this.handleMovement(cursors);
        
        // Обновляем позицию эффекта двигателя
        this.updateEnginePosition();
    }
    
    handleMovement(cursors) {
        // Сбрасываем скорость
        this.body.setVelocity(0);
        
        // Движение влево-вправо
        if (cursors.left.isDown) {
            this.body.setVelocityX(-this.speed);
        } else if (cursors.right.isDown) {
            this.body.setVelocityX(this.speed);
        }
        
        // Движение вверх-вниз
        if (cursors.up.isDown) {
            this.body.setVelocityY(-this.speed);
        } else if (cursors.down.isDown) {
            this.body.setVelocityY(this.speed);
        }
        
        // Наклон корабля при движении влево-вправо
        if (this.body.velocity.x < 0) {
            this.setRotation(-0.1);
        } else if (this.body.velocity.x > 0) {
            this.setRotation(0.1);
        } else {
            this.setRotation(0);
        }
    }
    
    updateEnginePosition() {
        // Обновляем позицию эффекта двигателя относительно игрока
        if (this.engines) {
            this.engines.x = this.x;
            this.engines.y = this.y + 20;
        }
    }
    
    setInvulnerable(value) {
        this.invulnerable = value;
        
        if (value) {
            // Визуальный эффект мигания
            this.scene.tweens.add({
                targets: this,
                alpha: { from: 0.2, to: 1 },
                duration: 100,
                repeat: 10
            });
            
            // Таймер неуязвимости (2 секунды)
            this.invulnerabilityTimer = this.scene.time.delayedCall(2000, () => {
                this.invulnerable = false;
                this.alpha = 1;
            });
        } else {
            // Если таймер активен, сбрасываем его
            if (this.invulnerabilityTimer) {
                this.invulnerabilityTimer.remove();
                this.invulnerabilityTimer = null;
            }
            this.alpha = 1;
        }
    }
    
    isInvulnerable() {
        return this.invulnerable;
    }
    
    destroy() {
        // Уничтожаем эффект двигателя
        if (this.engines) {
            this.engines.destroy();
        }
        
        // Вызываем родительский метод
        super.destroy();
    }
}
