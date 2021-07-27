const canvasOffset = {x: 0,y: 0};
const inputsVal = {
    selectedButton: "line",
    dropMenuSelectedButtons: {},
    mouseDown: false,
    color1: "",
    color2: "",
    size: 0,
    clipboard: null,
    mousePos: {x:0 , y:0,dx:0,dy:0},
    gridlines: false,
    gridsize: 30
}
Object.defineProperties(inputsVal.mousePos,{
    xGrid:{
        get: function(v){
            if(inputsVal.gridsize <= 0 || !inputsVal.gridlines)
                return this.x - canvasOffset.x;
            return Math.round((this.x - canvasOffset.x)/inputsVal.gridsize)*inputsVal.gridsize;
        }
    },
    yGrid:{
        get: function(v){
            if(inputsVal.gridsize <= 0 || !inputsVal.gridlines)
                return this.y - canvasOffset.y;
            return Math.round((this.y - canvasOffset.y)/inputsVal.gridsize)*inputsVal.gridsize;
        }
    },
    point:{
        get: function() {
            return {x:this.xGrid ,y:this.yGrid};
        }
    }
});

class Paint{
    #history;
    #shapes;
    #selected;
    #idCounter;
    #redo;
    constructor(ctx){
        this.#history = [];
        this.#redo = [];
        this.#shapes = [];
        this.#selected = [];
        this.#idCounter = 0;

        this.ctx = ctx;

    }
    get selected(){
        this.selected = this.#selected;//temp fix for assigning empty array and then add items
        return this.#selected;
    }
    set selected(s){
        if(this.#selected.length > 0){//remove old selected
            this.#selected.forEach((shape)=>{shape.flag.selected = false;});
        }
        this.#selected = s;
        this.#selected.forEach((shape)=>{shape.flag.selected = true;});
    }
    get shapes(){
        return this.#shapes;
    }
    penDown(){
        this["_" + inputsVal.selectedButton + "Function"]();
        this.selected = [];
    }
    #penUp(obj){
        if(obj.id != undefined){
            this.#shapes.push(obj);
            this.#history.push({operation:inputsVal.selectedButton, array: [obj]});
            if(obj.id >= 0){//not erasor
                this.selected = [obj];
            }
        }
    }
    updateSelected(){
        for(const shape of this.selected){
            if(shape === undefined)
                return;
            shape.size = inputsVal.size;
            shape.borderColor = inputsVal.color1;
            shape.fillColor = inputsVal.color2;
            switch(inputsVal.dropMenuSelectedButtons.outline){
                case "no outline":shape.flag.stroke = false;break;
                case "solid color":shape.flag.stroke = true;break;
            }
            switch(inputsVal.dropMenuSelectedButtons.fill){
                case "no fill":shape.flag.fill = false;break;
                case "solid color":shape.flag.fill = true;break;
            }
        }
    }
    _lineFunction(){
        this.#redo = [];
        const startP = inputsVal.mousePos.point;
        const obj = new Line(this.ctx)
        obj.startPos = startP;
        obj.size = inputsVal.size;
        switch(inputsVal.dropMenuSelectedButtons.outline){
            case "no outline":obj.flag.stroke = false;break;
            case "solid color":obj.flag.stroke = true;break;
        }
        obj.borderColor = inputsVal.color1;
        obj.fillColor = inputsVal.color2;

        const loop =(lastPos = {x:-1,y:-1})=>{
            obj.endPos = inputsVal.mousePos.point;
            if(!equalPoints(lastPos,obj.endPos) || inputsVal.gridlines)//grid snap bug
                obj.draw();
            if(inputsVal.mouseDown){
                requestAnimationFrame(function(){loop(obj.endPos);});
                return;
            }

            if(obj.startPos.x != obj.endPos.x || obj.startPos.y != obj.endPos.y){
                obj.id = this.#idCounter++;
                this.#penUp(obj);
                obj.draw();
            }
        }
        loop();
    }
    _rectangleFunction(){
        this.#redo = [];
        const startP = inputsVal.mousePos.point;
        const obj = new Rectangle(this.ctx)
        obj.startPos = startP;
        obj.size = inputsVal.size;
        switch(inputsVal.dropMenuSelectedButtons.outline){
            case "no outline":obj.flag.stroke = false;break;
            case "solid color":obj.flag.stroke = true;break;
        }
        switch(inputsVal.dropMenuSelectedButtons.fill){
            case "no fill":obj.flag.fill = false;break;
            case "solid color":obj.flag.fill = true;break;
        }

        const loop =(lastPos = {x:-1,y:-1})=>{;
            obj.borderColor = inputsVal.color1;
            obj.fillColor = inputsVal.color2;
            obj.endPos = inputsVal.mousePos.point;
            if(!equalPoints(lastPos,obj.endPos))
                obj.draw();
            if(inputsVal.mouseDown){
                requestAnimationFrame(function(){loop(obj.endPos);});
                return;
            }

            if(obj.startPos.x != obj.endPos.x || obj.startPos.y != obj.endPos.y){
                obj.id = this.#idCounter++;
                this.#penUp(obj);
                obj.draw();
            }       
        }
        loop();
    }
    _circleFunction(){
        this.#redo = [];
        const startP = inputsVal.mousePos.point;
        const obj = new Circle(this.ctx)
        obj.startPos = startP;
        obj.size = inputsVal.size;
        switch(inputsVal.dropMenuSelectedButtons.outline){
            case "no outline":obj.flag.stroke = false;break;
            case "solid color":obj.flag.stroke = true;break;
        }
        switch(inputsVal.dropMenuSelectedButtons.fill){
            case "no fill":obj.flag.fill = false;break;
            case "solid color":obj.flag.fill = true;break;
        }

        const loop =(lastPos = {x:-1,y:-1})=>{;
            obj.borderColor = inputsVal.color1;
            obj.fillColor = inputsVal.color2;
            obj.endPos = inputsVal.mousePos.point;
            if(!equalPoints(lastPos,obj.endPos))
                obj.draw();
            if(inputsVal.mouseDown){
                requestAnimationFrame(function(){loop(obj.endPos);});
                return;
            }

            if(obj.startPos.x != obj.endPos.x || obj.startPos.y != obj.endPos.y){
                obj.id = this.#idCounter++;
                this.#penUp(obj);
                obj.draw();
            }        
        }
        loop();
    }
    _erasorFunction(){
        this.#redo = [];
        const obj = new Brush(this.ctx);
        obj.size = 20;
        obj.borderColor = "#fff";

        const erasePoint =()=>{
            obj.addPoint(inputsVal.mousePos.point);
            obj.draw();
            if(inputsVal.mouseDown){
                requestAnimationFrame(function(){erasePoint();});
                return;
            }
            obj.finish();
            obj.id = -1;
            this.#penUp(obj);
        }
        erasePoint();
    }
    _brushFunction(){
        this.#redo = [];
        const obj = new Brush(this.ctx);
        obj.size = inputsVal.size;
        obj.borderColor = inputsVal.color1;

        const point =()=>{
            obj.addPoint(inputsVal.mousePos.point);
            obj.draw();
            if(inputsVal.mouseDown){
                requestAnimationFrame(function(){point();});
                return;
            }
            obj.finish();
            obj.id = this.#idCounter++;
            this.#penUp(obj);
        }
        point();
    }
    _undoFunction(){
        this.selected = [];
        if(this.#history.length == 0)
            return;
        const lastOperation = this.#history.pop();
        switch(lastOperation.operation){
            case "line":
            case "rectangle":
            case "circle":
            case "brush":
            case "erasor":
                this.#shapes.pop();
                this.#redo.push(lastOperation);
                break;
            case "delete":
                this.#shapes.push(...lastOperation.array)
                this.#redo.push(lastOperation);
                break;
            case "changePos":
                for (const shape of lastOperation.array){
                    shape.changePos(-lastOperation.dx,-lastOperation.dy);
                }
                this.#redo.push(lastOperation);
                break;

        }
    }
    _redoFunction(){
        this.selected = [];
        if(this.#redo.length == 0)
            return;
        const lastOperation = this.#redo.pop();
        switch(lastOperation.operation){
            case "line":
            case "rectangle":
            case "circle":
            case "brush":
            case "erasor":
                this.#shapes.push(...lastOperation.array);
                this.#history.push(lastOperation);
                break;
            case "delete":
                this._deleteFunction(lastOperation.array);//no need to push in history
                break;
            case "changePos":
                for (const shape of lastOperation.array){
                    shape.changePos(lastOperation.dx,lastOperation.dy);
                }
                this.#history.push(lastOperation);
                break;



        }
    }
    _selectFunction(){
        const arr = [];

        const rect = new Rectangle(this.ctx)
        rect.startPos = inputsVal.mousePos.point;
        rect.lineStyle = [4,4];
        rect.borderColor = "blue";

        const loop =(lastPos = {x:-1,y:-1})=>{;
            rect.endPos = inputsVal.mousePos.point;
            if(lastPos.x != rect.endPos.x || lastPos.y != rect.endPos.y)
                rect.draw();
            if(inputsVal.mouseDown){
                requestAnimationFrame(function(){loop(rect.endPos);});
                return;
            }
            for(const shape of this.#shapes){//check if shapes inside the selected area
                if(shape.id < 0)//don't select erasor shapes
                    continue;
                arr.push(shape);
                for (const point of shape.mainPoints) {
                    if(rect.pointDist(point) > 0){  //if any part of shape outside the selected area
                        arr.pop();                  //do not select it
                        break;
                    }
                }
            }

            this.selected = arr;
        }
        loop();
    }
    _deleteFunction(objects = this.selected){
        this.#redo = [];
        for (const obj of objects){
            let index = this.shapes.findIndex((shape)=>{return shape.id === obj.id});
            if(index != -1)
                this.shapes.splice(index, 1);
        }
        this.#history.push({operation:"delete", array: objects});
    }
    _changePosFunction(){
        let startP = inputsVal.mousePos.point;
        let dxTotal = -startP.x, dyTotal = -startP.y;
        let endP = {x:undefined,y:undefined};

        const loop = ()=>{
            endP = inputsVal.mousePos.point;
            if(!equalPoints(startP,endP))
                for (const shape of this.selected){
                    shape.changePos((endP.x-startP.x),(endP.y-startP.y));
                    shape.draw();
                }
            startP = endP;
            if(inputsVal.mouseDown){
                requestAnimationFrame(function(){loop();});
                return;
            }
            dxTotal += endP.x;
            dyTotal += endP.y;
            this.#history.push({operation:"changePos", array: [...this.selected],dx: dxTotal,dy:dyTotal});

        }
        loop();
    }
    drawAll(){
        for(const shape of this.#shapes){
            shape.draw();
        }
    }
};
class PaintGUI{
    #mainButtons;
    #toolbarButtons
    #dropMenuIcons;
    #dropMenuButtons;
    #inputs;
    #cursor;

    #canvas;
    #ctx;

    constructor(){
        this.#mainButtons = new ButtonsGroup("selectedButton");
        this.#inputs = {};
        this.#dropMenuIcons = {};
        this.#dropMenuButtons = {};
        this.#toolbarButtons = {};
        this.#cursor = "crosshair";

        this.#getElements();

        canvasOffset.y = this.#canvas.offsetTop;
        canvasOffset.x = this.#canvas.offsetLeft;

        this.#mainButtons.selected = "line";
        this.#dropMenuButtons.fill.selected = "no fill";
        
        this.app = new Paint(this.#ctx);

        this.#addEvents();
        this.#clearCanvas();
        this.reset();
    }
    #getElements(){
        let mainSec , inputs , dropMenuIcons;
        let buttons = document.querySelectorAll(".submenu > .button, .submenu > .box > .button");
        for(let i=0;i<buttons.length;i++){
            let key = buttons[i].innerText;
            if(buttons[i].className.includes("small"))
                key = buttons[i].title;
            if(key == "")
                key = "Button" + i;
            key = key.toLowerCase();
            if(typeof Paint.prototype["_" + key + "Function"] != "function")
                buttons[i].className += " disabled"; 
            this.#mainButtons.addButton(key,buttons[i]);
        }

        let toolbarButtons = document.querySelectorAll(".toolbar > .button");
        for(let i=0;i<toolbarButtons.length;i++){
            let key = toolbarButtons[i].title;
            if(key == "")
                key = "toolbarButton" + i;
            key = key.toLowerCase();
            if(typeof Paint.prototype["_" + key + "Function"] != "function")
                toolbarButtons[i].className += " disabled"; 
            this.#toolbarButtons[key] = toolbarButtons[i];
        }

        dropMenuIcons = document.querySelectorAll(".submenu > .dropMenuIcon");
        for(let i=0;i<dropMenuIcons.length;i++){
            let key = dropMenuIcons[i].innerText;
            if(key == "")
                key = "dropMenuIcons" + i;
            key = key.toLowerCase();
            this.#dropMenuIcons[key] = dropMenuIcons[i];
            this.#dropMenuButtons[key] = new ButtonsGroup("dropMenuSelectedButtons" , key);

            const dropMenuButtons = dropMenuIcons[i].querySelectorAll(".button");
            for(let i=0;i<dropMenuButtons.length;i++){//get dropmenu buttons
                let key2 = dropMenuButtons[i].innerText;
                if(key2 == "")
                    key2 = "dropMenuIcons" + i;
                key2 = key2.toLowerCase();
                this.#dropMenuButtons[key].addButton(key2 , dropMenuButtons[i]);
            }

        }

        inputs = document.getElementsByTagName("input")
        for(let i=0;i<inputs.length;i++){
            let key = inputs[i].name;
            if(key == "")
                key = "inputs" + i;
            this.#inputs[key.toLowerCase()] = inputs[i];

            if(inputs[i].type == "checkbox")//update inputsVal
                inputsVal[key] = inputs[i].checked;
            else
                inputsVal[key] = inputs[i].value;
        }

        mainSec = document.getElementById("mainSec");
        
        this.#canvas = document.getElementsByTagName("canvas")[0];
        this.#canvas.height = mainSec.offsetHeight * 0.9;
        this.#canvas.width = mainSec.offsetWidth * 0.7;
        this.#ctx = this.#canvas.getContext("2d");

    }
    #addEvents(){
        let self = this;
        let displayFlag = false;// to invoke display just once every ani.frame
        let shapeHover = false;

        window.addEventListener("mousemove",function(event){
            inputsVal.mousePos.x = event.x;
            inputsVal.mousePos.y = event.y;
            inputsVal.mousePos.dx = 0;
            inputsVal.mousePos.dy = 0;
            requestAnimationFrame(function(){displayFlag = true;});

            if(self.app.selected.length > 0){
                for(const shape of self.app.selected){
                    shapeHover = shape.hover();
                    if(shapeHover)
                        break;
                } 
                if(shapeHover)
                    self.#cursor = "move";
                else
                    self.#cursor = "crosshair";
            }
            else{
                shapeHover = false;
                self.#cursor = "crosshair";
            }

            if(displayFlag){
                self.display();
                displayFlag = false;
            }
            // console.log(inputsVal.mousePos.point);
        });
        this.#canvas.addEventListener("mousedown", function (event) {
            if (event.button == 0) { //left mouse button
                inputsVal.mouseDown = true;
                if(shapeHover){
                    self.app._changePosFunction();
                }
                else
                    self.app.penDown();
                // self.display();
            }
        });
        window.addEventListener("mouseup", function (event) {
            if (event.button == 0) { //left mouse button
                inputsVal.mouseDown = false;
                self.display();
            }
        });

        document.addEventListener("keydown", function(event){
            const key = event.code;

            switch(key) {
                case "Delete":
                    self.app["_deleteFunction"]();
                    break;
                case "Escape":
                    self.app.selected = [];
                    break;
            }
            
            if(event.ctrlKey){
                if(key === "KeyZ")
                    self.app["_undoFunction"]();
                    
                else if(key === "KeyY")
                    self.app["_redoFunction"]();
                    
            }

            requestAnimationFrame(self.display.bind(self));
        });
        
        for(const toolbarButton in self.#toolbarButtons){
            if(self.#toolbarButtons[toolbarButton].className.includes("disabled"))
                continue;
            self.#toolbarButtons[toolbarButton].addEventListener("mousedown", function(){
                this.className += " selected";
            });
            self.#toolbarButtons[toolbarButton].addEventListener("mouseup" , function(event){
                this.className = this.className.replace(" selected" , "");
                self.app["_"+toolbarButton+"Function"]();
                self.display();
            });
        }

        for(const dropMenuIcon in self.#dropMenuIcons){
            self.#dropMenuIcons[dropMenuIcon].addEventListener("click", function(){
                if(this.className.includes(" selected"))
                    return;
                this.className += " selected";
                this.querySelector(".dropMenu").style.display = "block";
            });
            document.addEventListener("click" , function(event){//close dropmenu when clicking outside it
                let element = self.#dropMenuIcons[dropMenuIcon];
                let inside = element.contains(event.target);
                if(!inside){
                    element.className = element.className.replace(" selected", "");
                    element.querySelector(".dropMenu").style.display = "none";
                }
            });
        }
        for(const input in self.#inputs){
            self.#inputs[input].addEventListener("change", function(){
                if(this.type == "checkbox")
                    inputsVal[input] = this.checked;
                else
                    inputsVal[input] = this.value;
            
                self.app.updateSelected();
                self.display();
            });
        }

        this.#inputs.size.addEventListener("change",function(){
            let displayVal = this.nextElementSibling;
            let sizePreveiw = document.getElementById("sizePreveiw");

            displayVal.innerText = this.value;
            sizePreveiw.style.height = this.value + "px";
            sizePreveiw.style.margin = 35 - 0.5*this.value + "px auto";
        });

    }
    #clearCanvas(){
        let size;
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

        if(inputsVal.gridlines){
            size = { x: this.#canvas.width / inputsVal.gridsize, y: this.#canvas.height / inputsVal.gridsize };
            this.#ctx.globalAlpha = 0.2;
            this.#ctx.strokeStyle = "#000000";
            this.#ctx.lineWidth = 1;
            for (let i = 0; i < size.y + 1; i++) {
                this.#ctx.beginPath();
                this.#ctx.moveTo(0, i * inputsVal.gridsize);
                this.#ctx.lineTo(inputsVal.gridsize * size.x, i * inputsVal.gridsize);
                this.#ctx.stroke();
            }
            for (let i = 0; i < size.x + 1; i++) {
                this.#ctx.beginPath();
                this.#ctx.moveTo(i * inputsVal.gridsize, 0);
                this.#ctx.lineTo(i * inputsVal.gridsize, inputsVal.gridsize * size.y);
                this.#ctx.stroke();
            }
            this.#ctx.globalAlpha = 1;
        }
    }

    display(){
        this.#clearCanvas();
        this.app.drawAll();
        this.#canvas.style.cursor = this.#cursor;
    }
    reset(){
        // this.app.reset();
        this.#clearCanvas();
    }
};

