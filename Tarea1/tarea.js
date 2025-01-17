let mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 10000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
let vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +

    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +

    "    varying vec4 vColor;\n" +

    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor * 0.8;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
let fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-colored cube
function createCube(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Front face
       -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
       -1.0,  1.0,  1.0,

       // Back face
       -1.0, -1.0, -1.0,
       -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

       // Top face
       -1.0,  1.0, -1.0,
       -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

       // Bottom face
       -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
       -1.0, -1.0,  1.0,

       // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

       // Left face
       -1.0, -1.0, -1.0,
       -1.0, -1.0,  1.0,
       -1.0,  1.0,  1.0,
       -1.0,  1.0, -1.0
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0]  // Left face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 4; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    let cubeIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
    
    let cube = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:36,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return cube;
}

function createShader(gl, str, type)
{
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i< objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });

    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}

// Create the vertex, color and index data for a multi-colored cube
function createPP(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
      // Base
       0.0, 1.0, 0.0, //0
       0.5, 0.0, 0.0, //1
       -0.5, 0.0, 0.0, //2 
       0.5, 0.5, 0.0, //3
       -0.5, 0.5, 0.0, //4

       //1era Cara
       0.0, 1.0, 0.0, //5
       0.5, 0.5, 0.0, //6
       0.0 , 0.5 , -1.0, //7

       //2da Cara
       0.5, 0.5, 0.0, //8
       0.5, 0.0, 0.0, //9
       0.0 , 0.5 , -1.0, //10

       //3ra Cara
       0.5, 0.0, 0.0, //11
       -0.5, 0.0, 0.0, //12
       0.0 , 0.5 , -1.0, //13

       //4ta Cara
       0.5, 0.0, 0.0, //14
       -0.5, 0.5, 0.0, //15
       0.0 , 0.5 , -1.0, //16
       
       //5ta Cara
       0.0, 1.0, 0.0, //17
       -0.5, 0.5, 0.0, //18
       0.0 , 0.5 , -1.0 //19


       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 1.0, 1.0],  // Base
        [1.0, 0.0, 1.0, 1.0],  // Base
        [1.0, 0.0, 1.0, 1.0],  // Base
        [1.0, 0.0, 0.0, 1.0], // 1
        [0.0, 1.0, 0.0, 1.0], // 2
        [0.0, 0.0, 1.0, 1.0], // 3
        [1.0, 1.0, 0.0, 1.0], // 4
        [0.0, 0.0, 0.0, 1.0]  // 5
        
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        if(faceColors.length ==5){
            for (let j=0; j < 5; j++)
                vertexColors.push(...color);
        }
        else{
            for (let j=0; j < 3; j++)
                vertexColors.push(...color);
        }
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let ppIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ppIndexBuffer);

    let ppIndices = [
        0, 1, 2,    0, 1, 3,     0, 2, 4,  //Base
        5, 6, 7, // 1era Cara
        8, 9, 10, // 2da Cara
        11, 12, 13, // 3ra  Cara
        14, 15, 16, // 4ta  Cara
        17, 18, 19 // 5ta  Cara
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ppIndices), gl.STATIC_DRAW);
    
    let pp = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:ppIndexBuffer,
            vertSize:3, nVerts: verts.length, colorSize:4, nColors: faceColors.length, nIndices: ppIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(pp.modelViewMatrix, pp.modelViewMatrix, translation);

    pp.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pp;
}


