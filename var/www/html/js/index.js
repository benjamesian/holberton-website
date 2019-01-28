'use strict';
const appDefault = {
    animation: false,
}

// failed attempt to fix page not being interactive on ios
/*document.body.onload = function() {
    var btn = document.getElementById('start-btn');
    btn.onclick = function() {
	let startDiv = document.getElementById('start');
	startDiv.style.display = 'none';
	
	var canvas = document.createElement('canvas');
	var current = document.getElementById('start');
	document.body.insertBefore(canvas, current);
	canvas.width = '300';
	canvas.height = '200';
	canvas.style.touchAction = 'none';

	let app = new Application({type: 'draggable-box', animation: false, canvas: canvas});
	app.start();
	
    }
}*/

/*document.addEventListener("DOMContentLoaded", function(event) {
    var app = new Application(appDefault);
    app.start();
});*/

// @Application
function Application(config) {
    const _this = this;
    this.settings = config;

    this.canvas = document.getElementById('canvas');

    this.controller = new Controller();
    this.paused = false;

    //this.displayElements = [];
    this.pointerOut = false;

    this.draggable = null;

    
    this.ctx = null;
    if (this.canvas.getContext) {
	this.ctx = this.canvas.getContext('2d');
    }

    this.controller.pubsub.subscribe('DRAW', 'app', this.onDraw.bind(this));

    switch (this.settings.type) {
    case 'draggable-box':
	//this.addDisplayElement(Button, buttonDefaults);
	//This.Adddisplayelement(Draggablebox, draggableDefaults);
	this.draggable = new DraggableBox(draggableDefaults, this.controller);
	this.button = new Button(buttonDefaults, this.controller);

	this.canvas.onpointerdown  = this.onMouseDown.bind(this);
	this.canvas.onpointerup    = this.onMouseUp.bind(this);
	this.canvas.onpointermove  = this.onMouseMove.bind(this);
	this.canvas.onpointerenter = this.onMouseEnter.bind(this);

	//this.drawChildren();
	this.draggable.draw(this.ctx);
	this.button.draw(this.ctx);
	break;

    /*case 'multi':
	this.canvas.onpointerdown = this.onMouseDown.bind(this);
	this.canvas2 = document.getElementById('canvas2');
	this.button = new Button({
	    id: 'multi-button',
	    color: '#ffcc99',
	    width: 80,
	    height: 35,
	    x: 0,
	    y: 0,
	    clickSignals: [{message: 'DRAW', sourceId: 'app', data: null}, {message: 'SWITCH', sourceId: 'multi-button', data: null}]
	}, this.controller);
	this.boolio = new BoolObject();
	this.controller.pubsub.subscribe('SWITCH', 'multi-button', function(event) { _this.boolio.value = !_this.boolio.value});

	if (this.canvas2.getContext) {
	    this.ctx2 = this.canvas2.getContext('2d');
	}
	this.button.draw(this.ctx);
	break;*/

    default:
	//this.canvas.addEventListener('click', this.onClick.bind(this));
	this.draw();
	break;
    }
}

Application.prototype.onDraw = function(data) {
    switch (this.settings.type) {
    /*case 'multi':
	this.ctx.clearRect(0,  0, this.canvas.width,  this.canvas.height);
	this.ctx2.clearRect(0, 0, this.canvas2.width,  this.canvas2.height);
	this.draggable.draw(this.ctx);
	this.draggable2.draw(this.ctx2);
	break;*/

    default:
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	//this.drawChildren();
	this.button.draw(this.ctx);
	this.draggable.draw(this.ctx);
	break;
    }
}

/*
Application.prototype.addDisplayElement = function(constructFn, config) {
    const el = new constructFn(config, this.controller);
    this.displayElements.push(el);
}

Application.prototype.drawChildren = function(fromIndex = 0) {
    for (let i = fromIndex; i < this.displayElements.length; i++) {
	this.displayElements[i].draw(this.ctx);
    }
}
*/

