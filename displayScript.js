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
        drawLine(temp);
        temp.appendChild(makeDiv(data, 0, ""));
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
    drawLine(temp);
    if (obj.data != undefined)
        obj.data.forEach(data => temp.appendChild(makeDiv(data, 0, "")));
    temp.scrollTop = temp.scrollHeight;
}

function drawLine(node) {
    var line = document.createElement("hr");
    line.style.margin = "2px";
    node.appendChild(line);
}

function makeDiv(obj, indent, replaceText) {
    if (obj.collapsible == true)
        return makeDivCollapsible(obj);
    var temp = document.createElement("div");
    temp.style.textIndent = indent + "px";
    var name = document.createElement("span");
    // console.log(obj);
    var string = obj.name;
    if (string.endsWith(".") || indent > 20)
        name.style.fontSize = "12px";
    if (string.endsWith("."))
        string = "• " + string;
    if (replaceText != "") {
        name.style.fontSize = "12px";
        name.style.color = "LightGray";
        string = replaceText;
    }
    name.innerText = string;
    temp.appendChild(name);
    if (obj.data != undefined) {
        obj.data.forEach((data, index) => {
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
            temp.appendChild(makeDiv(data, indent + 20, replaceText));
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