function createDodecahedron(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //Base
        -1.3, 0.0, -0.5,    // 0
        -0.8, 0.8, -0.8,    // 1
        0.0, 0.5, -1.3,     // 2
        0.0, -0.5, -1.3,    // 3
        -0.8, -0.8, -0.8,   // 4

        //First face
        -0.8, 0.8, 0.8,     // 5
        -0.5, 1.3, 0.0,     // 6
        -0.8, 0.8, -0.8,    // 7
        -1.3, 0.0, -0.5,    // 8
        -1.3, 0.0, 0.5,     // 9

        //Second face
        0.5, 1.3, 0.0,      // 10
        0.8, 0.8, -0.8,     // 11
        0.0, 0.5, -1.3,     // 12
        -0.8, 0.8, -0.8,    // 13
        -0.5, 1.3, 0.0,     // 14

        //Third face
        1.3, 0.0, -0.5,     // 15
        0.8, -0.8, -0.8,    // 16
        0.0, -0.5, -1.3,    // 17
        0.0, 0.5, -1.3,     // 18
        0.8, 0.8, -0.8,     // 19

        //Fourth face
        0.5, -1.3, 0.0,     // 20
        -0.5, -1.3, 0.0,    // 21
        -0.8, -0.8, -0.8,   // 22
        0.0, -0.5, -1.3,    // 23
        0.8, -0.8, -0.8,    // 24

        //Fifth face
        -0.8, -0.8, 0.8,    // 25
        -1.3, 0.0, 0.5,     // 26
        -1.3, 0.0, -0.5,    // 27
        -0.8, -0.8, -0.8,   // 28
        -0.5, -1.3, 0.0,    // 29 

        //Sixth face
        0.8, 0.8, 0.8,      // 30
        1.3, 0.0, 0.5,      // 31
        1.3, 0.0, -0.5,     // 32
        0.8, 0.8, -0.8,     // 33
        0.5, 1.3, 0.0,      // 34

        //Seventh face
        0.0, 0.5, 1.3,      // 35
        0.8, 0.8, 0.8,      // 36
        0.5, 1.3, 0.0,      // 37
        -0.5, 1.3, 0.0,     // 38
        -0.8, 0.8, 0.8,     // 39

        //Eighth face
        0.8, -0.8, 0.8,     // 40
        1.3, 0.0, 0.5,      // 41
        1.3, 0.0, -0.5,     // 42
        0.8, -0.8, -0.8,    // 43
        0.5, -1.3, 0.0,     // 44

        //Nineth face
        0.0, -0.5, 1.3,         // 45
        0.8, -0.8, 0.8,         // 46
        0.5, -1.3, 0.0,         // 47
        -0.5, -1.3, 0.0,        // 48
        -0.8, -0.8, 0.8,        // 49

        //10nth face
        0.0, 0.5, 1.3,      // 50
        0.0, -0.5, 1.3,         // 51
        -0.8, -0.8, 0.8,        // 52
        -1.3, 0.0, 0.5,         // 53
        -0.8, 0.8, 0.8,         // 54

        //11nth face
        0.0, 0.5, 1.3,      // 55
        0.8, 0.8, 0.8,      // 56
        1.3, 0.0, 0.5,      // 57
        0.8, -0.8, 0.8,         // 58
        0.0, -0.5, 1.3,         // 59
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    /* let faceColors = [
        
    ]; */

    let faceColors = [
        //R    G    B    T
        [1.0, 0.0, 0.0, 1.0],           //1st face
        [0.0, 1.0, 0.0, 1.0],           //2nd facew
        [0.0, 0.0, 1.0, 1.0],           //3rd face
        [1.0, 1.0, 0.0, 1.0],           //4th face
        [1.0, 0.0, 1.0, 1.0],           //5th face
        [0.0, 1.0, 1.0, 1.0],           //6th face
        [1.0, 1.0, 1.0, 1.0],           //7th face  
        [0.0, 0.0, 0.0, 1.0],           //8th face
        [0.4, 0.0, 0.0, 1.0],           //9th face
        [0.5691, 0.9333, 0.92, 1.0],    //10th face
        [0.749, 0.572, 0.160, 1.0],     //11th face
        [0.670, 0.019, 0.949, 1.0]      //12th face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    faceColors.forEach(color => {
        for (let j = 0; j < 5; j++) //Color cada 5 VERTICES
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    let dodecahedronIndices = [
        0, 1, 2,        0, 4, 3,        0, 3, 2,            // Base triangles
        5, 6, 7,        5, 9, 8,        5, 8, 7,            // Lower middle, upper right triangles
        10, 11, 12,     10, 14, 13,     10, 13, 12,         // Lower middle, lower right triangles
        15, 16, 17,     15, 19, 18,     15, 18, 17,         // Lower middle, front triangles
        20, 21, 22,     20, 24, 23,     20, 23, 22,         // Lower middle, lower left triangles
        25, 26, 27,     25, 29, 28,     25, 28, 27,         // Lower middle, upper left triangles
        30, 31, 32,     30, 34, 33,     30, 33, 32,         // Upper middle, lower right triangles
        35, 36, 37,     35, 39, 38,     35, 38, 37,         // Upper middle, upper right triangles 
        40, 41, 42,     40, 44, 43,     40, 43, 42,         // Upper middle, lower left triangles
        45, 46, 47,     45, 49, 48,     45, 48, 47,         // Upper middle, upper left triangles 
        50, 51, 52,     50, 54, 53,     50, 53, 52,         // Upper middle, back triangles
        55, 56, 57,     55, 59, 58,     55, 58, 57,         // Upper triangles
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);

    let dodecahedron = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: dodecahedronIndexBuffer,
        vertSize: 3, nVerts: verts.length, colorSize:4, nColors: faceColors.length, nIndices: dodecahedronIndices.length,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return dodecahedron;
}


function createDiamond(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //Comienzan áreas positivas
        // X,    Z,     Y
        //Primera cara
        -1.0, 0.0, 1.0, 	//  A   0
        -1.0, 0.0, -1.0,    //  B   1
        0.0, 1.25, 0.0,     //  P+  2

        //Segunda cara
        -1.0, 0.0, -1.0,    //  B   3
        1.0, 0.0, -1.0,     //  C   4
        0.0, 1.25, 0.0,     //  P+  5

        //Tercer cara
        1.0, 0.0, -1.0,     //  C   6
        1.0, 0.0, 1.0,      //  D   7
        0.0, 1.25, 0.0,     //  P+  8

        //Cuarta cara
        1.0, 0.0, 1.0,      //  A   9
        -1.0, 0.0, 1.0,     //  D   10
        0.0, 1.25, 0.0,     //  P+  11


        //  A partir de aquí se pintan las caras negativas

        //Left side
        -1.0, 0.0, 1.0, 	//  A   12
        -1.0, 0.0, -1.0,    //  B   13
        0.0, -1.25, 0.0,    //  P-  14

        //Back side
        -1.0, 0.0, -1.0,    //  B   15
        1.0, 0.0, -1.0,     //  C   16
        0.0, -1.25, 0.0,    //  P-  17

        //Right side
        1.0, 0.0, -1.0,     //  C   18
        1.0, 0.0, 1.0,      //  D   19
        0.0, -1.25, 0.0,    //  P-  20

        //Front side
        1.0, 0.0, 1.0,      //  A   21
        -1.0, 0.0, 1.0,     //  D   22
        0.0, -1.25, 0.0,    //  P-  23
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        //R    G    B    T
        [1.0, 0.0, 0.0, 1.0],       // Primera
        [0.0, 1.0, 0.0, 1.0],       // Segunda
        [0.0, 0.0, 1.0, 1.0],       // Tercera
        [1.0, 1.0, 0.0, 1.0],       // Cuarta
        [1.0, 0.0, 1.0, 1.0],       // Quinta
        [0.0, 1.0, 1.0, 1.0],       // Sexta
        [1.0, 1.0, 1.0, 1.0],       // Séptima  
        [0.0, 0.0, 0.0, 1.0]        //Octavo
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];

    faceColors.forEach(color => {
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let diamondIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diamondIndexBuffer);

    let diamondIndices = [
        0, 1, 2,        //Primer cara
        3, 4, 5,        //Segunda cara
        6, 7, 8,        //Tercera cara
        9, 10, 11,      //Cuarta cara
        12, 13, 14,     //Quinta cara
        15, 16, 17,     //Sexta cara
        18, 19, 20,     //Séptima cara
        21, 22, 23      //Octava cara
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(diamondIndices), gl.STATIC_DRAW);

    let diamond = {
        buffer: vertexBuffer, colorBuffer: colorBuffer, indices: diamondIndexBuffer,
        vertSize: 3, nVerts: verts.length, colorSize:4, nColors: faceColors.length, nIndices: diamondIndices.length,
        primtype: gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime: Date.now()
    };

    mat4.translate(diamond.modelViewMatrix, diamond.modelViewMatrix, translation);

    let bounceTop = true;
    let bounceBot = false;

    diamond.update = function () {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        if (bounceTop == true) {
            mat4.translate(diamond.modelViewMatrix, diamond.modelViewMatrix, [0, -.025, 0]);
            if (this.modelViewMatrix[13] < -2.89) {
                bounceBot = true;
                bounceTop = false;
            }
        }

        if (bounceBot == true) {
            mat4.translate(diamond.modelViewMatrix, diamond.modelViewMatrix, [0, .025, 0]);
            if (this.modelViewMatrix[13] > 2.89) {
                bounceBot = false;
                bounceTop = true;
            }
        }

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return diamond;
}