class ButtonsGroup{
    #outputVar;
    #selected;
    constructor(...outVarChain){
        this.buttons = {};
        this.#selected = "";
        this.#outputVar = outVarChain;
    }
    #updateOutputVarValue(){
        let obj = inputsVal;
        const lastProperty = this.#outputVar.pop();
        for(const property of this.#outputVar){ //traverse the object chain and update the value
            obj = obj[property];                //example: outputVar = [prop1,prop2,lastProp]
        }                                       //inputsVal = {prop1:{prop2:{lastProp}}}
        obj[lastProperty] = this.selected;
        this.#outputVar.push(lastProperty);
    }
    addButton(name , button){
        this.buttons[name] = button;
        this.selected = name;
        this.addSelectionEvent(name);
    }
    addSelectionEvent(name){
        const self = this;
        self.buttons[name].addEventListener("click",function(){
                self.selected = name;
        });
    }
    get selected(){
        return this.#selected;
    }
    set selected(val){
        if(this.buttons[val].className.includes("disabled"))
            return;

        const selected = this.buttons[this.selected];
        if(this.selected != "")
            selected.className = selected.className.replace(" selected", "");
        if(!this.buttons[val].className.includes(" selected"))
            this.buttons[val].className += " selected";
        this.#selected = val;
        this.#updateOutputVarValue();
    }
    
};

