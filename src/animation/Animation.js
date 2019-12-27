import Mesh from "../core/Mesh";

class Animation {
    constructor(mesh){
        this.mesh = mesh || new Mesh();
        this.time = new Date().getTime();
        this.index = 0;
        this.frameCount = this.mesh.geometry.morphAttributes.position.length;
    }

    play(){
        this.time = new Date().getTime();
        this.index = 0;
        this.animationLoop();
    }

    animationLoop(){
        var that = this;
        var curTime = new Date().getTime();
        var curIndex = Math.floor((curTime - this.time)/1000*20)%this.frameCount;
        if(curIndex != this.index){
            this.mesh.geometry.vertices = this.mesh.geometry.morphAttributes.position[curIndex].array;
            this.mesh.geometry.updataBuffer();
            this.index = curIndex;
        }
        requestAnimationFrame(function () {
            that.animationLoop();
        });
    }

}

export default Animation;
