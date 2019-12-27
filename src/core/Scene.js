import Mesh from "./Mesh.js";
import AmbientLight from "../light/AmbientLight";

class Scene {
    constructor(param) {
        param = param || {};
        this.children = [];
        this.lights = [];
    }

    add(obj){
        if(obj.type == 'Mesh'){
            this.children.push(obj);
        }else{
            this.lights.push(obj);
        }

    }


}

export default Scene;