class Shape {
    constructor(ctx) {
        this.mainPoints = [];
        this.id = undefined;
        this.startPos = { x: undefined, y: undefined };
        this.endPos = { x: undefined, y: undefined };
        this.middlePos = { x: undefined, y: undefined };
        this.borderColor = "#000000";
        this.fillColor = "#ffffff";
        this.lineStyle = [];
        this.size = 1;
        this.flag = {selected: false, fill: false, stroke: true};
        Object.defineProperties(this, {
            ctx: { value: ctx },
        });
    }
    set(stx, sty, edx, edy, borderColor = this.borderColor) {
        this.startPos.x = stx;
        this.startPos.y = sty;
        this.endPos.x = edx;
        this.endPos.y = edy;
        this.borderColor = borderColor;
    }
    changePos(dx,dy){
        const points = [this.startPos,this.endPos];
        for(const p of points){
            p.x+=dx;
            p.y+=dy;
        }
    }
    draw() {
        if (this.notComplete())
            return;
        this.ctx.strokeStyle = this.borderColor;
        this.ctx.fillStyle = this.fillColor;
        this.ctx.lineWidth = this.size;
        this.calcDimensions();
        this.drawShape();
        if(this.flag.fill)
            this.ctx.fill();
        if(this.flag.stroke)
            this.ctx.stroke();        
        if (this.flag.selected)
            this.selected();
    }
    drawShape() {
        throw new Error("Generic shape does not have drawShape");
    }
    getCode() {
        throw new Error("Generic shape does not have getCode");
    }
    notComplete() {
        return (this.startPos.x == undefined ||
            this.startPos.y == undefined ||
            this.endPos.x == undefined ||
            this.endPos.y == undefined);
    }
    pointDist(point) {
        let dist = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
        dist[0].x = Math.abs(this.startPos.x - point.x);
        dist[0].y = Math.abs(this.startPos.y - point.y);
        dist[1].x = Math.abs(this.endPos.x - point.x);
        dist[1].y = Math.abs(this.endPos.y - point.y);
        dist[2].x = Math.abs(this.middlePos.x - point.x);
        dist[2].y = Math.abs(this.middlePos.y - point.y);

        dist.sort((a, b) => (a.x + a.y) - (b.x + b.y));
        return Math.sqrt(dist[0].x ** 2 + dist[0].y ** 2);
    }
    hover() {
        const dist = 3;
        return (this.pointDist(inputsVal.mousePos.point) <= dist);
    }
    selected() {
        let size = 3;
        let rect = new Rectangle(this.ctx);
        rect.flag.fill = true;

        for(const point of this.mainPoints){
            rect.set(point.x - size, point.y - size, point.x + size, point.y + size);
            rect.draw();
        }
    }
    calcDimensions() {
        this.middlePos.x = (this.startPos.x + this.endPos.x) / 2;
        this.middlePos.y = (this.startPos.y + this.endPos.y) / 2;
    }
};


