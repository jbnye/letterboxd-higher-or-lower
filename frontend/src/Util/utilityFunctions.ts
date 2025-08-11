const timeoutAudio = new Audio("/Audio/lichess-beep.mp3");
timeoutAudio.volume = 0.3;
timeoutAudio.preload = "auto";
timeoutAudio.load();

const defeatAudio = new Audio("/Audio/Wrong.mp3");
defeatAudio.volume = 0.3;
defeatAudio.preload = "auto";
defeatAudio.load();

export function playTimeoutSound() {
    timeoutAudio.currentTime = 0;
    timeoutAudio.play();
}

export function playDefeatSound() {
    defeatAudio.currentTime = 0;
    defeatAudio.play();
}

export function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
