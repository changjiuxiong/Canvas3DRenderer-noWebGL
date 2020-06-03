
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

        // gl.clearRect(0,0,600,600);
        gl.fillStyle="black";
        gl.fillRect(0,0,600,600);

        var ambientLight = null;
        var directionalLight = null;

        for(var i in scene.lights){
            if(scene.lights[i].type === 'DirectionalLight'){
                directionalLight = scene.lights[i];
            }else if(scene.lights[i].type === 'AmbientLight'){
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
        var uv = geometry.uv;


        var material = mesh.material;
        var map = material.map;
        var color = material.color;

        var ctx = that.gl;

        for(let i=0; i<indices.length; i+=3){
            let point1x = vertices[indices[i]*3];
            let point1y = vertices[indices[i]*3+1];
            let point1z = vertices[indices[i]*3+2];

            let point1s = uv[indices[i]*2];
            let point1t = uv[indices[i]*2+1];

            let point1 = new Vector3(point1x,point1y,point1z);
            point1.uv = new Vector2(point1s,point1t);

            let point2x = vertices[indices[i+1]*3];
            let point2y = vertices[indices[i+1]*3+1];
            let point2z = vertices[indices[i+1]*3+2];

            let point2s = uv[indices[i+1]*2];
            let point2t = uv[indices[i+1]*2+1];

            let point2 = new Vector3(point2x,point2y,point2z);
            point2.uv = new Vector2(point2s,point2t);

            let point3x = vertices[indices[i+2]*3];
            let point3y = vertices[indices[i+2]*3+1];
            let point3z = vertices[indices[i+2]*3+2];

            let point3s = uv[indices[i+2]*2];
            let point3t = uv[indices[i+2]*2+1];

            let point3 = new Vector3(point3x,point3y,point3z);
            point3.uv = new Vector2(point3s,point3t);

            that.drawTriangle(
                point1,
                point2,
                point3,
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

        v2.uv = v3.uv;

        return v2;
    }

    //背面剔除
    checkClockwise(p1, p2, p3){
        let isTriangleV2clockwise = false;

        if ((p2.x - p1.x) *(p3.y - p1.y) -(p3.x - p1.x) *(p2.y-p1.y) < 0.0){
            isTriangleV2clockwise = true;
        }

        return isTriangleV2clockwise;
    }

    drawTriangle(a,b,c, mesh){
        var that = this;
        var ctx = that.gl;

        var a1 = that.v3Tov2(a, mesh);
        var b1 = that.v3Tov2(b, mesh);
        var c1 = that.v3Tov2(c, mesh);

        if(!that.checkClockwise(a1,b1,c1)){
            return;
        }

        ctx.fillStyle = '#ff0000';
        ctx.strokeStyle = '#ff0000';

        function sortTByY(a,b) {
            return a.y - b.y;
        }

        var triangleList = [a1,b1,c1].sort(sortTByY);
        var a2 = triangleList[0];
        var b2 = triangleList[1];
        var c2 = triangleList[2];
        var flatTop,flatBottom;
        if(b2.y === a2.y){
            flatTop = [c2,a2,b2];
        }else if(b2.y === c2.y){
            flatBottom = [a2,b2,c2];
        }else{
            var alpha = (b2.y-a2.y)/(c2.y-a2.y);

            let d = that.getV2Linear(a2,c2,alpha);

            flatBottom = [a2,b2,d];
            flatTop = [c2,b2,d];
        }

        if(flatBottom){
            that.drawFlatT(flatBottom,mesh);
        }
        if(flatTop){
            that.drawFlatT(flatTop,mesh);
        }

    }

    getV2Linear(a2,c2,alpha){
        let ac = new Vector2().subVectors(c2,a2);
        let d = a2.clone().addScaledVector(ac, alpha);

        let auv = a2.uv.clone();
        let cuv = c2.uv.clone();
        let duv = new Vector2().addVectors(auv.multiplyScalar(1-alpha), cuv.multiplyScalar(alpha));
        d.uv = duv;

        return d;
    }

    drawT(t){
        var that = this;
        var ctx = that.gl;

        var a1 = t[0];
        var b1 = t[1];
        var c1 = t[2];

        ctx.fillStyle = '#ff0000';
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(a1.x,a1.y);
        ctx.lineTo(b1.x,b1.y);
        ctx.lineTo(c1.x,c1.y);
        ctx.closePath();
        ctx.stroke();
    }

    drawFlatT(t, mesh){
        let that = this;
        let ctx = that.gl;

        let a = t[0];
        let b;
        let c;

        if(t[1].x<t[2].x){
            b = t[1];
            c = t[2];
        }else{
            c = t[1];
            b = t[2];
        }

        let startY = Math.round(a.y);
        let endY = Math.round(b.y);
        let height = Math.abs(endY - startY);


        let dy = 1;
        if(endY<startY){
            dy = -1;
        }

        for(let y=startY; (y-startY)*(y-endY)<=0; y+=dy){
            if(y<0||y>600){
                continue;
            }

            let alpha = Math.abs(y-startY)/height;
            let startV2 = that.getV2Linear(a,b,alpha);
            let endV2 = that.getV2Linear(a,c,alpha);
            let startX = Math.round(startV2.x);
            let endX = Math.round(endV2.x);

            let width = endX - startX;
            if(width === 0){
                continue;
            }

            for(let x=startX; x<=endX; x++){
                if(x<0||x>600){
                    continue;
                }

                let alphaX = Math.abs(x-startX)/width;
                let point = that.getV2Linear(startV2,endV2,alphaX);

                let color = mesh.material.color;
                let color255;

                if(color){
                    color255 = [color[0]*255,color[1]*255,color[2]*255,color[3]];
                }

                let tex = mesh.material.map;
                if(tex && tex.ready){
                    color255 = tex.getColorByUV(point.uv.x,point.uv.y);
                }

                let r = color255[0];
                let g = color255[1];
                let b = color255[2];

                ctx.fillStyle = 'rgb('+r+','+g+','+b+')';

                ctx.fillRect(x,y,1,1);
            }
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
        return allObjSortedList;
    }

    sortFun(a, b){
        return b.distanceToCamera - a.distanceToCamera;
    }

}

export default Renderer;
