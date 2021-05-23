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
    document.getElementById("delayDefault").value = 1000;
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

function checkAction(action) {
    try {
        var obj = findObject(action[1]);
        switch (action[0]) {
        case "add":
            if (obj.data.length < action[2])
                return false;
            break;
        case "erase":
            if (obj.data.length <= action[2])
                return false;
            if (action[3] != undefined && obj.data.length < action[2] + action[3])
                return false;
            break;
        case "rename":
            break;
        case "move":
            if (obj.data.length <= action[2])
                return false;
            if (action[5] != undefined && obj.data.length < action[2] + action[5])
                return false;
            obj = findObject(action[3]);
            if (obj.data.length < action[4])
                return false;
            break;
        case "push":
            break;
        default:
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
    return true;
}

function reverse(action) {
    try {
        var obj = findObject(action[1]);
    } catch (error) {
        console.log(action[1]);
    }
    var revert = JSON.parse(JSON.stringify(action));
    switch (action[0]) {
    case "add":
        revert[0] = "erase";
        if (typeof action[3] == "string")
            revert.pop();
        else 
            revert[3] = action[3].length;
        break;
    case "erase":
        revert[0] = "add";
        if (action[3] == undefined)
            revert.push(obj.data[action[2]].name);
        else
            revert[3] = obj.data.slice(action[2], action[2] + action[3]).map(obj => obj.name);
        break;
    case "rename":
        revert[2] = obj.name;
        break;
    case "move":
        if (obj.name == "Field") {
            var name = obj.data[action[2]].name;
            if (name.endsWith(" (A)") || name.endsWith(" (D)"))
                revert.push(obj.data[action[2]].name.slice(-2, -1));
        }
        var obj2 = findObject(action[3]);
        if (obj2.name == "Field")
            if (action[5] == "A" || action[5] == "D")
                revert.pop();
        revert[1] = [...action[3]];
        revert[2] = action[4];
        revert[3] = [...action[1]];
        revert[4] = action[2];
        break;
    case "push":
        revert[0] = "pop";
        revert.length = 2;
        break;
    }
    return revert;
}

function execute(action) {
    var obj = findObject(action[1]);
    switch (action[0]) {
    case "add":
        if (typeof action[3] == "string") {
            if (obj.name == "Field")
                obj.data[action[2]].name = action[3];
            else
                obj.data.splice(action[2], 0, {name: action[3]});
        } else
            obj.data.splice(action[2], 0, ...action[3].map(string => ({name: string})));
        break;
    case "erase":
        if (action[3] == undefined) {
            if (obj.name == "Field")
                obj.data[action[2]].name = "";
            else
                obj.data.splice(action[2], 1);
        } else
            obj.data.splice(action[2], action[3]);
        break;
    case "rename":
        obj.name = action[2];
        break;
    case "move":
        // remove
        var oldData = obj.data[action[2]].name;
        if (obj.name == "Field") {
            if (oldData.endsWith(" (A)") || oldData.endsWith(" (D)"))
                oldData = obj.data[action[2]].name.slice(0, -4);
            obj.data[action[2]].name = "";
        } else if (typeof action[5] != "number")
            obj.data.splice(action[2], 1);
        else
            oldData = obj.data.splice(action[2], action[5]).map(obj => obj.name);
        // add
        var obj2 = findObject(action[3]);
        if (obj2.name == "Field") {
            obj2.data[action[4]].name = oldData;
            if (action[5] == "A" || action[5] == "D")
                obj2.data[action[4]].name += " (" + action[5] + ")";
        } else if (typeof action[5] != "number")
            obj2.data.splice(action[4], 0, {name: oldData});
        else
            obj2.data.splice(action[4], 0, ...oldData.map(string => ({name: string})));
        break;
    case "push":
        obj.data.push({name: action[2]});
        break;
    case "pop":
        obj.data.pop();
        break;
    }
}

function findObject(indexArray) {
    var obj = gameState;
    indexArray.forEach(index => obj = obj.data[index]);
    if (obj.data == undefined)
        obj.data = [];
    return obj;
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
