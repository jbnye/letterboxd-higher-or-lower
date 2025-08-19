const timeoutAudio = new Audio("/Audio/lichess-beep.mp3");
timeoutAudio.volume = 0.3;
timeoutAudio.preload = "auto";
timeoutAudio.load();

const defeatAudio = new Audio("/Audio/Wrong.mp3");
defeatAudio.volume = 0.3;
defeatAudio.preload = "auto";
defeatAudio.load();

const correctAudio = new Audio("/Audio/duolingo-correct-sound-effect.mp3");
correctAudio.volume = 0.3;
correctAudio.preload = "auto";
correctAudio.load();

const highscoreAudio = new Audio("/Audio/LevelUp.ogg");
highscoreAudio.volume = 0.3;
highscoreAudio.preload = "auto";
highscoreAudio.load();

export function playTimeoutSound() {
    timeoutAudio.currentTime = 0;
    timeoutAudio.play();
}

export function playDefeatSound() {
    defeatAudio.currentTime = 0;
    defeatAudio.play();
}

export function playCorrectSound(){
    correctAudio.currentTime = 0.2;
    correctAudio.play();
}

export function playHighscoreSound(){
    highscoreAudio.currentTime = 0.0;
    highscoreAudio.play();
}

export function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

