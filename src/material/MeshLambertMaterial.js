import Material from "./Material";

class MeshLambertMaterial extends Material{
    constructor(param) {
        super(param);
        this.type = 'MeshLambertMaterial';
    }

}

export default MeshLambertMaterial;
