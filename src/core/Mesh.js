
import Material from "../material/Material.js";
import {Matrix4} from "../math/Matrix4";
import {Euler} from "../math/Euler";
import {Quaternion} from "../math/Quaternion";
import {Vector3} from "../math/Vector3";




class Mesh {
    constructor(param) {
        this.type = 'Mesh';
        param = param || {};
        this.geometry = param.geometry;
        this.material = param.material || new Material();

        this.position = param.position || [0,0,0];
        this.rotation = param.rotation || new Euler();
        this.scale = param.scale || [1,1,1];

        this.quaternion = new Quaternion().setFromEuler( this.rotation, false );

        this.children = [];
        this.parent = null;

        this.matrix = new Matrix4();
        this.matrixWorld = new Matrix4();
        this.updateMatrix();

    }

    setPosition(position){
        this.position = position;
        this.updateMatrix();
    }

    setRotation(rotationArray){
        this.rotation = new Euler().fromArray(rotationArray);
        var quaternion = new Quaternion().setFromEuler( this.rotation, false );
        this.setQuaternion(quaternion);
    }

    setQuaternion(quaternion){

        this.quaternion = quaternion;
        this.rotation.setFromQuaternion( quaternion, undefined, false );
        this.updateMatrix();
    }

    setScale(scaleArray){
        this.scale = scaleArray;
        this.updateMatrix();
    }

    updateMatrix(){
        this.matrix.compose( new Vector3().fromArray(this.position), this.quaternion, new Vector3().fromArray(this.scale) );
        this.updateMatrixWorld ();
    }

    setMatrix(matrix){
        this.matrix = matrix;
        this.updateMatrixWorld ();
    }

    updateMatrixWorld () {

        // this.updateMatrix();

        if ( this.parent === null ) {

            this.matrixWorld = this.matrix.clone();

        } else {

            this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

        }

        this.updateChildrenMatrixWorld();

    }

    getWorldPosition() {

        var target = new Vector3();

        // this.updateMatrixWorld();

        return target.setFromMatrixPosition( this.matrixWorld );

    }

    updateChildrenMatrixWorld(){

        for(var i in this.children){
            this.children[i].updateMatrixWorld();
        }

    }

    clone(){
        var mesh = new Mesh({
            geometry: this.geometry.clone(),
            material: this.material.clone(),
            position: this.position.slice(0),
            rotation: this.rotation.clone(),
            scale: this.scale.slice(0)
        });

        return mesh;
    }

    add(mesh){
        this.children.push(mesh);
        mesh.parent = this;
        mesh.updateMatrix();
    }

    rotateOnAxis (axis, angle) {

        var q1 = new Quaternion();
        q1.setFromAxisAngle( axis, angle );
        var quaternion = this.quaternion.multiply( q1 );
        this.setQuaternion(quaternion);

    }

    rotateX (angle) {

        this.rotateOnAxis( new Vector3(1,0,0), angle );

    }

    rotateY (angle) {

        this.rotateOnAxis( new Vector3(0,1,0), angle );

    }

    rotateZ (angle) {

        this.rotateOnAxis( new Vector3(0,0,1), angle );

    }

}

export default Mesh;
