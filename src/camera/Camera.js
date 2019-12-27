
import {Matrix4} from "../math/Matrix4";
import {Vector3} from "../math/Vector3";
import {Quaternion} from "../math/Quaternion";

class Camera {
    constructor(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.position = [0, 0, 10];
        this.target = [0,0,0];
        this.up = [0,1,0];

        this.VPmatrix = new Matrix4();

        this.direction = [0,0,-1];
        this.right = [1,0,0];

        this.scale = [1,1,1];
        this.quaternion = new Quaternion();
        this.matrix = new Matrix4();
        this.matrixWorld = this.matrix;
        this.projectionMatrix = new Matrix4();

        this.updateAll();
    }

    updateAll(){
        this.updateOption();
        this.updateMatrix();
        this.updateVPMatrix();
    }

    updateMatrix(){
        var quaternionD = new Quaternion().setFromUnitVectors(new Vector3(0,0,-1), new Vector3().fromArray(this.direction));
        var right2 = new Vector3(1,0,0).applyQuaternion(quaternionD);
        var quaternionR = new Quaternion().setFromUnitVectors(right2, new Vector3().fromArray(this.right));
        var quaternion = new Quaternion().multiplyQuaternions(quaternionR, quaternionD);
        this.quaternion = quaternion;

        this.matrix.compose( new Vector3().fromArray(this.position), this.quaternion, new Vector3().fromArray(this.scale) );
        this.projectionMatrix = new Matrix4().setPerspective(this.fov, this.aspect, this.near, this.far);
        // this.updateMatrixWorld ();
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
        this.VPmatrix = new Matrix4().setPerspective(this.fov, this.aspect, this.near, this.far);
        var Vmatrix = new Matrix4().getInverse(this.matrix);
        this.VPmatrix.concat(Vmatrix);
        //等价
        // this.VPmatrix.lookAt2(this.position[0],this.position[1],this.position[2], this.target[0],this.target[1],this.target[2], this.up[0],this.up[1],this.up[2]);
    }

}

export default Camera;