Application.prototype.setMousePosition = function(event) {
    let position;

    if (event.touches && event.touches.length) { // handle this on init instead lol
	position = {
	    x: event.touches[0].clientX - this.canvas.offsetLeft,
	    y: event.touches[0].clientY - this.canvas.offsetTop
	}
    }
    else {
	position = {
	    x: event.clientX - this.canvas.offsetLeft,
	    y: event.clientY - this.canvas.offsetTop
	}
    }

    if (position.x < 0 || position.x > this.canvas.width) {
	this.pointerOut = true;
    }
    else if (position.y < 0 || position.y > this.canvas.height) {
	this.pointerOut = true;
    }
    else {
	this.pointerOut = false;
    }

    this.mousePosition = position;
}

Application.prototype.onMouseDown = function(event) {
    //console.log('mousedown', event);
    this.setMousePosition(event);

    if (pointInBox(this.mousePosition, this.draggable)) {
	this.draggable.anchorX = this.mousePosition.x - this.draggable.x;
	this.draggable.anchorY = this.mousePosition.y - this.draggable.y;
	this.draggable.clicked = true;
    }
    else if (pointInBox(this.mousePosition, this.button)) {
	this.button.onClick();
    }
}

Application.prototype.onMouseUp = function(event) {
    //console.log('mouseup', event);
    if (this.pointerOut) {
	return;
    }
    
    this.draggable.clicked = false;
}

Application.prototype.onMouseMove = function(event) {
    //console.log('mousemove', event);
    if (!this.draggable.clicked) {
	return;
    }
    this.setMousePosition(event);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draggable.x = this.mousePosition.x - this.draggable.anchorX;
    this.draggable.y = this.mousePosition.y - this.draggable.anchorY;
    this.draggable.draw(this.ctx);
    this.button.draw(this.ctx);
}

Application.prototype.onMouseEnter = function(event) {
    if (this.pointerOut) {
	this.setMousePosition(event);
	//console.log('enter', event);
	this.draggable.x = this.mousePosition.x - this.draggable.width / 2;
	this.draggable.y = this.mousePosition.y - this.draggable.height / 2;

	let _this = this;
	requestAnimationFrame(function(timestamp) {
	    _this.draggable.draw(_this.ctx)
	});
    }
}

Application.prototype.start = function() {
    if (this.settings.animation) {
	requestAnimationFrame(this.gameLoop.bind(this));
    }
    else {
	switch (this.settings.type) {
	case 'draggable-box':
	    break;

	case 'multi':
	    break;
	    
	default:
	    this.draw.call(this)
	    break;
	}
    }
}

Application.prototype.draw = function() {
    const nBoxes = 100;

    const boxWidth = 50;
    const boxHeight = 50;
    for (let i = 0; i < nBoxes; i++) {
	this.ctx.fillStyle = '#'+Math.floor((parseInt('ffffff', 16) + 1)*Math.random()).toString(16);
	this.ctx.fillRect(Math.floor(Math.random()*(this.canvas.width-boxWidth)), Math.random()*(this.canvas.width-boxHeight), boxWidth, boxHeight);
    }
}

Application.prototype.gameLoop = function(timestamp) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#990000';
    
    if (!this.paused) {
	requestAnimationFrame(this.gameLoop.bind(this));
    }
}

Application.prototype.onClick = function(event) {
    if (this.settings.animation) {
	this.paused = !this.paused;
    }
    
    this.gameLoop.call(this);
}

// @Controller
function Controller() {
    /*
     * A _very_ basic controller xD xD xD
     * should also be controlling draw calls / animation requests but o well no time
     */
    this.pubsub = new PubSub();
}

// @BaseObject
function BaseObject(config, controller) {
    let _this = this;
    this.config = config;
    this.controller = controller;

    this.id = config.id;
}

