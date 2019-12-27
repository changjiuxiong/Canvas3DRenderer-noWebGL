import Texture from "./Texture";

class CubeTexture extends Texture{
    constructor(param) {
        super(param);

        param = param || {};
        this.urls = param.urls;

        this.images = [];
        this.imgLoadCount = 0;
        this.imgReady = false;

        var that = this;
        var urls = this.urls;
        for(var i in urls){
            var image = new Image();
            that.images.push(image);
            image.addEventListener('load', function() {
                that.imgLoadCount ++;
                if(that.imgLoadCount == 6){
                    that.imgReady = true;
                }
            });
            image.src = urls[i];
        }

    }

    clone(){

    }

}

export default CubeTexture;
