
import {Matrix4} from "../math/Matrix4";
import {Vector3} from "../math/Vector3";

class OrthoCamera {
    constructor(left, right, bottom, top, near, far) {
        this.left = left;
        this._right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;

        this.position = [0, 0, 10];
        this.target = [0,0,0];
        this.up = [0,1,0];

        this.VPmatrix = new Matrix4();

        this.direction = [0,0,-1];
        this.right = [1,0,0];

        this.updateAll();
    }

    updateAll(){
        this.updateOption();
        this.updateVPMatrix();
    }

    updateOption(){
        var targetV3 = new Vector3().fromArray(this.target);
        var positionV3 = new Vector3().fromArray(this.position);
        var upV3 = new Vector3().fromArray(this.up);

        var directionV3 = new Vector3().subVectors(targetV3, positionV3).normalize();
        this.direction = directionV3.toArray();

        var rightV3 = new Vector3().crossVectors(directionV3, upV3).normalize();
        this.right = rightV3.toArray();

        // this.up = new Vector3().crossVectors(rightV3, directionV3).normalize().toArray();
    }

    setPosition(position){
        this.position = position;
        this.updateAll();
    }

    setTarget(target){
        this.target = target;
        this.updateAll();
    }

    setUp(up){
        this.up = new Vector3().fromArray(up).normalize().toArray();
        this.updateAll();
    }



    updateVPMatrix(){
        this.VPmatrix = new Matrix4().setOrtho(this.left, this._right, this.bottom, this.top, this.near, this.far);
        this.VPmatrix.lookAt2(this.position[0],this.position[1],this.position[2], this.target[0],this.target[1],this.target[2], this.up[0],this.up[1],this.up[2]);
    }

}

export default OrthoCamera;

