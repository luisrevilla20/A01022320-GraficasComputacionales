# Graficas Computacionales
# Tarea 2. Sistema solar 
# Luis Revilla - A01022320 

_En esta tarea veremos como empezar a usar la libreria de THREE.js para poder crear figuras 3D  como esferas Y anillos y asignarles diferentes características como materiales, texturas, bumps, etc. Al igual que rotar estos objetos alrededor del sol (traslación) y de su propio eje (rotacion)._

## Instrucciones 📋

1. Crea 8 planetas (y plutón), con sus respectivas lunas, el sun, y el cinturón de asteroides.
2. Los astros se pueden crear como esferas.
3. Los planetas y lunas tienen que tener su propia rotación.
4. Las lunas tienen que rotar al rededor de los planetas, y los planetas tienen que rotar al rededor del sol.
5. Dibuja las orbitas de cada planeta.
6. Cada elemento tiene que tener su propio materia, con texturas, normales, y bump maps (de existir).
    1. La mayoría de las texturas las pueden encontrar en: http://planetpixelemporium.com/,  (Enlaces a un sitio externo.)http://www.celestiamotherlode.net/ (Enlaces a un sitio externo.) (Enlaces a un sitio externo.), https://www.solarsystemscope.com/textures/ (Enlaces a un sitio externo.)
7. Investiga cómo funciona el orbit controller de three.js e integralo en la escena.


## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

## Funcionamiento del Código 💻

_A lo largo del codigo "threejsSolarSystem.js" se encuentran las funciones mas importantes que son:_
Funciones | Descripcion
------------ | -------------
Clase de Astro | Clase donde se define el contenido de cada planeta. Este tendrá algunos elementos como una lista de satelites, el cual contendrá las lunas, su textura, el radio del planeta, position, orbit, entre otros elementos.
addAstro() | Funcion que se encarga de agregar los planetas al Sistema Solar.
addOrbit() | Funcion que se encarga de crear un RingGeometry el cual nos servirá para ver la orbita por la cual el planeta hará su traslación.
addSatelite(@params) | Funcion que se encarga de agregar los satelites a cada planeta. El parametro que necesita es un astro que será una luna.
addBump(@params) | Funcion que se encarga de agregar bump a los planetas o satelites. Los parametros que reciben son 2. El primero es el mapUrl al que se le va a a agregar el bumpMapUrl, que es el segundo parametro.
addNormal() | Funcion que se encarga de agregarle la normal al planeta Tierra.

Mira **Despliegue** para conocer como desplegar el proyecto.


### Instalación 🔧

_Esta serie de pasoste permitirán obtener una copia la cual podrás correr y visualizar en tu máquina local_

_Primero tendrás que bajar el repositorio_

```
git clone https://github.com/luisrevilla20/A01022320-GraficasComputacionales.git
```


_Nosotros usaremos el Live Server (extensión con la cual cuenta Visual Studio Code) para poder correr de manera local el proyecto_

```
Buscar la extensión "Live Server"
Reinicia Visual Studio Code
```

## Despliegue 📦

_Para poder desplegar el proyecto simplemente usa ALT + L / ALT + O o bien da click en la parte inferior "Go Live" en el archivo que deseas corre_

## Construido con 🛠️

_Usamos las siguientes librerías para desarrollar los diferentes codigos_

* [WebGL](https://developer.mozilla.org/es/docs/Web/API/WebGL_API) - Documentación de WebGL
* [Three.js](https://threejs.org/docs/) -Documentación de Three.js

⌨️ por [Luis Revilla](https://github.com/luisrevilla20) en colaboración con [Isaac Harari](https://github.com/isaachm11)😊