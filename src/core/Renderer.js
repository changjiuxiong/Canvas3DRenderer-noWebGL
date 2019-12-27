import Geometry from "./Geometry.js";
import Mesh from "./Mesh.js";
import {Matrix4} from "../math/Matrix4.js";
import Camera from "../camera/Camera";
import Util from "../util/Util";
import AmbientLight from "../light/AmbientLight";
import DirectionalLight from "../light/DirectionalLight";
import {Vector3} from "../math/Vector3";
import Composer from "../composer/Composer";
import ComposerOthers from "../composer/ComposerOthers";
import ComposerScheme from "../composer/ComposerScheme";

// import md5 from 'js-md5';

class Renderer {
    constructor(param) {
        var that = this;
        param = param || {};
        this.useShadow = param.useShadow == undefined ? true : param.useShadow;
        this.useSkyBox = param.useSkyBox == undefined ? false : param.useSkyBox;
        this.skyBox = param.skyBox || [];
        this.useScheme = param.useScheme;
        this.bufferList = [];

        // this.programList = [];
        this.programList = {};

        this.curCameraPosition = null;
        this.renderList = {
            opacityList:[],
            transparentList:[]
        };

        var canvas = document.getElementById('webgl');
        var gl = this.gl = canvas.getContext('webgl');
        // var gl = this.gl = Util.getWebGLContext(canvas);
        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }


        this.shadowBufferSize = Math.pow(2, 12);
        // Vertex shader program for generating a shadow map
        var SHADOW_VSHADER_SOURCE =
            'precision highp int;\n' +
            'precision highp float;\n' +
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_MvMatrix;\n' +
            'uniform mat4 u_PMatrix;\n' +
            'void main() {\n' +
            '  gl_Position = u_PMatrix * u_MvMatrix * a_Position;\n' +
            '}\n';

        // Fragment shader program for generating a shadow map
        var SHADOW_FSHADER_SOURCE =
            'precision highp int;\n' +
            'precision highp float;\n' +
            'void main() {\n' +
            '  const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);\n' +
            '  const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);\n' +
            '  vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);\n' + // Calculate the value stored into each byte
            '  rgbaDepth -= rgbaDepth.gbaa * bitMask;\n' + // Cut off the value which do not fit in 8 bits
            '  gl_FragColor = rgbaDepth;\n' +
            // '  gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0);\n' + // Write the z-value in R

            '}\n';

        var shadowProgram = this.shadowProgram = Util.createProgram(gl, SHADOW_VSHADER_SOURCE, SHADOW_FSHADER_SOURCE);

        var shadow_fbo = this.shadow_fbo = this.initFramebufferObject(gl, this.shadowBufferSize);
        if (!shadow_fbo) {
            console.log('Failed to initialize shadow_fbo');
            return;
        }

        var composer = new Composer();
        var composerProgram = this.composerProgram = Util.createProgram(gl, composer.vertexShader, composer.fragmentShader);

        var composerOther = new ComposerOthers();
        var composerOtherProgram = this.composerOtherProgram = Util.createProgram(gl, composerOther.vertexShader, composerOther.fragmentShader);

        var composerScheme = new ComposerScheme();
        var composerSchemeProgram = this.composerSchemeProgram = Util.createProgram(gl, composerScheme.vertexShader, composerScheme.fragmentShader);

        var scheme_fbo = this.scheme_fbo = this.initFramebufferObject(gl, 600);
        if (!scheme_fbo) {
            console.log('Failed to initialize scheme_fbo');
            return;
        }

        //-----------------------------skyBox

        var SKY_VSHADER =
            'attribute vec4 a_position;\n' +
            'varying vec4 v_position;\n' +
            'void main() {\n' +
            '  v_position = a_position;\n' +
            '  gl_Position = a_position;\n' +
            '  gl_Position.z = 0.99;\n' +

            '}\n';

        var SKY_FSHADER =
            'precision mediump float;\n' +
            'uniform samplerCube u_skybox;\n' +
            'uniform mat4 u_viewDirectionProjectionInverse;\n' +
            'varying vec4 v_position;\n' +
            'void main() {\n' +
            '  vec4 t = u_viewDirectionProjectionInverse * v_position;\n' +
            '  gl_FragColor = textureCube(u_skybox, normalize(t.xyz / t.w));\n' +
            '}\n';

