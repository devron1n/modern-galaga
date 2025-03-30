class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet-player');
        
        // Инициализация базовых свойств
        this.alive = false;
        this.speed = 0;
        this.lifespan = 2000; // время жизни пули в мс
        this.timer = 0;
    }
    
    fire(x, y, texture, speed) {
        // Устанавливаем текстуру (пуля игрока или врага)
        this.setTexture(texture);
        
        // Активируем пулю
        this.alive = true;
        this.setActive(true);
        this.setVisible(true);
        
        // Позиционируем пулю и включаем физику
        this.setPosition(x, y);
        this.body.reset(x, y);
        
        // Устанавливаем скорость
        this.speed = speed;
        this.body.setVelocityY(speed);
        
        // Сбрасываем время жизни
        this.timer = 0;
        
        // Добавляем эффект свечения
        this.addGlowEffect();
    }
    
    addGlowEffect() {
        // Создаем свечение для пули
        if (this.texture.key === 'bullet-player') {
            // Синее свечение для пуль игрока
            this.setTint(0x66ccff);
        } else {
            // Красное свечение для пуль врагов
            this.setTint(0xff6666);
        }
    }
    
    update(time, delta) {
        // Увеличиваем таймер
        this.timer += delta;
        
        // Проверяем, не истекло ли время жизни пули
        if (this.timer >= this.lifespan) {
            this.deactivate();
        }
        
        // Проверяем, не вышла ли пуля за пределы экрана
        if (this.y < -50 || this.y > this.scene.cameras.main.height + 50) {
            this.deactivate();
        }
    }
    
    deactivate() {
        // Деактивируем пулю
        this.alive = false;
        this.setActive(false);
        this.setVisible(false);
        
        // Останавливаем движение
        if (this.body) {
            this.body.setVelocity(0, 0);
        }
    }
}
