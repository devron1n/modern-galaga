class MobileControls {
    constructor(scene) {
        this.scene = scene;
        this.isMobile = this.detectMobile();
        
        // Направление движения (для виртуального джойстика)
        this.direction = {
            x: 0,
            y: 0
        };
        
        // Флаг стрельбы
        this.isShooting = false;
        
        // Создаем элементы управления, если это мобильное устройство
        if (this.isMobile) {
            this.createJoystick();
            this.createShootButton();
        }
    }
    
    detectMobile() {
        // Определяем, является ли устройство мобильным
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
            (window.innerWidth <= 800)
        );
    }
    
    createJoystick() {
        const halfWidth = this.scene.cameras.main.width / 2;
        const height = this.scene.cameras.main.height;
        
        // Область для джойстика (левая половина экрана)
        this.joyStickZone = this.scene.add.zone(0, 0, halfWidth, height)
            .setOrigin(0)
            .setInteractive()
            .setDepth(10);
        
        // Создаем базовый полупрозрачный джойстик на экране для лучшей видимости
        const centerX = halfWidth / 2;
        const centerY = height - 100;
        const joystickRadius = 70; // Увеличенный радиус для удобства на мобильных устройствах
        
        // Базовый круг джойстика
        this.joyStickBase = this.scene.add.circle(centerX, centerY, joystickRadius, 0x000000, 0.3)
            .setStrokeStyle(3, 0xffffff, 0.5)
            .setDepth(10)
            .setAlpha(0.7);
        
        // Указатель джойстика
        this.joyStickThumb = this.scene.add.circle(centerX, centerY, joystickRadius/3, 0x3498db, 1)
            .setDepth(10);
            
        // Добавляем подсказку для перемещения
        this.joystickHint = this.scene.add.text(
            centerX, 
            centerY - joystickRadius - 20, 
            "Управление", 
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0.7).setDepth(10);
        
        // Делаем джойстик постоянно видимым для лучшего удобства на мобильных устройствах
        // Настраиваем события касания для джойстика
        this.joyStickZone.on('pointerdown', (pointer) => {
            // Используем прямое управление в точке касания
            const centerX = this.joyStickBase.x;
            const centerY = this.joyStickBase.y;
            const dx = pointer.x - centerX;
            const dy = pointer.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 60; // Увеличенная дистанция для лучшего контроля
            
            if (distance <= maxDistance) {
                this.joyStickThumb.setPosition(pointer.x, pointer.y);
            } else {
                // Нормализуем направление
                const angle = Math.atan2(dy, dx);
                this.joyStickThumb.setPosition(
                    centerX + Math.cos(angle) * maxDistance,
                    centerY + Math.sin(angle) * maxDistance
                );
            }
            
            // Устанавливаем направление для движения
            this.direction.x = (this.joyStickThumb.x - centerX) / maxDistance;
            this.direction.y = (this.joyStickThumb.y - centerY) / maxDistance;
            
            // Увеличиваем яркость джойстика при активации
            this.joyStickBase.setAlpha(0.9);
            this.joyStickThumb.setFillStyle(0x00BFFF);
        });
        
        this.joyStickZone.on('pointermove', (pointer) => {
            if (pointer.isDown) {
                const centerX = this.joyStickBase.x;
                const centerY = this.joyStickBase.y;
                const dx = pointer.x - centerX;
                const dy = pointer.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 60;
                
                if (distance <= maxDistance) {
                    this.joyStickThumb.setPosition(pointer.x, pointer.y);
                } else {
                    // Нормализуем направление
                    const angle = Math.atan2(dy, dx);
                    this.joyStickThumb.setPosition(
                        centerX + Math.cos(angle) * maxDistance,
                        centerY + Math.sin(angle) * maxDistance
                    );
                }
                
                // Устанавливаем направление для движения
                this.direction.x = (this.joyStickThumb.x - centerX) / maxDistance;
                this.direction.y = (this.joyStickThumb.y - centerY) / maxDistance;
            }
        });
        
        this.joyStickZone.on('pointerup', () => {
            // Возвращаем джойстик в центральное положение
            const centerX = this.joyStickBase.x;
            const centerY = this.joyStickBase.y;
            this.joyStickThumb.setPosition(centerX, centerY);
            
            // Сбрасываем направление
            this.direction.x = 0;
            this.direction.y = 0;
            
            // Возвращаем стандартный цвет и прозрачность
            this.joyStickBase.setAlpha(0.7);
            this.joyStickThumb.setFillStyle(0x3498db);
        });
        
        this.joyStickZone.on('pointerout', () => {
            // Возвращаем джойстик в центральное положение
            const centerX = this.joyStickBase.x;
            const centerY = this.joyStickBase.y;
            this.joyStickThumb.setPosition(centerX, centerY);
            
            // Сбрасываем направление
            this.direction.x = 0;
            this.direction.y = 0;
            
            // Возвращаем стандартный цвет и прозрачность
            this.joyStickBase.setAlpha(0.7);
            this.joyStickThumb.setFillStyle(0x3498db);
        });
    }
    
    createShootButton() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Увеличенный размер кнопки стрельбы для лучшего восприятия на мобильных устройствах
        const buttonX = width - 100;
        const buttonY = height - 100;
        const buttonSize = 60;
        
        // Создаем кнопку стрельбы (правая часть экрана)
        this.shootButton = this.scene.add.circle(buttonX, buttonY, buttonSize, 0x3498db, 0.8)
            .setStrokeStyle(3, 0xffffff, 1)
            .setDepth(10)
            .setAlpha(0.7);
        
        // Добавляем иконку выстрела (более заметную)
        this.shootIcon = this.scene.add.triangle(
            buttonX, 
            buttonY,
            0, 25,
            -25, -20,
            25, -20,
            0xffffff
        ).setDepth(10);
        
        // Добавляем текст подсказки
        this.fireHint = this.scene.add.text(
            buttonX, 
            buttonY - buttonSize - 20, 
            "Огонь", 
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0.7).setDepth(10);
        
        // Добавим пульсацию для привлечения внимания
        this.scene.tweens.add({
            targets: this.shootButton,
            scale: { from: 1, to: 1.1 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // Создаем интерактивную зону для кнопки (вся правая часть экрана)
        this.shootZone = this.scene.add.zone(width / 2, 0, width / 2, height)
            .setOrigin(0, 0)
            .setInteractive()
            .setDepth(10);
        
        // Настраиваем события для стрельбы
        this.shootZone.on('pointerdown', () => {
            // Визуальный эффект при нажатии
            this.shootButton.setFillStyle(0xff0000, 0.8);
            this.shootIcon.setFillStyle(0xffff00);
            this.shootButton.setScale(1.2);
            
            this.isShooting = true;
            
            // Эффект вибрации для тактильной обратной связи
            if (navigator.vibrate && typeof navigator.vibrate === 'function') {
                try {
                    navigator.vibrate(50); // Короткая вибрация для обратной связи
                } catch (e) {
                    console.log('Вибрация не поддерживается');
                }
            }
            
            // Делаем один выстрел сразу при нажатии
            if (this.scene.shootBullet) {
                try {
                    this.scene.shootBullet();
                } catch (error) {
                    console.error('Ошибка при стрельбе:', error);
                }
            }
            
            // Запускаем интервал стрельбы с улучшенной скоростью для мобильных устройств
            if (this.shootInterval) {
                clearInterval(this.shootInterval);
            }
            
            this.shootInterval = setInterval(() => {
                if (this.isShooting && this.scene.shootBullet) {
                    try {
                        this.scene.shootBullet();
                    } catch (error) {
                        console.error('Ошибка при стрельбе:', error);
                    }
                }
            }, 250); // Уменьшенный интервал стрельбы (250 мс) для лучшей отзывчивости
        });
        
        this.shootZone.on('pointerup', () => {
            // Визуальный эффект при отпускании
            this.shootButton.setFillStyle(0x3498db, 0.8);
            this.shootIcon.setFillStyle(0xffffff);
            this.shootButton.setScale(1.0);
            
            this.isShooting = false;
            
            // Очищаем интервал стрельбы
            if (this.shootInterval) {
                clearInterval(this.shootInterval);
                this.shootInterval = null;
            }
        });
        
        this.shootZone.on('pointerout', () => {
            // Визуальный эффект при выходе указателя
            this.shootButton.setFillStyle(0x3498db, 0.8);
            this.shootIcon.setFillStyle(0xffffff);
            this.shootButton.setScale(1.0);
            
            this.isShooting = false;
            
            // Очищаем интервал стрельбы
            if (this.shootInterval) {
                clearInterval(this.shootInterval);
                this.shootInterval = null;
            }
        });
    }
    
    getDirection() {
        return this.direction;
    }
    
    isMobileDevice() {
        return this.isMobile;
    }
    
    resize() {
        if (!this.isMobile) return;
        
        try {
            const width = this.scene.cameras.main.width;
            const height = this.scene.cameras.main.height;
            
            // Обновляем размеры зон
            if (this.joyStickZone) {
                this.joyStickZone.setSize(width / 2, height);
            }
            
            if (this.shootZone) {
                this.shootZone.setSize(width / 2, height);
                this.shootZone.setPosition(width / 2, 0);
            }
            
            // Обновляем положение джойстика
            const centerX = width / 4; // Центр левой половины экрана
            const centerY = height - 100;
            
            if (this.joyStickBase) {
                this.joyStickBase.setPosition(centerX, centerY);
            }
            
            if (this.joyStickThumb) {
                this.joyStickThumb.setPosition(centerX, centerY);
            }
            
            if (this.joystickHint) {
                this.joystickHint.setPosition(centerX, centerY - 90);
            }
            
            // Обновляем положение кнопки стрельбы
            const buttonX = width - 100;
            const buttonY = height - 100;
            
            if (this.shootButton) {
                this.shootButton.setPosition(buttonX, buttonY);
            }
            
            if (this.shootIcon) {
                this.shootIcon.setPosition(buttonX, buttonY);
            }
            
            if (this.fireHint) {
                this.fireHint.setPosition(buttonX, buttonY - 80);
            }
            
            // Сбрасываем направление при изменении размера
            this.direction = { x: 0, y: 0 };
            
            console.log('Мобильное управление обновлено при изменении размера экрана');
        } catch (error) {
            console.error('Ошибка при обновлении мобильного управления:', error);
        }
    }
    
    destroy() {
        try {
            // Очищаем интервал стрельбы
            if (this.shootInterval) {
                clearInterval(this.shootInterval);
                this.shootInterval = null;
            }
            
            // Останавливаем все твины
            if (this.scene && this.scene.tweens) {
                this.scene.tweens.killTweensOf(this.shootButton);
                this.scene.tweens.killTweensOf(this.joyStickBase);
                this.scene.tweens.killTweensOf(this.joyStickThumb);
            }
            
            // Удаляем элементы управления
            if (this.joyStickBase) this.joyStickBase.destroy();
            if (this.joyStickThumb) this.joyStickThumb.destroy();
            if (this.joyStickZone) this.joyStickZone.destroy();
            if (this.joystickHint) this.joystickHint.destroy();
            
            if (this.shootButton) this.shootButton.destroy();
            if (this.shootIcon) this.shootIcon.destroy();
            if (this.shootZone) this.shootZone.destroy();
            if (this.fireHint) this.fireHint.destroy();
            
            console.log('Мобильное управление успешно уничтожено');
        } catch (error) {
            console.error('Ошибка при уничтожении мобильного управления:', error);
        }
    }
}