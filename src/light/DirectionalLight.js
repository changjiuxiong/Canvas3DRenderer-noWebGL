import Light from "./Light";
import {Vector3} from "../math/Vector3";

class DirectionalLight extends Light{
    constructor(param) {
        super(param);
        this.type = 'DirectionalLight';
        this.direction = [1,1,1];
        this.setDirection(param.direction || [1,1,1]);
    }

    setDirection(direction){
        this.direction =  new Vector3().fromArray(direction).normalize().toArray();
    }
}

export default DirectionalLight;
