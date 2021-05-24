var gameState;
var actionHistory;
var actionReverse;
var actionIndex;
var isPaused;
var playDirection;

function init() {
    resetGameState();
    actionHistory = [];
    actionReverse = [];
    actionIndex = 0;
    document.getElementById("delayDefault").value = 500;
    isPaused = true;
    playDirection = 1;
}

function loadActionHistory() {
    resetGameState();
    var strings = document.getElementById("actionsLog").value.split("\n").reduce((lines, line) => {
        if (line != "" && !line.startsWith("//"))
            lines.push(line);
        return lines;
    }, []);
    actionHistory = strings.map(string => JSON.parse(string));
    actionReverse = [];
    actionIndex = 0;
    actionHistory.forEach(action => {
        actionReverse.push(reverse(action));
        execute(action);
    });
    resetGameState();
}

function resetGameState() {
    gameState = {
        data: [{
            name: "Player 1"
        },{
            name: "Player 2"
        },{
            name: "Events log"
        },{
            name: "Global effects"
        }]
    };
    function initPlayer(player) {
        player.data = [{
            name: "8000 LP"
        },{
            name: "Hand",
            collapsible: true,
            isCollapsed: false
        },{
            name: "Field"
        },{
            name: "Graveyard",
            collapsible: true,
            isCollapsed: true
        },{
            name: "Banished",
            collapsible: true,
            isCollapsed: true
        },{
            name: "Effects"
        }];
        player.data[1].data = Array(5).fill(null).map(_ => ({name: ""}));
        player.data[2].data = Array(13).fill(null).map(_ => ({name: ""}));
    }
    initPlayer(gameState.data[0]);
    initPlayer(gameState.data[1]);
    show();
}

function addAction() {
    event.preventDefault();
    var input = this.inputValue.value;
    var log = document.getElementById("actionsLog");
    if (input == "n") {
        log.value += "\n";
    } else if (input.startsWith("//")) {
        log.value += input + "\n";
    } else try {
        if (input.startsWith("{") && input.endsWith("}")) {
            input = "[\"push\",[2],\"" + input.slice(1, -1) + "\"]";
            console.log(input);
        }
        var action = JSON.parse(input);
        if (checkAction(action)) {
            executeEverything();
            var revert = reverse(action);
            execute(action);
            log.value += input + "\n";
            actionHistory.push(action);
            actionReverse.push(revert);
            actionIndex++;
        } else {
            alert("invalid command");
            return;
        }
    } catch (error) {
        console.log(error);
        alert("invalid syntax");
        return;
    }
    document.getElementById("input").reset();
    scrollToBottom();
    show();
}

function removeAction() {
    if (actionHistory.length > 0) {
        executeEverything();
        stepPrev();
        actionHistory.pop();
        actionReverse.pop();
    }
    scrollToBottom();
    show();
}

function skipToEnd() {
    executeEverything();
    scrollToBottom();
    show();
}

function executeEverything() {
    while (actionIndex < actionHistory.length) {
        execute(actionHistory[actionIndex]);
        actionIndex++;
    }
}

function scrollToBottom() {
    var obj = document.getElementById("actionsLog");
    obj.scrollTop = obj.scrollHeight;
}

function stepPrev() {
    if (actionIndex > 0) {
        actionIndex--;
        execute(actionReverse[actionIndex]);
    }
    show();
}

function stepNext() {
    if (actionIndex < actionHistory.length) {
        execute(actionHistory[actionIndex]);
        actionIndex++;
    }
    show();
}

function reversePlayDirection() {
    playDirection = -playDirection;
}

function playAnimation() {
    isPaused = false;
    document.getElementById("togglePlay").onclick = pauseAnimation;
    document.getElementById("togglePlay").innerHTML = "Pause";
    (function loop() {
        new Promise((resolve, reject) => {
            var action = null;
            if (playDirection > 0 && actionIndex < actionHistory.length) {
                action = actionHistory[actionIndex];
                actionIndex++;
            }
            if (playDirection < 0 && actionIndex > 0) {
                actionIndex--;
                action = actionReverse[actionIndex];
            }
            if (action == null) {
                pauseAnimation();
                return;
            }
            execute(action);
            show();
            var delay = document.getElementById("delayDefault").value;
            setTimeout(resolve, delay);
        }).then(resolve => {
            if (!isPaused)
                loop();
        }, reject => {
            pauseAnimation();
            alert("Error!");
        });
    })();
}

function pauseAnimation() {
    isPaused = true;
    document.getElementById("togglePlay").onclick = playAnimation;
    document.getElementById("togglePlay").innerHTML = "Play";
    show();
}
