

export function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function playTimeoutSound() {
    const audio = new Audio("/Audio/lichess-beep.mp3");
    audio.volume = 0.3;
    audio.play();
}

export function playDefeatSound() {
    const audio = new Audio("/Audio/Wrong.mp3");
    audio.volume = 0.3;
    audio.play();
}