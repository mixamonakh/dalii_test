// Импортируем компоненты

import { initComponents } from './components.js';
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

document.addEventListener("DOMContentLoaded", () => {
    const gameObjects = document.querySelectorAll('.game-object__item');
    const gameTrueBg = document.querySelector('.game__true-bg');
    const gameObjectsBox = document.querySelector('.game__objects');
    const gameTextStatus = document.querySelector('.game-text__status');
    const gameTextBox = document.querySelector('.game-text__text');

    // Начальные позиции объектов для возврата на место
    const initialPositions = {};

    gameObjects.forEach(item => {
        const parent = item.closest('.game-object');
        const rect = parent.getBoundingClientRect();
        initialPositions[item.dataset.object] = { x: rect.left, y: rect.top };

        Draggable.create(item, {
            type: "x,y",
            bounds: ".game__bg",
            edgeResistance: 1,
            onPress() {
                this.target.style.cursor = "grabbing";
            },
            onRelease() {
                this.target.style.cursor = "grab";
            },
            onDragEnd: function () {
                const itemRect = this.target.getBoundingClientRect();
                const parentRect = this.target.closest('.game-object').getBoundingClientRect();
                const bgRect = document.querySelector('.game__bg').getBoundingClientRect();

                // Если предмет не полностью вытянут из круга
                if (
                    itemRect.left > parentRect.left - (itemRect.width / 2) &&
                    itemRect.right < parentRect.right + (itemRect.width / 2) &&
                    itemRect.top > parentRect.top - (itemRect.height / 2) &&
                    itemRect.bottom < parentRect.bottom + (itemRect.height / 2)
                ) {
                    // Возвращаем предмет на исходную позицию
                    gsap.to(this.target, {
                        duration: 0.5,
                        x: 0,
                        y: 0,
                    });
                } else if (itemRect.left < bgRect.left || itemRect.right > bgRect.right || itemRect.top < bgRect.top || itemRect.bottom > bgRect.bottom) {
                    // Если предмет перемещается за границы интерактивной области
                    gsap.to(this.target, {
                        duration: 0.5,
                        x: 0,
                        y: 0,
                    });
                } else {
                    let statusText, boxText;
                    let statusColor = '#A00000';

                    if (this.target.dataset.object === 'key') {
                        statusText = 'Правильный ответ — металлический ключ.';
                        boxText = 'Дали, сидя в кресле, держал его в руке над тарелкой или подносом. Как только он начинал засыпать и пальцы разжимались, ключ падал с громким звуком и возвращал художника из полусна, позволяя запомнить образы, возникшие в этом состоянии, и использовать их для сюжетов его картин.';
                        statusColor = '#00700B';

                        // Создаем таймлайн для синхронной анимации
                        const timeline = gsap.timeline();

                        // Добавляем анимацию текста
                        timeline.to([gameTextStatus, gameTextBox], {
                            duration: 0.5,
                            opacity: 0,
                            y: -20,
                            onComplete: () => {
                                gameTextStatus.textContent = statusText;
                                gameTextBox.textContent = boxText;
                                gameTextStatus.style.color = statusColor;
                            }
                        });

                        timeline.to([gameTextStatus, gameTextBox], {
                            duration: 0.5,
                            opacity: 1,
                            y: 0,
                        });

                        // Анимация исчезновения предметов
                        timeline.to(gameObjects, {
                            duration: 1,
                            opacity: 0,
                            y: -50,
                            stagger: 0.2,
                        }, 0); // Начать одновременно с анимацией текста

                        // Плавное скрытие контейнера с объектами
                        timeline.to(gameObjectsBox, {
                            duration: 1,
                            opacity: 0,
                            y: -50,
                        }, 0); // Начать одновременно с анимацией текста

                        // Анимация смены фона
                        timeline.to('.game__bg', {
                            duration: 1,
                            opacity: 0,
                            onComplete: () => {
                                gameTrueBg.style.opacity = 1;
                                gsap.to('.game__bg', { duration: 1, opacity: 1 });
                            }
                        }, 0); // Начать одновременно с анимацией текста

                    } else {
                        if (this.target.dataset.object === 'bat') {
                            statusText = 'Правильный ответ — металлический ключ.';
                            boxText = 'С его помощью Дали просыпался, не успев погрузиться в сон полностью, и зарисовывал привидевшиеся ему в состоянии полусна образы. Живая летучая мышь жила у Дали, когда он был ребёнком, но во взрослом возрасте с летучими мышами в качестве помощников вдохновению он дела не имел.';
                        } else if (this.target.dataset.object === 'watch') {
                            statusText = 'Правильный ответ — металлический ключ.';
                            boxText = 'С его помощью Дали просыпался, не успев погрузиться в сон полностью, и зарисовывал привидевшиеся ему в состоянии полусна образы. А вот будильник завести с такой точностью просто невозможно.';
                        }

                        // Анимация смены текста
                        gsap.timeline()
                            .to([gameTextStatus, gameTextBox], {
                                duration: 0.5,
                                opacity: 0,
                                y: -20,
                                onComplete: () => {
                                    gameTextStatus.textContent = statusText;
                                    gameTextBox.textContent = boxText;
                                    gameTextStatus.style.color = statusColor;
                                }
                            })
                            .to([gameTextStatus, gameTextBox], {
                                duration: 0.5,
                                opacity: 1,
                                y: 0,
                            });

                        // Анимация возврата предмета на исходную позицию
                        gsap.to(this.target, {
                            duration: 0.5,
                            x: 0,
                            y: 0,
                        });
                    }
                }
            }
        });
    });
});


// Анимация подсказки для пользователя о перетаскивании предметов
gsap.to('.tip__icon-hand', {
    x: 8, 
    repeat: -1,
    yoyo: true,
    duration: 1.5,
    ease: "power1.inOut"
});

gsap.to('.tip__icon-arrow', {
    opacity: 0, 
    repeat: -1, 
    yoyo: true,
    duration: 0.75, 
    ease: "power1.inOut"
});


// Анимация иконки при просьбе повернуть экран

gsap.to('.rotate-screen__icon', {
    rotation: 360,
    repeat: -1,
    duration: 2,
    ease: "linear"
});

// Показ элемента только при портретной ориентации:




document.addEventListener('DOMContentLoaded', () => {
    initComponents();
});
