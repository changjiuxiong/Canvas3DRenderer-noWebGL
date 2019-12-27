import Composer from "./Composer";

class ComposerOthers extends Composer{
    constructor(){
        super();

        this.vertexShader =
            'precision highp int;\n' +
            'precision highp float;\n' +
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_MvMatrix;\n' +
            'uniform mat4 u_PMatrix;\n' +
            'void main() {\n' +
            '  gl_Position = u_PMatrix * u_MvMatrix * a_Position;\n' +
            '}\n';

        this.fragmentShader = 'precision highp int;\n' +
            'precision highp float;\n' +
            'void main() {\n' +
            '  gl_FragColor = vec4(0,0,0,0);\n' +
            '}\n';

    }
}

export default ComposerOthers;
