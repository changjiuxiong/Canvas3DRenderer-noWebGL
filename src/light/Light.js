
class Light {
    constructor(param) {
        this.type = 'Light';

        param = param || {};
        this.color = param.color || [1,1,1];
        this.intensity = param.intensity !== undefined ? param.intensity : 1;
        this.castShadow = param.castShadow;
    }
}

export default Light;
