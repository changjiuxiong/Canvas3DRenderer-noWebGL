import Material from "./Material";

class MeshBasicMaterial extends Material{
    constructor(param) {
        super(param);
        this.type = 'MeshBasicMaterial';
    }

}

export default MeshBasicMaterial;
