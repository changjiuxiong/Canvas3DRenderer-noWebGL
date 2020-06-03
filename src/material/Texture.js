
class Texture {
    constructor(param) {
        param = param || {};
        this.image = param.image || new Image();
        this.wrapS = param.wrapS || COOL.REPEAT;
        this.wrapT = param.wrapT || COOL.REPEAT;
        this.magFilter = param.magFilter || COOL.NEAREST;
        this.minFilter = param.minFilter || COOL.NEAREST;

        this.imageData = null;
        this.width = null;
        this.height = null;

        this.ready = false;

        this.initCanvas();
    }

    initCanvas(){
        let that = this;
        that.image.onload=function () {
            let width = that.image.width;
            let height = that.image.height;
            let canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(that.image, 0, 0);
            let imageData = ctx.getImageData(0, 0, width, height).data;

            that.width = width;
            that.height = height;
            that.imageData = imageData;

            that.ready = true;
        }
    }

    getColorByUV(s,t){

        let u = s;
        let v = t;

        if(u>1){
            u = u - Math.floor(u);
        }
        if(v>1){
            v = v - Math.floor(v);
        }

        let index = Math.floor(v*this.height)*this.width*4 + Math.floor(u*this.width)*4;
        let r = this.imageData[index];
        let g = this.imageData[index+1];
        let b = this.imageData[index+2];
        let a = this.imageData[index+3];

        return [r,g,b,a];
    }

    clone(){

        var image = new Image();
        image.src = this.image.src;

        var texture = new Texture({
            image: image,
            wrapS: this.wrapS,
            wrapT: this.wrapT,
            magFilter: this.magFilter,
            minFilter: this.minFilter
        });

        return texture;
    }

}

export default Texture;
