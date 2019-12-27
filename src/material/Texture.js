
class Texture {
    constructor(param) {
        param = param || {};
        this.image = param.image || new Image();
        this.wrapS = param.wrapS || COOL.REPEAT;
        this.wrapT = param.wrapT || COOL.REPEAT;
        this.magFilter = param.magFilter || COOL.NEAREST;
        this.minFilter = param.minFilter || COOL.NEAREST;
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