        this.sky_loadCount = 0;

        that.sky_texture = gl.createTexture();

        gl.activeTexture(gl.TEXTURE8);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, that.sky_texture);

        var faceInfos = [
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url:that.skyBox[0],
                // url: './skyBox/sky1/pos-x.jpg'
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url:that.skyBox[1],
                // url: './skyBox/sky1/neg-x.jpg'
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url:that.skyBox[2],
                // url: './skyBox/sky1/pos-y.jpg'
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url:that.skyBox[3],
                // url: './skyBox/sky1/neg-y.jpg'
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url:that.skyBox[4],
                // url: './skyBox/sky1/pos-z.jpg'
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url:that.skyBox[5],
                // url: './skyBox/sky1/neg-z.jpg'
            },
        ];

        if(that.useSkyBox){
            faceInfos.forEach((faceInfo) => {
                const {target, url} = faceInfo;

                const level = 0;
                const internalFormat = gl.RGBA;
                const format = gl.RGBA;
                const type = gl.UNSIGNED_BYTE;

                // Asynchronously load an image
                const image = new Image();
                image.src = url;
                image.addEventListener('load', function() {
                    // Now that the image has loaded make copy it to the texture.
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, that.sky_texture);
                    gl.texImage2D(target, level, internalFormat, format, type, image);
                    // gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    that.sky_loadCount ++;

                });
            });
        }

        var skyProgram = this.skyProgram = Util.createProgram(gl, SKY_VSHADER, SKY_FSHADER);



        //-----------------------
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

    }

    initFramebufferObject(gl, size) {
        var framebuffer, texture, depthBuffer;

        // Define the error handling function
        var error = function() {
            if (framebuffer) gl.deleteFramebuffer(framebuffer);
            if (texture) gl.deleteTexture(texture);
            if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
            return null;
        }

        // Create a framebuffer object (FBO)
        framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            console.log('Failed to create frame buffer object');
            return error();
        }

        // Create a texture object and set its size and parameters
        texture = gl.createTexture(); // Create a texture object
        if (!texture) {
            console.log('Failed to create texture object');
            return error();
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);


        // Create a renderbuffer object and Set its size and parameters
        depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
        if (!depthBuffer) {
            console.log('Failed to create renderbuffer object');
            return error();
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);

        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        // Check if FBO is configured correctly
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
            return error();
        }

        framebuffer.texture = texture; // keep the required object

        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return framebuffer;
    }

    getProgramByVF(v, f){
        var that = this;
        var gl = that.gl;

        var vertexShader = this.vshader = Util.loadShader(gl, gl.VERTEX_SHADER, v);
        var fragmentShader = this.fshader = Util.loadShader(gl, gl.FRAGMENT_SHADER, f);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        var program = gl.createProgram();
        if (!program) {
            return null;
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            var error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }

        return program;
    }

    setProgram(v, f){
        var that = this;
        var gl = that.gl;

        // if (!Util.initShaders(gl, v, f)) {
        //     console.log('Failed to intialize shaders.');
        //     return;
        // }

        var md5vf = (v+f);
        var prog = that.programList[md5vf];
        if(prog){
            gl.useProgram(prog);
            gl.program = prog;
            return;
        }

        var program = that.getProgramByVF(v,f);

        that.programList[md5vf] = program;

        gl.useProgram(program);
        gl.program = program;
    }

    renderDepthOneMesh(mesh, camera, ambientLight, directionalLight){
        var that = this;

        var mesh = mesh || new Mesh();
        var geometry = mesh.geometry;


        var gl = that.gl;

        var bufferShadow = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferShadow);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.buffer, gl.STATIC_DRAW);
        var bufferFSIZE = geometry.buffer.BYTES_PER_ELEMENT;

        var a_Position = gl.getAttribLocation(that.shadowProgram, 'a_Position');
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, bufferFSIZE * 8, bufferFSIZE * 0);
        gl.enableVertexAttribArray(a_Position);


        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);


        var u_MvMatrix = gl.getUniformLocation(that.shadowProgram, 'u_MvMatrix');
        var mvMatrix = mesh.matrixWorld;
        gl.uniformMatrix4fv(u_MvMatrix, false, mvMatrix.elements);

        var ca = that.getCameraLight(directionalLight);

        var u_PMatrix = gl.getUniformLocation(that.shadowProgram, 'u_PMatrix');
        // var u_PMatrixFromLight = ca.VPmatrix;
        gl.uniformMatrix4fv(u_PMatrix, false, ca.VPmatrix.elements);

        gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.deleteBuffer(bufferShadow);
        gl.deleteBuffer(indexBuffer);

    }

    getCameraLight(directionalLight){
        var cameraLight = new COOL.OrthoCamera(-100, 100, -100, 100, 0, 300);
        // var cameraLight = new COOL.Camera(30,1,1,10);
        var caPos = directionalLight.direction;
        caPos = caPos.map(function (item) {
            return item * 100;
        });
        cameraLight.setPosition(caPos);
        cameraLight.setTarget([0,0,0]);

        return cameraLight;
    }

    renderSkyBox(camera){
        var that = this;
        var gl = that.gl;

        if(that.sky_loadCount != 6){
            return;
        }
        gl.useProgram(that.skyProgram);
        gl.viewport(0, 0, 600, 600);

        var program = that.skyProgram;

        var positionLocation = gl.getAttribLocation(program, "a_position");
        var skyboxLocation = gl.getUniformLocation(program, "u_skybox");
        var viewDirectionProjectionInverseLocation = gl.getUniformLocation(program, "u_viewDirectionProjectionInverse");
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var positions = new Float32Array(
            [
                -1, -1,
                1, -1,
                -1,  1,
                -1,  1,
                1, -1,
                1,  1,
            ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(positionLocation);

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        var cameraPositionV3 = new Vector3().fromArray(camera.position).normalize();
        var projectionMatrix = new Matrix4().setPerspective(30, 1, 1, 2000);
        var cameraMatrix = new Matrix4().setLookAt(cameraPositionV3.x, cameraPositionV3.y, cameraPositionV3.z, 0, 0, 0, 0, 1, 0);
        // var viewMatrix = cameraMatrix.invert();
        var viewMatrix = cameraMatrix;
        var viewDirectionProjectionMatrix = projectionMatrix.multiply(viewMatrix);
        var viewDirectionProjectionInverseMatrix = viewDirectionProjectionMatrix.invert();
        gl.uniformMatrix4fv(viewDirectionProjectionInverseLocation, false, viewDirectionProjectionInverseMatrix.elements);

        gl.uniform1i(skyboxLocation, 8);
        gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);

    }

    render(scene, camera){
        var that = this;
        that.curCameraPosition = camera.position;

        var renderList = that.sortRenderList(scene);
        var useScheme = that.useScheme;

        var gl = that.gl;
        gl.enable(gl.DEPTH_TEST);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if(that.useSkyBox){
            this.renderSkyBox(camera);
        }

        var ambientLight = null;
        var directionalLight = null;

        for(var i in scene.lights){
            if(scene.lights[i].type == 'DirectionalLight'){
                directionalLight = scene.lights[i];
            }else if(scene.lights[i].type == 'AmbientLight'){
                ambientLight = scene.lights[i];
            }
        }

        that.useShadow = directionalLight ? that.useShadow : false;

        ambientLight = ambientLight || new AmbientLight({intensity:0});
        directionalLight = directionalLight || new DirectionalLight({intensity:0});

        if(that.useShadow){
            gl.useProgram(that.shadowProgram);
            gl.bindFramebuffer(gl.FRAMEBUFFER, that.shadow_fbo);
            gl.viewport(0, 0, this.shadowBufferSize, this.shadowBufferSize);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable (gl.BLEND);
            for(var i in renderList){
                this.renderDepthOneMesh(renderList[i], camera, ambientLight, directionalLight);
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, 600, 600);
        gl.enable (gl.BLEND);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(var i in renderList){
            this.renderOneMesh(renderList[i], camera, ambientLight, directionalLight);
        }

        //scheme
        if(useScheme) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, that.scheme_fbo);
            gl.viewport(0, 0, 600, 600);
            gl.disable(gl.BLEND);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            for (var i in renderList) {
                if (renderList[i].effect) {
                    useScheme = true;
                    this.renderSchemeMesh(renderList[i], camera, ambientLight, directionalLight);
                } else {
                    this.renderOtherMesh(renderList[i], camera, ambientLight, directionalLight);
                }

            }
        }

        //composer
        if(useScheme){
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, 600, 600);
            gl.enable (gl.BLEND);
            this.renderComposer();
        }

    }

    renderComposer(){
        var that = this;
        var gl = that.gl;

        gl.useProgram(that.composerProgram);
        gl.viewport(0, 0, 600, 600);

        var program = that.composerProgram;

        var a_Position = gl.getAttribLocation(program, "a_Position");
        var a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");

        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        var positions = new Float32Array(
            [
                -1, -1, 0,0,
                1, -1,  1,0,
                -1,  1, 0,1,
                -1,  1, 0,1,
                1, -1,  1,0,
                1,  1,  1,1
            ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        var bufferFSIZE = positions.BYTES_PER_ELEMENT;

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, bufferFSIZE*4, bufferFSIZE*0);
        gl.enableVertexAttribArray(a_Position);

        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, bufferFSIZE*4, bufferFSIZE*2);
        gl.enableVertexAttribArray(a_TexCoord);

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, that.scheme_fbo.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, COOL.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, COOL.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, COOL.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, COOL.CLAMP_TO_EDGE);
        var tDiffuse = gl.getUniformLocation(program, "tDiffuse");
        gl.uniform1i(tDiffuse, 5);
        gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    }

    renderOtherMesh(mesh, camera, ambientLight, directionalLight){
        var that = this;

        var mesh = mesh || new Mesh();
        var geometry = mesh.geometry;
        var material = mesh.material;
        var map = material.map;
        var color = material.color;

        var gl = that.gl;

        gl.useProgram(that.composerOtherProgram);

        var bufferMesh = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMesh);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.buffer, gl.STATIC_DRAW);
        var bufferFSIZE = geometry.buffer.BYTES_PER_ELEMENT;

        var a_Position = gl.getAttribLocation(that.composerOtherProgram, 'a_Position');
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, bufferFSIZE * 8, bufferFSIZE * 0);
        gl.enableVertexAttribArray(a_Position);

        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        var u_MvMatrix = gl.getUniformLocation(that.composerOtherProgram, 'u_MvMatrix');
        var mvMatrix = mesh.matrixWorld;
        gl.uniformMatrix4fv(u_MvMatrix, false, mvMatrix.elements);

        var u_PMatrix = gl.getUniformLocation(that.composerOtherProgram, 'u_PMatrix');
        var PMatrix = camera.VPmatrix;
        gl.uniformMatrix4fv(u_PMatrix, false, PMatrix.elements);

        var model = material.wireframe ? gl.LINE_STRIP : gl.TRIANGLES;
        gl.drawElements(model, geometry.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.deleteBuffer(bufferMesh);
        gl.deleteBuffer(indexBuffer);

    }

    renderSchemeMesh(mesh, camera, ambientLight, directionalLight){
        var that = this;

        var mesh = mesh || new Mesh();
        var geometry = mesh.geometry;
        var material = mesh.material;
        var map = material.map;
        var color = material.color;

        var gl = that.gl;

        gl.useProgram(that.composerSchemeProgram);

        var bufferMesh = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMesh);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.buffer, gl.STATIC_DRAW);
        var bufferFSIZE = geometry.buffer.BYTES_PER_ELEMENT;

        var a_Position = gl.getAttribLocation(that.composerSchemeProgram, 'a_Position');
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, bufferFSIZE * 8, bufferFSIZE * 0);
        gl.enableVertexAttribArray(a_Position);

        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        var u_MvMatrix = gl.getUniformLocation(that.composerSchemeProgram, 'u_MvMatrix');
        var mvMatrix = mesh.matrixWorld;
        gl.uniformMatrix4fv(u_MvMatrix, false, mvMatrix.elements);

        var u_PMatrix = gl.getUniformLocation(that.composerSchemeProgram, 'u_PMatrix');
        var PMatrix = camera.VPmatrix;
        gl.uniformMatrix4fv(u_PMatrix, false, PMatrix.elements);

        var model = material.wireframe ? gl.LINE_STRIP : gl.TRIANGLES;
        gl.drawElements(model, geometry.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.deleteBuffer(bufferMesh);
        gl.deleteBuffer(indexBuffer);

    }

    renderOneMesh(mesh, camera, ambientLight, directionalLight){
        var that = this;

        var mesh = mesh || new Mesh();
        var geometry = mesh.geometry;
        var material = mesh.material;
        var map = material.map;
        var envMap = material.envMap;
        var color = material.color;

        var v = material.vshaderSource;
        var f = material.fshaderSource;

        var vDef = '';
        var fDef = '';
        if(material.type == 'MeshLambertMaterial'){
            fDef += '#define USE_AmbientLight\n';
            fDef += '#define USE_DirectionalLight\n';

        }else if(material.type == 'MeshStandardMaterial'){

            fDef += '#define USE_AmbientLight\n';

            vDef += '#define USE_SColor\n';

            fDef += '#define USE_DirectionalLight\n';
            fDef += '#define USE_SColor\n';


        }

        if(map && map.image && map.image.width  && map.image.height){
            fDef += '#define USE_Map\n';
        }

        if(envMap && envMap.imgReady){
            vDef += '#define USE_envMap\n';
            fDef += '#define USE_envMap\n';
        }

        if(that.useShadow){
            vDef += '#define USE_Shadow\n';
            fDef += '#define USE_Shadow\n';
        }

        v = vDef + v;
        f = fDef + f;

        this.setProgram(v,f);

        var gl = that.gl;

        var bufferMesh = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMesh);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.buffer, gl.STATIC_DRAW);
        var bufferFSIZE = geometry.buffer.BYTES_PER_ELEMENT;

        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, bufferFSIZE * 8, bufferFSIZE * 0);
        gl.enableVertexAttribArray(a_Position);

        var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, bufferFSIZE * 8, bufferFSIZE * 3);
        gl.enableVertexAttribArray(a_Normal);

        var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, bufferFSIZE * 8, bufferFSIZE * 6);
        gl.enableVertexAttribArray(a_TexCoord);


        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        var u_Color = gl.getUniformLocation(gl.program, 'u_Color');
        gl.uniform4f(u_Color, color[0], color[1], color[2], color[3]);

        var u_Metalness = gl.getUniformLocation(gl.program, 'u_Metalness');
        gl.uniform1f(u_Metalness, material.metalness);

        if(f.indexOf('#define USE_SColor')!=-1 || f.indexOf('#define USE_envMap')!=-1){
            var u_Camera_Position = gl.getUniformLocation(gl.program, 'u_Camera_Position');
            gl.uniform3f(u_Camera_Position, camera.position[0], camera.position[1], camera.position[2]);
        }

        if(f.indexOf('#define USE_AmbientLight')!=-1){
            var u_AmbientLight_Color = gl.getUniformLocation(gl.program, 'u_AmbientLight_Color');
            var ambientLightColor = ambientLight.color;
            ambientLightColor = ambientLightColor.map(function (item) {
                return ambientLight.intensity * item;
            });
            gl.uniform3f(u_AmbientLight_Color, ambientLightColor[0], ambientLightColor[1], ambientLightColor[2]);
        }

        if(f.indexOf('#define USE_DirectionalLight')!=-1){
            var u_DirectionalLight_Direction = gl.getUniformLocation(gl.program, 'u_DirectionalLight_Direction');
            var directionalLight_Direction = directionalLight.direction;
            gl.uniform3f(u_DirectionalLight_Direction, directionalLight_Direction[0], directionalLight_Direction[1], directionalLight_Direction[2]);

            var u_DirectionalLight_Color = gl.getUniformLocation(gl.program, 'u_DirectionalLight_Color');
            var directionalLight_Color = directionalLight.color;
            directionalLight_Color = directionalLight_Color.map(function (item) {
                return directionalLight.intensity * item;
            });
            gl.uniform3f(u_DirectionalLight_Color, directionalLight_Color[0], directionalLight_Color[1], directionalLight_Color[2]);
        }


        var u_MvMatrix = gl.getUniformLocation(gl.program, 'u_MvMatrix');
        var mvMatrix = mesh.matrixWorld;
        gl.uniformMatrix4fv(u_MvMatrix, false, mvMatrix.elements);

        var u_PMatrix = gl.getUniformLocation(gl.program, 'u_PMatrix');
        var PMatrix = camera.VPmatrix;
        gl.uniformMatrix4fv(u_PMatrix, false, PMatrix.elements);

        if(v.indexOf('#define USE_Shadow')!=-1){
            var ca = that.getCameraLight(directionalLight);
            var u_PMatrixFromLight = gl.getUniformLocation(gl.program, 'u_PMatrixFromLight');
            gl.uniformMatrix4fv(u_PMatrixFromLight, false, ca.VPmatrix.elements);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, that.shadow_fbo.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, COOL.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, COOL.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, COOL.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, COOL.CLAMP_TO_EDGE);
            var u_ShadowMap = gl.getUniformLocation(gl.program, 'u_ShadowMap');
            gl.uniform1i(u_ShadowMap, 0);
        }




        if(f.indexOf('#define USE_Map')!=-1){

            var texture = that.texture = gl.createTexture();   // Create a texture object
            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

            gl.activeTexture(gl.TEXTURE1); //必须在bindTexture之前
            gl.bindTexture(gl.TEXTURE_2D, texture);

            var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
            gl.uniform1i(u_Sampler, 1);

            // Set the texture parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, map.magFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, map.minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, map.wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, map.wrapT);

            // Set the texture image
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, map.image);
        }

        if(f.indexOf('#define USE_envMap')!=-1){

            var texture = that.env_texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

            var images = envMap.images;
            var faceInfos = [
                {
                    target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                    image:images[0],
                },
                {
                    target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                    image:images[1],
                },
                {
                    target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                    image:images[2],
                },
                {
                    target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                    image:images[3],
                },
                {
                    target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                    image:images[4],
                },
                {
                    target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                    image:images[5],
                },
            ];

            faceInfos.forEach((faceInfo) => {
                const {target, image} = faceInfo;

                const level = 0;
                const internalFormat = gl.RGBA;
                const format = gl.RGBA;
                const type = gl.UNSIGNED_BYTE;

                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(target, level, internalFormat, format, type, image);

            });

            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, envMap.magFilter);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, envMap.minFilter);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, envMap.wrapS);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, envMap.wrapT);

            var u_envMap = gl.getUniformLocation(gl.program, "u_envMap");
            gl.uniform1i(u_envMap, 7);


        }

        var model = material.wireframe ? gl.LINE_STRIP : gl.TRIANGLES;
        gl.drawElements(model, geometry.indices.length, gl.UNSIGNED_SHORT, 0);

        if(that.texture){
            gl.deleteTexture(that.texture);
            that.texture = null;
        }
        if(that.env_texture){
            gl.deleteTexture(that.env_texture);
            that.env_texture = null;
        }

        // gl.deleteBuffer(bufferMesh);
        that.addBuffer(bufferMesh);
        gl.deleteBuffer(indexBuffer);

        gl.deleteShader(that.vshader);
        gl.deleteShader(that.fshader);
        // gl.deleteProgram(gl.program);

    }

    addBuffer(buffer){
        //这个buffer不能立即删除，删了下一帧没深度图，未解之谜
        this.bufferList.push(buffer);
        if(this.bufferList.length > 1){
            var bb = this.bufferList.shift();
            this.gl.deleteBuffer(bb);
        }
    }

    setSkyBox(skyBox){
        var that = this;
        that.skyBox = skyBox;
        that.useSkyBox = true;
    }

    getAllObjList(obj, allObjList){
        var that = this;
        for(var i in obj.children){
            if(obj.children[i].geometry){
                allObjList.push(obj.children[i]);
            }
            that.getAllObjList(obj.children[i],allObjList);
        }
        return allObjList;
    }

    sortRenderList(scene){
        var that = this;

        var allObjList = that.getAllObjList(scene ,[]);

        for(var i in allObjList){
            var pa = allObjList[i].getWorldPosition();
            var pc = new Vector3().fromArray(that.curCameraPosition);
            var da = pc.distanceTo(pa);
            allObjList[i].distanceToCamera = da;
        }
        var allObjSortedList = allObjList.sort(that.sortFun);
        // var opacityList = [];
        // var transparentList = [];
        //
        // for(var i in allObjSortedList){
        //     if(allObjSortedList[i].material.transparent){
        //         transparentList.push(allObjSortedList[i]);
        //     }else {
        //         opacityList.push(allObjSortedList[i]);
        //     }
        // }
        //
        // that.renderList = {
        //     opacityList: opacityList,
        //     transparentList: transparentList
        // };

        return allObjSortedList;
    }

    sortFun(a, b){
        return b.distanceToCamera - a.distanceToCamera;
    }

}

export default Renderer;
