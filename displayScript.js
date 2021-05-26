function show() {
    showPlayer("player1", gameState.data[0]);
    showPlayer("player2", gameState.data[1]);
    showGameState("eventsLog", gameState.data[2]);
    showGameState("effects", gameState.data[3]);
}

function showPlayer(id, obj) {
    var temp = document.getElementById(id);
    temp.innerHTML = "";
    var name = document.createElement("span");
    name.innerText = obj.name;
    name.style.fontSize = "16px";
    name.style.fontWeight = "bold";
    temp.appendChild(name);
    obj.data.forEach(data => {
        if (data.name == "Field") {
            temp.insertBefore(makeLine(), temp.childNodes[3]);
            temp.insertBefore(makeDiv(data, 0, ""), temp.childNodes[4]);
        } else {
            temp.appendChild(makeLine());
            temp.appendChild(makeDiv(data, 0, ""));
        }
    });
}

function showGameState(id, obj) {
    var temp = document.getElementById(id);
    temp.innerHTML = "";
    var name = document.createElement("span");
    name.innerText = obj.name;
    name.style.fontSize = "14px";
    name.style.fontWeight = "bold";
    temp.appendChild(name);
    temp.appendChild(makeLine());
    if (obj.data != undefined) {
        obj.data.forEach(data => {
            if (data.name == "=================" || data.name == "---")
                temp.appendChild(makeLine());
            else
                temp.appendChild(makeDiv(data, 0, "", 10));
        });
    }
    temp.scrollTop = temp.scrollHeight;
}

function makeLine() {
    var line = document.createElement("hr");
    line.style.margin = "2px";
    return line;
}

function makeDiv(obj, indent, replaceText, defaultIndent = 20) {
    if (obj.collapsible == true)
        return makeDivCollapsible(obj);
    var temp = document.createElement("div");
    temp.style.textIndent = indent + "px";
    var name = document.createElement("span");
    var string = obj.name;
    if (string.endsWith(".") || indent > defaultIndent)
        name.style.fontSize = "12px";
    if (string.endsWith("."))
        string = "• " + string;
    if (replaceText != "") {
        name.style.fontSize = "12px";
        name.style.color = "LightGray";
        string = replaceText;
    }
    if (string.startsWith("-- ") && string.endsWith(" --")) {
        string = string.slice(3, -3);
        temp.style.textAlign = "center";
    }
    if (string.startsWith("+ "))
        string = "\u2BC1" + string.slice(1);
    name.innerText = string;
    temp.appendChild(name);
    if (obj.data != undefined) {
        obj.data.forEach((data, index) => {
            var replaceText = getReplaceText(obj, data, index);
            temp.appendChild(makeDiv(data, indent + defaultIndent, replaceText, defaultIndent));
        });
    }
    return temp;
}

function makeDivCollapsible(obj) {
    if (obj.data == undefined)
        obj.data = [];
    var result = document.createElement("div");
    var toggleButton = document.createElement("div");
    toggleButton.style.backgroundColor = "LightGray";
    var name = document.createElement("span");
    name.innerText = obj.name;
    if (obj.isCollapsed)
        name.innerText += " (" + obj.data.length.toString() + ")";
    toggleButton.appendChild(name);
    var toggleSymbol = document.createElement("span");
    if (obj.isCollapsed)
        toggleSymbol.innerText = "[+]";
    else 
        toggleSymbol.innerText = "[-]";
    toggleSymbol.style.float = "right";
    toggleButton.appendChild(toggleSymbol);
    toggleButton.style.padding = "0 2px";
    toggleButton.style.height = "17px";
    result.appendChild(toggleButton);
    var content = document.createElement("div");
    if (obj.data != undefined) {
        obj.data.forEach((data, index) => {
            var replaceText = getReplaceText(obj, data, index);
            content.appendChild(makeDiv(data, 20, replaceText));
        });
    }
    if (obj.isCollapsed)
        content.style.display = "none";
    else 
        content.style.display = "block";
    result.appendChild(content);
    toggleButton.addEventListener("click", _ => {
        if (obj.isCollapsed) {
            obj.isCollapsed = false;
            content.style.display = "block";
            name.innerText = name.innerText.slice(0, name.innerText.lastIndexOf("(") - 1);
            toggleSymbol.innerText = "[-]";
        } else {
            obj.isCollapsed = true;
            content.style.display = "none";
            name.innerText += " (" + obj.data.length.toString() + ")";
            toggleSymbol.innerText = "[+]";
        }
    });
    return result;
}

function getReplaceText(obj, data, index) {
    var replaceText = "";
    if (data.name == "") {
        switch (obj.name) {
        case "Hand":
        case "Banished":
            replaceText = "card";
            break;
        case "Field":
            if (index == 0)
                replaceText = "field spell zone";
            else if (index <= 5)
                replaceText = "spell & trap zone";
            else if (index <= 10)
                replaceText = "monster zone";
            else
                replaceText = "extra monster zone";
            break;
        }
    }
    return replaceText;
}