class Line extends Shape{
    constructor(ctx) {
        super(ctx);
    }
    drawShape(){
		    this.ctx.beginPath();
            this.ctx.setLineDash(this.lineStyle);
		    this.ctx.moveTo(this.startPos.x, this.startPos.y);
		    this.ctx.lineTo(this.endPos.x, this.endPos.y);
		   
    }
    getCode(){
		if(this.notComplete())return "";
		return '//Line:\nctx.strokeStyle = "'+this.borderColor+'";\n'+
                'ctx.beginPath();\n'+
                'ctx.moveTo('+this.startPos.x+', '+this.startPos.y+');\n'+
                'ctx.lineTo('+this.endPos.x+', '+this.endPos.y+');\n'+
                'ctx.stroke();\n';
    }
    pointDist(point){
		let deltax = this.startPos.x - this.endPos.x;
		let deltay = this.startPos.y - this.endPos.y;
		//inside the surrounding rectangle
		let dist1x = Math.abs(point.x-this.middlePos.x ) - Math.abs(deltax)/2;
		let dist1y = Math.abs(point.y-this.middlePos.y ) - Math.abs(deltay)/2;
		let dist1 = Math.max(dist1x,dist1y);
		//on the line itself (satisfy the line equation)
		let dist2 = Math.abs(deltax * (this.startPos.y - point.y) - 
		    deltay * (this.startPos.x - point.x)) /Math.sqrt(deltax**2+deltay**2);
		return Math.max(dist2,dist1);
	}
    calcDimensions() {
        super.calcDimensions();

        this.mainPoints[0] = (this.startPos);
        this.mainPoints[1] = (this.middlePos);
        this.mainPoints[2] = (this.endPos);
    }
};

