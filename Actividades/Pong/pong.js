let keysDown = {};
var p1Score, p2Score;
var scoreText = p1Score + "|" + p2Score ;

window.addEventListener("keydown", function (event) {
    keysDown[event.key] = true;
});

window.addEventListener("keyup", function (event) {
    delete keysDown[event.key];
});

class barra {
    constructor(x, y, width, height, keyCodeUp="ArrowUp", keyCodeDown="ArrowDown", speed = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.up = false;
        this.down = false;
        this.keyCodeUp = keyCodeUp;
        this.keyCodeDown = keyCodeDown;
    }

    moveUp() {
        if(!(this.y<5)) this.y -= this.speed;
    }

    moveDown() {
        if(!(this.y>235)) this.y += this.speed;
    }

    draw(context) {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        for (var key in keysDown) {
            var value = key;
            if (value == this.keyCodeUp) this.moveUp();
            else if (value == this.keyCodeDown) this.moveDown();
        }
    }
}


class pelota {
    constructor(x, y, radio, speed = 2) {
        this.x = x;
        this.y = y;
        this.radio = radio;
        this.speed = speed;
        this.up = true;
        this.right = true;
        this.left = false;  
    }

    draw(context) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }

    update(up, down, left, right, barras) {
        // La pelota va para arriba
        if (this.up)
            this.y -= this.speed;
        // La pelota va para abajo
        else
            this.y += this.speed;

        // La pelota va para la derecha
        if (this.right)
            this.x += this.speed;

        // La pelota va para la izquierda
        else
            this.x -= this.speed;

        // Si llega al límite del borde superior
        if ((this.y - this.radio) <= up)
            this.up = false;

        // Si llega al límite del borde inferior
        if ((this.y + this.radio) >= down)
            this.up = true;

        // Si llega al límite del borde derecho
        if ((this.x + this.radio) >= right)
            this.right = false;

        // Si llega al límite del borde izquierdo
        if ((this.x - this.radio) <= left)
            this.right = true;

        if(right)
        {
            this.x = 600/2;
            this.y = 300/2;
            p2Score++;
            right = false;
        }

        if(left)
        {
            this.x = 600/2;
            this.y = 300/2;
            p1Score++;
            left = false;
        }


        barras.forEach(barra => {
            // Si la pelota pega con la barra izquierda
            if (((this.x-this.radio) == (barra.x+barra.width)) && (this.y > barra.y) && (this.y < barra.y+barra.height))
                this.right = true;
            // Si la pelota pega con la barra derecha
            else if (((this.x+this.radio) == (barra.x)) && (this.y > barra.y) && (this.y < barra.y+barra.height))
                // console.log("PEGO");
                this.right = false;
        });
    }
}

function update(canvas, context, barras, bola) {
    requestAnimationFrame(() => update(canvas, context, barras, bola));

    context.clearRect(0, 0, canvas.width, canvas.height);
    barras.forEach(barra => {
        barra.draw(context);
        barra.update();
    });

    bola.draw(context)
    bola.update(0, canvas.height, 0, canvas.width, barras);
}

function main() {
    p1Score = p2Score = 0;
    const canvas = document.getElementById("pongCanvas");
    const context = canvas.getContext("2d");
    console.log(scoreText + "AAAAAAAAAAAAAAAAAA");
    
  /*  context.font = "bold 30px Comic Sans MS ";
    context.fillStyle= '199,67,117';
    context.fillText( scoreText , canvas.width/2, canvas.height/2- 100);*/
    

    let barraIzq = new barra(10, 120, 20, 60, keyCodeUp='w',keyCodeDown='s');
    let barraDer = new barra(570, 120, 20, 60);
    let bola = new pelota(canvas.width / 2, canvas.height / 2, 10);

    let barras = [];

    barras.push(barraIzq, barraDer);

    update(canvas, context, barras, bola);
}
