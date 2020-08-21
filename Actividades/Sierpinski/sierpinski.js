var ctx;
var width;
var height;
var length;
var pline;
var MAX_LEVEL = 8;
var level;

function init() {
	canvas = document.getElementById('MyCanvas');
	ctx = canvas.getContext('2d');
	width = canvas.width;
	height = canvas.height;
	pline = height * 2 / 3;
	length = pline / Math.sin(60 * Math.PI / 180);
}

function draw() {
	init();
	var p1 = new Point(width/2, (height - pline)/2);
	var p2 = new Point((width - length)/2, p1.y + pline);
	var p3 = new Point(p2.x + length, p2.y);
	strokeTriangle(p1, p2, p3);
	level = 1;
	recursiveDraw(p1, p2, p3);
}

function recursiveDraw(p1, p2, p3) {
	if (level >= MAX_LEVEL) {return};
	level++;
	current_length = length / level;
	var q1 = getCenterPoint(p1, p2);
	var q2 = getCenterPoint(p2, p3);
	var q3 = getCenterPoint(p1, p3);
	strokeTriangle(q1, q2, q3);
	recursiveDraw(p1, q1, q3);
	recursiveDraw(q1, p2, q2);
	recursiveDraw(q3, q2, p3);
	level--;
}

function Point(x, y) {
	this.x = x;
	this.y = y;
}

function getCenterPoint(p1, p2) {
	return new Point( (p1.x + p2.x)/2, (p1.y + p2.y)/2 );
}

function strokeTriangle(p1, p2, p3) {
	ctx.save();
	drawTriangle(p1, p2, p3);
	ctx.stroke();
	//ctx.fill();
	ctx.restore();
}

function drawTriangle(p1, p2, p3) {
	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.lineTo(p3.x, p3.y);
	ctx.closePath();
}