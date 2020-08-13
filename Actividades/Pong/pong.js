class barra {

    constructor(x, y, widht, height, speed=1) {
        this.x = x;
        this.y = y;
        this.widht = widht;
        this.height = height;
        this.speed = speed;
    }

    moveUp () {
        this.y -= this.speed;
    }
    moveDown (){
        this.y += this.speed;
    }
    draw(context){
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(up, down, left, right){

    }
}

class pelota {
    constructor(x, y, radio, speed=1) {
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.speed = speed;

        this.up = true;
        this.right = true;
    }

    draw(context){
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        context.fill();
    }

    update(up, down, left, right){
        if(this.up)
            this.y -= this.speed;
        else 
            this.y += this.speed;

        if(this.right)
            this.x += this.speed;
        else 
            this.x += this.speed;

        if ((this.y - this.radio) <= up){
            this.up = false;
        if((this.y + this.radio) >= down)
            this.up = true;

        if((this.x + this.radio) >= right)
            this.right = false;
        if((this.x - this.radio) <= left)
            this.right = true;
        }
    }
}

function update(canvas,context, objects)
{
    requestAnimationFrame(()=>update(canvas, context, objects));

    context.clearRect(0,0, canvas.width, canvas.height);
    
    objects.forEach(object =>{
        object.draw(context);
        object.update(0, canvas.width, 0, canvas.height);
    });
}

function main() {

    const canvas = document.getElementById("pongCanvas");
    const context = canvas.getContext("2d");

    let barraIzq = new barra(10, 120, 20 , 60);
    let barraDer = new barra(570, 120, 20 , 60);
    let bola = new pelota(canvas.width/2, canvas.height/2, 10);

    let gameObjects = [];
    gameObjects.push(barraIzq, barraDer, bola);
    
    update(canvas, context, gameObjects);
}