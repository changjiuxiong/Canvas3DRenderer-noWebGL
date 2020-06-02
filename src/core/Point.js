
import Mesh from "./Mesh.js";
import Util from "../util/Util";
import {Vector3} from "../math/Vector3";
import {Vector4} from "../math/Vector4";
import {Vector2} from "../math/Vector2";

class Point {
    constructor(param) {
        this.v30 = param.v30;
        this.v4 = null;
        this.v3 = null;
        this.v2 = null;

        this.uv = param.uv;
        this.MVPmatrix = param.MVPmatrix;

        this.init();
    }

    init(){
        this.v4 = this.MVPmatrix.multiplyVector4(new Vector4(this.v30.x, this.v30.y, this.v30.z, 1));
        this.v3 = new Vector3(this.v4.x/this.v4.w, this.v4.y/this.v4.w, this.v4.z/this.v4.w);
        this.v2 = new Vector2(this.v3.x, this.v3.y);
    }

}

export default Point;
