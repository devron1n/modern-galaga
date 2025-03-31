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
    
    update(cursors, mobileDirection = null) {
        try {
            // Проверяем, активен ли объект игрока
            if (!this.active) {
                return;
            }
            
            // Обновляем движение игрока
            this.handleMovement(cursors, mobileDirection);
            
            // Обновляем позицию эффекта двигателя
            this.updateEnginePosition();
        } catch (error) {
            console.error('Ошибка в методе update игрока:', error);
        }
    }
    
    handleMovement(cursors, mobileDirection) {
        try {
            // Проверяем, существует ли body
            if (!this.body) {
                console.error('Player.body отсутствует при вызове handleMovement');
                return;
            }
            
            // Сбрасываем скорость
            this.body.setVelocity(0);
            
            // Проверяем, есть ли мобильное управление
            if (mobileDirection && (mobileDirection.x !== 0 || mobileDirection.y !== 0)) {
                // Движение на основе направления виртуального джойстика
                this.body.setVelocityX(mobileDirection.x * this.speed);
                this.body.setVelocityY(mobileDirection.y * this.speed);
            } else if (cursors && typeof cursors === 'object') {
                // Проверяем, что cursors определен и является объектом
                // Стандартное управление с клавиатуры
                // Движение влево-вправо
                if (cursors.left && cursors.left.isDown) {
                    this.body.setVelocityX(-this.speed);
                } else if (cursors.right && cursors.right.isDown) {
                    this.body.setVelocityX(this.speed);
                }
                
                // Движение вверх-вниз
                if (cursors.up && cursors.up.isDown) {
                    this.body.setVelocityY(-this.speed);
                } else if (cursors.down && cursors.down.isDown) {
                    this.body.setVelocityY(this.speed);
                }
            }
            
            // Наклон корабля при движении влево-вправо - проверяем наличие velocity
            if (this.body.velocity && this.body.velocity.x < 0) {
                this.setRotation(-0.1);
            } else if (this.body.velocity && this.body.velocity.x > 0) {
                this.setRotation(0.1);
            } else {
                this.setRotation(0);
            }
        } catch (error) {
            console.error('Ошибка в методе handleMovement игрока:', error);
            // Сбрасываем поворот при ошибке для безопасности
            this.setRotation(0);
        }
    }
    
    updateEnginePosition() {
        try {
            // Обновляем позицию эффекта двигателя относительно игрока
            if (this.engines && this.engines.active) {
                this.engines.x = this.x;
                this.engines.y = this.y + 20;
            }
        } catch (error) {
            console.error('Ошибка в методе updateEnginePosition игрока:', error);
        }
    }
    
    setInvulnerable(value) {
        try {
            this.invulnerable = value;
            
            if (value) {
                // Визуальный эффект мигания
                if (this.scene && this.scene.tweens) {
                    this.scene.tweens.add({
                        targets: this,
                        alpha: { from: 0.2, to: 1 },
                        duration: 100,
                        repeat: 10
                    });
                }
                
                // Таймер неуязвимости (2 секунды)
                if (this.scene && this.scene.time) {
                    this.invulnerabilityTimer = this.scene.time.delayedCall(2000, () => {
                        if (this.active) {  // Проверяем, активен ли игрок
                            this.invulnerable = false;
                            this.alpha = 1;
                        }
                    });
                }
            } else {
                // Если таймер активен, сбрасываем его
                if (this.invulnerabilityTimer) {
                    this.invulnerabilityTimer.remove();
                    this.invulnerabilityTimer = null;
                }
                this.alpha = 1;
            }
        } catch (error) {
            console.error('Ошибка в методе setInvulnerable игрока:', error);
            // Устанавливаем видимость в любом случае
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