class Rectangle extends Shape{
    constructor(ctx) {
        super(ctx);
    }
    drawShape(){
        let dim = this.calcDimensions();
        this.ctx.beginPath();
        this.ctx.setLineDash(this.lineStyle);
        this.ctx.rect(dim.x,dim.y,dim.w,dim.h);
       
    }
    getCode(){
		if(this.notComplete())return "";
		let dim = this.calcDimensions();
		return '//Rectangle:\nctx.strokeStyle = "'+this.borderColor+'";\n'+
		    'ctx.beginPath();\n'+
		    'ctx.rect('+dim.x+','+dim.y+','+dim.w+','+dim.h+');\n'+
		    'ctx.stroke();\n';
    }
    calcDimensions(){
		super.calcDimensions();

        let x = Math.min(this.startPos.x,this.endPos.x);
		let y = Math.min(this.startPos.y,this.endPos.y);
		let w = Math.max(this.startPos.x,this.endPos.x) - x;
		let h = Math.max(this.startPos.y,this.endPos.y) - y;
        
        this.mainPoints[0] = this.startPos;
        this.mainPoints[1] = this.endPos;
        this.mainPoints[2] = {x:x,y:h+y};
        this.mainPoints[3] = {x:w+x,y:y};
        
		return {x,y,w,h};
    }
    pointDist(point){
        if(this.middlePos.x === undefined || this.middlePos.y === undefined)
            this.calcDimensions();
		let distx=0,disty=0;
		distx = Math.abs(point.x-this.middlePos.x ) - Math.abs(this.startPos.x-this.endPos.x)/2;
		disty = Math.abs(point.y-this.middlePos.y ) - Math.abs(this.startPos.y-this.endPos.y)/2;
		return Math.max(distx,disty);
    }
};

