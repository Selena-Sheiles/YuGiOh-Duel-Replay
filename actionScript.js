function transformInput(input) {
    if (input.startsWith("{") && input.endsWith("}"))
        input = "[\"push\",[2],\"" + input.slice(1, -1) + "\"]";
    if (!input.startsWith("[")) {
        if (!input.startsWith("\"")) {
            var x = input.indexOf(" ");
            input = "\"" + input.slice(0, x) + "\"," + input.slice(x + 1);
        }
        input = "[" + input + "]";
    }
    return input;
}

function checkAction(action) {
    try {
        var obj = findObject(action[1]);
        switch (action[0]) {
        case "add":
            action.splice(2, 0, action[1].pop());
            if (typeof action[3] == "string")
                action[3] = [action[3]];
            break;
        case "erase":
            action.splice(2, 0, action[1].pop());
            if (typeof action[3] != "number")
                action[3] = 1;
            break;
        case "rename":
            break;
        case "move":
            action.splice(2, 0, action[1].pop());
            action.splice(4, 0, action[3].pop());
            if (typeof action[5] != "string" && typeof action[5] != "number")
                action[5] = 1;
            break;
        case "push":
            action[0] = "add";
            action.splice(2, 0, obj.data.length);
            if (typeof action[3] == "string")
                action[3] = [action[3]];
            break;
        case "clear":
            action[0] = "erase";
            action[2] = 0;
            action[3] = obj.data.length;
            break;
        case "send":
            action[0] = "move";
            action.splice(2, 0, action[1].pop());
            action.splice(4, 0, findObject(action[3]).data.length);
            if (typeof action[5] != "string" && typeof action[5] != "number")
                action[5] = 1;
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
        var revert = JSON.parse(JSON.stringify(action));
        switch (action[0]) {
        case "add":
            revert[0] = "erase";
            revert[3] = action[3].length;
            break;
        case "erase":
            revert[0] = "add";
            revert[3] = obj.data.slice(action[2], action[2] + action[3]).map(data => data.name);
            break;
        case "rename":
            revert[2] = obj.name;
            break;
        case "move":
            var name = obj.data[action[2]].name;
            if (typeof action[5] == "string" && action[5].startsWith(":"))
                revert[5] = ":" + name;
            else {
                if (obj.name == "Field") {
                    if (name.endsWith(" (A)") || name.endsWith(" (D)"))
                        revert[5] = name.slice(-2, -1);
                }
                if (findObject(action[3]).name == "Field") {
                    if (action[5] == "A" || action[5] == "D")
                        revert[5] = 1;
                }
            }
            revert[1] = [...action[3]];
            revert[2] = action[4];
            revert[3] = [...action[1]];
            revert[4] = action[2];
            break;
        }
        return revert;
    } catch (error) {
        console.log("reversion error");
        console.log(action);
        throw error;
    }
}

function execute(action) {
    try {
        var obj = findObject(action[1]);
        switch (action[0]) {
        case "add":
            if (obj.name == "Field")
                obj.data[action[2]].name = action[3][0];
            else
                obj.data.splice(action[2], 0, ...action[3].map(string => ({name: string})));
            break;
        case "erase":
            if (obj.name == "Field")
                obj.data[action[2]].name = "";
            else
                obj.data.splice(action[2], action[3]);
            break;
        case "rename":
            obj.name = action[2];
            break;
        case "move":
            var data = obj.data[action[2]];
            if (typeof action[5] == "string" && action[5].startsWith(":")) {
                execute(["erase", action[1], action[2], 1]);
                execute(["add", action[3], action[4], [action[5].slice(1)]]);
            } else {
                // remove
                var oldData = obj.data[action[2]].name;
                if (obj.name == "Field") {
                    if (oldData.endsWith(" (A)") || oldData.endsWith(" (D)"))
                        oldData = oldData.slice(0, -4);
                    obj.data[action[2]].name = "";
                    oldData = [oldData];
                } else {
                    var count = 1;
                    if (typeof action[5] == "number")
                        count = action[5];
                    oldData = obj.data.splice(action[2], count).map(data => data.name);
                }
                // add
                var obj2 = findObject(action[3]);
                if (obj2.name == "Field") {
                    obj2.data[action[4]].name = oldData[0];
                    if (action[5] == "A" || action[5] == "D")
                        obj2.data[action[4]].name += " (" + action[5] + ")";
                } else
                    obj2.data.splice(action[4], 0, ...oldData.map(string => ({name: string})));
            }
            break;
        }
    } catch (error) {
        console.log("execution error");
        console.log(action);
        throw error;
    }
}

function findObject(indexArray) {
    var obj = gameState;
    indexArray.forEach(index => {
        if (index < 0)
            index = obj.data.length + index;
        obj = obj.data[index];
    });
    if (obj && obj.data == undefined)
        obj.data = [];
    return obj;
}

// TODO: rewrite "move" action