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
            if (typeof action[2] != "number")
                action.splice(2, 0, action[1].pop());
            obj = findObject(action[1]);
            if (obj.data.length < action[2])
                return false;
            break;
        case "erase":
            if (typeof action[2] != "number")
                action.splice(2, 0, action[1].pop());
            obj = findObject(action[1]);
            if (obj.data.length <= action[2])
                return false;
            if (action[3] != undefined && obj.data.length < action[2] + action[3])
                return false;
            break;
        case "rename":
            break;
        case "move":
            if (typeof action[2] != "number")
                action.splice(2, 0, action[1].pop());
            obj = findObject(action[1]);
            if (obj.data.length <= action[2])
                return false;
            if (action[5] != undefined && obj.data.length < action[2] + action[5])
                return false;
            obj = findObject(action[3]);
            if (action[4] == undefined)
                action[4] = obj.data.length;
            if (obj.data.length < action[4])
                return false;
            break;
        case "push":
            break;
        case "pop":
            var count = action[2];
            if (count == undefined)
                count = 1;
            if (obj.data.size < count)
                return false;
            break;
        case "clear":
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
    var obj = findObject(action[1]);
    var revert = JSON.parse(JSON.stringify(action));
    switch (action[0]) {
    case "add":
        console.log(action);
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
            revert[3] = obj.data.slice(action[2], action[2] + action[3]).map(data => data.name);
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
        if (typeof action[2] == "string")
            revert.pop();
        else 
            revert[2] = action[2].length;
        break;
    case "pop":
        revert[0] = "push";
        if (typeof action[2] == "number")
            revert[2] = obj.data.slice(-action[2]).map(data => data.name);
        else 
            revert[2] = obj.data.slice(-1)[0].name;
        break;
    case "clear":
        revert[0] = "push";
        revert.push(obj.data.map(data => data.name));
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
            oldData = obj.data.splice(action[2], action[5]).map(data => data.name);
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
        if (typeof action[2] == "string")
            obj.data.push({name: action[2]});
        else 
            obj.data.push(...action[2].map(string => ({name: string})));
        break;
    case "pop":
        if (action[2] == undefined)
            obj.data.pop();
        else 
            obj.data.splice(-action[2]);
        break;
    case "clear":
        obj.data = [];
        break;
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
