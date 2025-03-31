console.log('Загрузка main.js...');

try {
    console.log('Проверка наличия всех классов сцен...');
    if (typeof BootScene === 'undefined') console.error('BootScene не определен');
    if (typeof GameScene === 'undefined') console.error('GameScene не определен');
    if (typeof GameOverScene === 'undefined') console.error('GameOverScene не определен');
    
    // Конфигурация игры
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [
            BootScene,
            GameScene,
            GameOverScene
        ],
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '100%',
            height: '100%'
        },
        input: {
            activePointers: 3, // Поддержка мультитач
            touch: {
                capture: true
            }
        },
        pixelArt: false,
        backgroundColor: '#000033'
    };

    console.log('Создание экземпляра игры...');
    // Создаем экземпляр игры
    const game = new Phaser.Game(config);

    // Глобальные переменные игры
    window.gameSettings = {
        score: 0,
        highScore: localStorage.getItem('highScore') || 0,
        lives: 3,
        gameSpeed: 1,
        difficulty: 1
    };
    
    console.log('Игра инициализирована успешно');
} catch (error) {
    console.error('Ошибка при инициализации игры:', error);
}
