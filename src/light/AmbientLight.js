import Light from "./Light";

class AmbientLight extends Light{
    constructor(param) {
        super(param);
        this.type = 'AmbientLight';
    }
}

export default AmbientLight;