class Circle extends Shape{
    constructor(ctx) {
        super(ctx);
    }
    drawShape(){
        let dim = this.calcDimensions();
        this.ctx.beginPath();
        this.ctx.setLineDash(this.lineStyle);
        this.ctx.arc(dim.x, dim.y, dim.r, 0, 2*Math.PI);
       
    }
    getCode(){
        if(this.notComplete())return "";
        let dim = this.calcDimensions();
        return '//Circle:\nctx.strokeStyle = "'+this.borderColor+'";\n'+
            'ctx.beginPath();\n'+
            'ctx.arc('+dim.x+','+dim.y+','+dim.r+', 0, 2*Math.PI);\n'+
            'ctx.stroke();\n';
    }
    calcDimensions(){
		super.calcDimensions();

        let x = this.startPos.x;
        let y = this.startPos.y;
        let r = Math.sqrt((x - this.endPos.x)**2 + (y - this.endPos.y)**2);
        
        this.mainPoints[0] = this.startPos;
        this.mainPoints[1] = {x:x,y:y+r};
        this.mainPoints[2] = {x:x,y:y-r};
        this.mainPoints[3] = {x:x+r,y:y};
        this.mainPoints[4] = {x:x-r,y:y};

        return {x,y,r};
    }
    pointDist(point){
        let dx = this.startPos.x - point.x;
        let dy = this.startPos.y - point.y;
        return Math.sqrt(dx**2 + dy**2) - this.calcDimensions().r;
    }
};

