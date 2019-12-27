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

        //-----------------------
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

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

    render(scene, camera){
        var that = this;
        that.curCameraPosition = camera.position;

        var renderList = that.sortRenderList(scene);

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

        ambientLight = ambientLight || new AmbientLight({intensity:0});
        directionalLight = directionalLight || new DirectionalLight({intensity:0});

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, 600, 600);
        gl.enable (gl.BLEND);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for(var i in renderList){
            this.renderOneMesh(renderList[i], camera, ambientLight, directionalLight);
        }

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
