
import Mesh from "./Mesh.js";
import Util from "../util/Util";
import AmbientLight from "../light/AmbientLight";
import DirectionalLight from "../light/DirectionalLight";
import {Vector3} from "../math/Vector3";
import {Vector4} from "../math/Vector4";
import {Vector2} from "../math/Vector2";

class Renderer {
    constructor(param) {
        var that = this;
        param = param || {};
        this.bufferList = [];

        this.programList = {};

        this.curCameraPosition = null;
        this.renderList = {
            opacityList:[],
            transparentList:[]
        };

        this.camera = null;

        var canvas = document.getElementById('webgl');
        var gl = this.gl = canvas.getContext('2d');

    }


    render(scene, camera){
        var that = this;
        that.camera = camera;
        that.curCameraPosition = camera.position;

        var renderList = that.sortRenderList(scene);

        var gl = that.gl;

        gl.clearRect(0,0,600,600);

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

        for(var i in renderList){
            this.renderOneMesh(renderList[i], camera, ambientLight, directionalLight);
        }

    }

    renderOneMesh(mesh, camera, ambientLight, directionalLight){
        var that = this;

        var mesh = mesh || new Mesh();
        var geometry = mesh.geometry;
        var indices = geometry.indices;
        var vertices = geometry.vertices;


        var material = mesh.material;
        var map = material.map;
        var color = material.color;

        var ctx = that.gl;

        for(var i=0; i<indices.length; i+=3){
            var point1x = vertices[indices[i]*3];
            var point1y = vertices[indices[i]*3+1];
            var point1z = vertices[indices[i]*3+2];

            var point2x = vertices[indices[i+1]*3];
            var point2y = vertices[indices[i+1]*3+1];
            var point2z = vertices[indices[i+1]*3+2];

            var point3x = vertices[indices[i+2]*3];
            var point3y = vertices[indices[i+2]*3+1];
            var point3z = vertices[indices[i+2]*3+2];

            that.drawTriangle(
                new Vector3().fromArray([point1x,point1y,point1z]),
                new Vector3().fromArray([point2x,point2y,point2z]),
                new Vector3().fromArray([point3x,point3y,point3z]),
                mesh
            );
        }

    }

    v3Tov2(v3, mesh){
        var that = this;

        var vpMatrix = that.camera.VPmatrix.clone();
        var v4 = vpMatrix.concat(mesh.matrixWorld).multiplyVector4(new Vector4(v3.x, v3.y, v3.z, 1));
        var v3GL = new Vector3(v4.x/v4.w, v4.y/v4.w, v4.z/v4.w);
        var v2GL = new Vector2(v3GL.x, v3GL.y);
        var v2 = new Vector2((v2GL.x/2+0.5)*600, (0.5-v2GL.y/2)*600);

        return v2;
    }

    drawTriangle(a,b,c, mesh){
        var that = this;
        var ctx = that.gl;

        var a1 = that.v3Tov2(a, mesh);
        var b1 = that.v3Tov2(b, mesh);
        var c1 = that.v3Tov2(c, mesh);

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(a1.x,a1.y);
        ctx.lineTo(b1.x,b1.y);
        ctx.lineTo(c1.x,c1.y);
        ctx.closePath();
        ctx.stroke();
        // ctx.fill();
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
        return allObjSortedList;
    }

    sortFun(a, b){
        return b.distanceToCamera - a.distanceToCamera;
    }

}

export default Renderer;
