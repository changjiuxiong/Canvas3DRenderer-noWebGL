import Material from "./Material";

class MeshStandardMaterial extends Material{
    constructor(param) {
        super(param);
        this.type = 'MeshStandardMaterial';
    }

}

export default MeshStandardMaterial;
