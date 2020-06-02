
class Texture {
    constructor(param) {
        param = param || {};
        this.image = param.image || new Image();
        this.wrapS = param.wrapS || COOL.REPEAT;
        this.wrapT = param.wrapT || COOL.REPEAT;
        this.magFilter = param.magFilter || COOL.NEAREST;
        this.minFilter = param.minFilter || COOL.NEAREST;

        this.canvas = null;

        this.initCanvas();
    }

    initCanvas(){
        let that = this;
        that.image.onload=function () {
            let canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(that.image, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        }
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