// @DisplayObject
function DisplayObject(config, controller) {
    let _this = this;
    BaseObject.call(this, config, controller);
    
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;

    this.color = config.color;

    this.hidden = false;

    // lacking js oop experience here (don't know how to inherit methods :$)
    controller.pubsub.subscribe('HIDE', config.id, function(data) {
	if (_this.hidden) { return; }
	_this.hidden = true;
	_this.draw = function() {};
	requestAnimationFrame(function(timestamp) {
	    _this.controller.pubsub.publish('DRAW', 'app', null);
	});
    });
    
    controller.pubsub.subscribe('SHOW', config.id, function(data) {
	if (!_this.hidden) { return; }
	_this.hidden = false;
	delete _this.draw;
	requestAnimationFrame(function(timestamp) {
	    _this.controller.pubsub.publish('DRAW', 'app', null);
	});
    });
    
    controller.pubsub.subscribe('TOGGLE', config.id, function(data) {
	// a bit rushed :(
	controller.pubsub.publish(_this.hidden ? 'SHOW' : 'HIDE', _this.config.id, data);
    });
}

const textDefaults = {
    // Base Settings
    id: 'text',

    // Display Settings
    x: 0,
    y: 10,

    // Text Settings
    caption: '',
    fontStyle: '',
    fontWeight: '',
    fontSize: '12px',
    lineHeight: '',
    fontFamily: 'Georgia',
}

// @Text
function Text(config, controller) {
    let _this = this;
    DisplayObject.call(this, config, controller);

    this.caption = config.caption;
    this.font = [config.fontStyle, config.fontWeight, config.fontSize, config.lineHeight, config.fontFamily].join(' ');
}

Text.prototype.draw = function(ctx) {
    ctx.font = this.font;
    ctx.strokeText(this.caption, this.x, this.y);
}

const buttonDefaults = {
    // Base Settings
    id: 'button',

    // Display Settings
    color: '#ffcc99',
    width: 80,
    height: 35,
    x: 0,
    y: 0,
    
    // Button Settings
    toggleMode: true,
    toggledColor: '#ccff99',
    clickSignals: [{message: 'TOGGLE', sourceId: 'draggable', data: null}],
}

// @Button
function Button(config, controller) {
    //let _this = this;
    DisplayObject.call(this, config, controller);

    this.toggled = false;
    this.caption = new Text(Object.assign(textDefaults, {caption: 'howdy'}), controller);

    // setup PubSub
    this.controller.pubsub.subscribe('TOGGLE', this.config.id, this.onClick.bind(this));
}

Button.prototype.onClick = function(event) {
    if (this.config.toggleMode) {
	this.toggled = !this.toggled;
	this.caption.caption = this.toggled ? 'hello' : 'howdy';
	this.controller.pubsub.publish('TOGGLED', this.config.id, {value: this.toggled});
    }
    this.controller.pubsub.publish('CLICK', this.config.id, null);

    let _this = this;
    this.config.clickSignals.forEach(function(signal) {
	_this.controller.pubsub.publish(signal.message, signal.sourceId, signal.data);
    });
}

Button.prototype.draw = function(ctx) {
    ctx.fillStyle = (this.config.toggleMode && this.toggled) ? this.config.toggledColor : this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    this.caption.draw(ctx);
}

const draggableDefaults = {
    // Base settings
    id: 'draggable',

    // Display Settings
    color: '#335445',
    width: 50,
    height: 50,
    x: 10,
    y: 50,
}

// @Draggable
function DraggableBox(config, controller) {
    //let _this = this;
    DisplayObject.call(this, config, controller);
    this.anchorX = 0;
    this.anchorY = 0;
    this.clicked = false;
}

DraggableBox.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
}

// @Helpers
function pointInBox(point, box) {
    const xOk = box.x <= point.x && point.x <= box.x + box.width;
    const yOk = box.y <= point.y && point.y <= box.y + box.height;
    return xOk && yOk;
}

// @PubSub
function PubSub() {
    const _this = this;
    this.listeners = new Map();
}

PubSub.prototype.subscribe = function(message, sourceId, cb) {
    const listener = {sourceId: sourceId, cb: cb}; // avoid shorthand for browser support
    if (this.listeners.has(message)) {
	this.listeners.get(message).push(listener);
    }
    else {
	this.listeners.set(message, [listener]);
    }
    return listener;
}

PubSub.prototype.publish = function(message, sourceId, data) {
    if (this.listeners.has(message)) {
	this.listeners.get(message).forEach(function(listener) {
	    if (listener.sourceId === sourceId) {
		listener.cb(data);
	    }
	});
    }
}