class Brush{
    #points;
    #minPoint;
    #maxPoint;
    #size;
    constructor(ctx){
        this.mainPoints = [];
        this.#minPoint = {x:undefined,y:undefined};
        this.#maxPoint = {x:undefined,y:undefined};
        this.id = undefined;
        this.#points = [];
        this.#size = 1;
        this.ctx = ctx;
        this.borderColor = "#000000";
        this.flag = {selected:false, finished:false};
    }
    set size(value){
        if(value <= 0)
            return;
        this.#size = value;
        if(this.flag.finished)
            this.calcDimensions();
    }
    get size(){
        return this.#size;
    }
    addPoint(point){
        if(this.flag.finished)
            return;
        if(this.#points.length == 0 ||
            point.x != this.#points[this.#points.length - 1].x ||
            point.y != this.#points[this.#points.length - 1].y
            )
            this.#points.push(point);
    }
    draw(){
        for(let i=0,l=this.#points.length;i<l;i++){
            if(this.size > 1){
                const obj = new Circle(this.ctx);
        
                obj.size = 1;
                obj.borderColor = this.borderColor;
                obj.fillColor = this.borderColor;
                obj.flag.fill = true;
                
                obj.startPos.x = this.#points[i].x ;//- this.size/2 +1;
                obj.startPos.y = this.#points[i].y;
                obj.endPos.x = this.#points[i].x + this.size/2 -1;
                obj.endPos.y = this.#points[i].y;
                obj.draw();
            }
            if(i!=0){
                const obj2 = new Line(this.ctx);
                
                obj2.size = this.size;
                obj2.borderColor = this.borderColor;

                obj2.startPos.x = this.#points[i-1].x;
                obj2.startPos.y = this.#points[i-1].y;
                obj2.endPos.x = this.#points[i].x;
                obj2.endPos.y = this.#points[i].y;
                obj2.draw();
            }
        }
        if(this.flag.selected && this.flag.finished)
            this.selected();
    }
    finish(){
        this.flag.finished = true;

        this.calcDimensions();
        
        this.selected();
        
    }
    changePos(dx,dy){
        const points = [this.#maxPoint,this.#minPoint,...this.#points,...this.mainPoints];
        for(const p of points){
            p.x+=dx;
            p.y+=dy;
        }
    }
    calcDimensions(){
        if( this.#minPoint.x === undefined ||
            this.#minPoint.y === undefined ||
            this.#maxPoint.x === undefined ||
            this.#maxPoint.y === undefined 
            ){
                const array = this.#points.slice();//make a copy
        
                array.sort((a,b)=>{return a.x - b.x});
        
                this.#minPoint.x = array[0].x;
                this.#maxPoint.x = array[array.length-1].x;
                
                array.sort((a,b)=>{return a.y - b.y});
        
                this.#minPoint.y = array[0].y;
                this.#maxPoint.y = array[array.length-1].y;
            }
        this.mainPoints[0] = {x:this.#minPoint.x - this.size/2,y:this.#minPoint.y - this.size/2};
        this.mainPoints[1] = {x:this.#maxPoint.x + this.size/2,y:this.#maxPoint.y + this.size/2};
        this.mainPoints[2] = {x:this.#maxPoint.x + this.size/2,y:this.#minPoint.y - this.size/2};
        this.mainPoints[3] = {x:this.#minPoint.x - this.size/2,y:this.#maxPoint.y + this.size/2};
    }
    hover() {
        const dist = 3;
        return (this.pointDist(inputsVal.mousePos.point) <= dist);
    }
    pointDist(point) {
        // let dist = [];
        // for(const p of this.#points){
        //     dist.push({
        //         x:Math.abs(p.x - point.x),
        //         y:Math.abs(p.y - point.y)
        //     });
        // }
        // dist.sort((a, b) => (a.x + a.y) - (b.x + b.y));
        // return Math.sqrt(dist[0].x ** 2 + dist[0].y ** 2);
        const rect = new Rectangle(this.ctx);
        rect.set(this.#minPoint.x,this.#minPoint.y,this.#maxPoint.x,this.#maxPoint.y)
        return (rect.pointDist(point));
    }
    selected() {
        let size = 2;
        const rect = new Rectangle(this.ctx);

        rect.lineStyle = [4,4];
        rect.size = 0.5;
        rect.set(this.#minPoint.x,this.#minPoint.y,this.#maxPoint.x,this.#maxPoint.y,"blue")

        rect.draw();

        rect.lineStyle = [];
        rect.borderColor = "#000000";
        rect.flag.fill = true;

        for(const point of this.mainPoints){
            rect.set(point.x - size, point.y - size, point.x + size, point.y + size);
            rect.draw();
        }
    }
};

function equalPoints(...points){
    let flag = true;
    let p = points[0]
    for (const point of points) {
        flag = (point.x == p.x) && (point.y == p.y);
        if(!flag)
            break;
    }
    return flag;
}