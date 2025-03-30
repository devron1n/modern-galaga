class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Создаем временные изображения для прелоадера
        this.createLoadingAssets();
    }

    createLoadingAssets() {
        // Создаем временное изображение для фона загрузки
        const bgGraphics = this.make.graphics();
        bgGraphics.fillStyle(0x000033);
        bgGraphics.fillRect(0, 0, 400, 30);
        bgGraphics.generateTexture('loading-background', 400, 30);
        bgGraphics.destroy();

        // Создаем временное изображение для полосы загрузки
        const barGraphics = this.make.graphics();
        barGraphics.fillStyle(0x3498db);
        barGraphics.fillRect(0, 0, 400, 30);
        barGraphics.generateTexture('loading-bar', 400, 30);
        barGraphics.destroy();

        console.log('Временные ассеты для загрузки созданы');
    }

    create() {
        // Переходим к следующей сцене
        console.log('BootScene завершена, переход к GameScene');
        this.scene.start('GameScene');
    }
}
