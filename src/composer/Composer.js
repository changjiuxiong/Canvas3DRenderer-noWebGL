class Composer{
    constructor(){
        this.vertexShader = [
            'precision highp int;',
            'precision highp float;',
            'attribute vec4 a_Position;',
            'attribute vec2 a_TexCoord;',
            "varying vec2 vUv;",

            "void main() {",

            "vUv = a_TexCoord;",
            "gl_Position = a_Position;",
            "gl_Position.z = 0.0;",

            "}"

        ].join( "\n" );

        this.fragmentShader = [

            '#define lineWidth 2',
            'precision highp int;',
            'precision highp float;',
            "uniform sampler2D tDiffuse;",

            "varying vec2 vUv;",

            "float getGray(vec4 color){",
            "	return (color.r + color.g + color.b)/3.0;",
            // "	return color.r*0.299 + color.g*0.587 + color.b*0.114;",
            "}",

            "float getEdgeGray(vec2 uv){",
            "	float step = 1.0/600.0;",
            "	float gray = 0.0;",

            "	gray += -1.0 * getGray(texture2D( tDiffuse, vec2(uv.x-step, uv.y-step) ));",
            "	gray += -1.0 * getGray(texture2D( tDiffuse, vec2(uv.x, uv.y-step) ));",
            "	gray += -1.0 * getGray(texture2D( tDiffuse, vec2(uv.x+step, uv.y-step) ));",

            "	gray += -1.0 * getGray(texture2D( tDiffuse, vec2(uv.x-step, uv.y) ));",
            "	gray += 8.0 * getGray(texture2D( tDiffuse, vec2(uv.x, uv.y) ));",
            "	gray += -1.0 * getGray(texture2D( tDiffuse, vec2(uv.x+step, uv.y) ));",

            "	gray += -1.0 * getGray(texture2D( tDiffuse, vec2(uv.x-step, uv.y+step) ));",
            "	gray += -1.0 * getGray(texture2D( tDiffuse, vec2(uv.x, uv.y+step) ));",
            "	gray += -1.0 * getGray(texture2D( tDiffuse, vec2(uv.x+step, uv.y+step) ));",

            "	return floor(gray+0.5);",
            "}",

            "float getFinalGray(vec2 uv){",
            "	float step = 1.0/600.0;",
            "	for(int i=-lineWidth; i<lineWidth; i++){",
            "	    for(int j=-lineWidth; j<lineWidth; j++){",
            "	        if(getEdgeGray(vec2(uv.x+step*float(i), uv.y+step*float(j)))>0.5){",
            "	            return 1.0;",
            "	        }",
            "	    }",
            "	}",
            "	return 0.0;",
            "}",

            "void main() {",

            "vec4 texel = texture2D( tDiffuse, vUv );",
            "float gray = getFinalGray(vUv);",

            "vec4 finalColor = vec4(0,0,1,1) * gray;",

            "gl_FragColor = finalColor;",

            "}"

        ].join( "\n" );

    }
}

export default Composer;
