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
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: false,
    backgroundColor: '#000033'
};

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
