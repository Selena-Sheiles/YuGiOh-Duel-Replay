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
    updatePlayButton();
}

function loadActions() {
    refreshActions();
    resetGameState();
    actionIndex = 0;
}

function refreshActions() {
    resetGameState();
    var strings = document.getElementById("actionsLog").value.split("\n").reduce((lines, line) => {
        if (line != "" && !line.startsWith("//"))
            lines.push(line);
        return lines;
    }, []);
    actionHistory = strings.map(string => JSON.parse(transformInput(string)));
    actionReverse = [];
    actionIndex = 0;
    actionHistory.forEach(action => {
        checkAction(action);
        actionReverse.push(reverse(action));
        execute(action);
        actionIndex++;
    });
    show();
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

function addAction(e) {
    if (e.key != "Enter")
        return;
    var inputField = document.getElementById("inputString");
    var input = inputField.value;
    var log = document.getElementById("actionsLog");
    if (input == "n") {
        log.value += "\n";
    } else if (input.startsWith("//")) {
        log.value += input + "\n";
    } else try {
        if (actionIndex < actionHistory.length)
            refreshActions();
        var action = JSON.parse(transformInput(input));
        if (checkAction(action)) {
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
    inputField.value = "";
    log.scrollTop = log.scrollHeight;
    show();
}

function loadFromFile() {
    var files = document.getElementById("inputFile").files;
    var blob = new Blob([files[0]]);
    blob.text().then(string => {
        var log = document.getElementById("actionsLog");
        log.value = string;
        loadActions();
    });
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
    updatePlayButton();
}

function playAnimation() {
    isPaused = false;
    updatePlayButton();
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
    updatePlayButton();
    show();
}

function updatePlayButton() {
    var obj = document.getElementById("togglePlay");
    if (isPaused) {
        obj.onclick = playAnimation;
        if (playDirection > 0) {
            obj.innerHTML = "&#9654;";
            obj.title = "Play \uD83E\uDC1A";
        } else {
            obj.innerHTML = "&#9664;";
            obj.title = "Play \uD83E\uDC18";
        }
    } else {
        obj.onclick = pauseAnimation;
        obj.innerHTML = "&#10074;&#10074;";
        obj.title = "Pause";
    }
}
