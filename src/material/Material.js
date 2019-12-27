
class Material {
    constructor(param) {
        param = param || {};
        this.type = 'Material';
        this.map = param.map;
        this.envMap = param.envMap;
        this.color = param.color || [1,1,1,1];
        this.opacity = this.color[3];
        if(this.color[3] && this.color[3]<1){
            this.transparent = true;
        }else {
            this.transparent = false;
        }
        this.metalness = param.metalness == undefined ? 0.5 : param.metalness;

        this.wireframe = param.wireframe == undefined ? false : param.wireframe;

        var VSHADER_SOURCE =

            'precision highp int;\n' +
            'precision highp float;\n' +
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_MvMatrix;\n' +
            'uniform mat4 u_PMatrix;\n' +

            '#ifdef USE_Shadow\n' +
            'uniform mat4 u_PMatrixFromLight;\n' +
            'varying vec4 v_PositionFromLight;\n' +
            '#endif\n' +

            'attribute vec2 a_TexCoord;\n' +
            'varying vec2 v_TexCoord;\n' +
            'attribute vec3 a_Normal;\n' +
            'varying vec3 v_Normal;\n' +

            '#ifdef USE_SColor\n' +
            'varying vec3 v_PositionV3;\n' +
            '#else\n' +
            '   #ifdef USE_envMap\n' +
            '   varying vec3 v_PositionV3;\n' +
            '   #endif\n' +
            '#endif\n' +

            'void main() {\n' +
            '  vec4 positionV4 = u_PMatrix * u_MvMatrix * a_Position;\n' +
            '  gl_Position = positionV4;\n' +
            '  v_TexCoord = a_TexCoord;\n' +
            '  v_Normal = mat3(u_MvMatrix) * a_Normal;\n' +
            // '  v_Normal = (u_MvMatrix * vec4(a_Normal, 0.0)).xyz;\n' +
            // '  v_Normal = a_Normal;\n' +

            '#ifdef USE_Shadow\n' +
            '  v_PositionFromLight = u_PMatrixFromLight * u_MvMatrix * a_Position;\n' +
            '#endif\n' +

            '#ifdef USE_SColor\n' +
            '  vec4 positionV4Rel = u_MvMatrix * a_Position;\n' +
            '  v_PositionV3 = positionV4Rel.xyz / positionV4Rel.w;\n' +
            '#else\n' +
            '   #ifdef USE_envMap\n' +
            '   vec4 positionV4Rel = u_MvMatrix * a_Position;\n' +
            '   v_PositionV3 = positionV4Rel.xyz / positionV4Rel.w;\n' +
            '   #endif\n' +
            '#endif\n' +

            '}\n';

        var FSHADER_SOURCE =
            'precision highp int;\n' +
            'precision highp float;\n' +
            'uniform vec4 u_Color;\n' +
            'varying vec2 v_TexCoord;\n' +
            'varying vec3 v_Normal;\n' +

            'uniform float u_Metalness;\n' +

            '#ifdef USE_Map\n' +
            'uniform sampler2D u_Sampler;\n' +
            '#endif\n' +

            '#ifdef USE_envMap\n' +
            'uniform samplerCube u_envMap;\n' +
            '#endif\n' +

            '#ifdef USE_AmbientLight\n' +
            'uniform vec3 u_AmbientLight_Color;\n' +
            '#endif\n' +

            '#ifdef USE_DirectionalLight\n' +
            'uniform vec3 u_DirectionalLight_Direction;\n' +
            'uniform vec3 u_DirectionalLight_Color;\n' +
            '#endif\n' +

            '#ifdef USE_SColor\n' +
            'uniform vec3 u_Camera_Position;\n' +
            'varying vec3 v_PositionV3;\n' +
            '#else\n' +
            '   #ifdef USE_envMap\n' +
            '   uniform vec3 u_Camera_Position;\n' +
            '   varying vec3 v_PositionV3;\n' +
            '   #endif\n' +
            '#endif\n' +

            '#ifdef USE_Shadow\n' +
            'uniform sampler2D u_ShadowMap;\n' +
            'varying vec4 v_PositionFromLight;\n' +

            'float unpackDepth(const in vec4 rgbaDepth) {\n' +
            '  const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));\n' +
            '  float depth = dot(rgbaDepth, bitShift);\n' + // Use dot() since the calculations is same
            '  return depth;\n' +
            '}\n' +

            '#endif\n' +

            'void main() {\n' +
            '  vec4 color = u_Color;\n' +
            '  vec3 v_Normal0 = normalize(v_Normal);\n' +

            '#ifdef USE_Map\n' +
            '  color = texture2D(u_Sampler, v_TexCoord);\n' +
            '#endif\n' +

            '  vec3 colorV3 = color.rgb;\n' +
            '  float useLight = 0.0;\n' +
            '  vec3 finalColorV3 = colorV3.rgb;\n' +

            '#ifdef USE_AmbientLight\n' +
            '  vec3 A_color = colorV3 * u_AmbientLight_Color * 0.5;\n' +
            '  finalColorV3 = A_color;\n' +
            '  useLight = 1.0;\n' +
            '#endif\n' +

            '#ifdef USE_DirectionalLight\n' +
            '  float D_weight = max(dot(u_DirectionalLight_Direction, v_Normal0), 0.0);\n' +
            '  vec3 D_color = colorV3 * u_DirectionalLight_Color * D_weight * (1.0 - u_Metalness);\n' +

            '  if(useLight>0.5){\n' +
            '    finalColorV3 = finalColorV3 + D_color;\n' +
            '  }else{\n' +
            '    finalColorV3 = D_color;\n' +
            '  }\n' +
            '  useLight = 1.0;\n' +
            '#endif\n' +

            '#ifdef USE_SColor\n' +
            '  vec3 r = normalize( reflect(-u_DirectionalLight_Direction, v_Normal0) );\n' +
            '  vec3 v = normalize( u_Camera_Position - v_PositionV3 );\n' +
            '  float rdotv = max( dot(r ,v), 0.0 );\n' +
            '  float S_weight = pow( rdotv, 100.0 );\n' +
            '  vec3 S_color = colorV3 * u_DirectionalLight_Color * S_weight * u_Metalness;\n' +

            '  if(useLight>0.5){\n' +
            '    finalColorV3 = finalColorV3 + S_color;\n' +
            '  }else{\n' +
            '    finalColorV3 = S_color;\n' +
            '  }\n' +
            '  useLight = 1.0;\n' +
            '#endif\n' +

            '  color = vec4(finalColorV3, color.a);\n' +

            '#ifdef USE_envMap\n' +
            // '   vec3 v1 = normalize( u_Camera_Position - v_PositionV3 );\n' +
            // '   vec3 r1 = normalize( reflect(v1, v_Normal0) );\n' +
            '   vec3 v1 = u_Camera_Position - v_PositionV3;\n' +
            '   vec3 r1 = reflect(-v1, v_Normal0);\n' +

            '   vec4 envMapColor = textureCube(u_envMap, r1);\n' +
            // '   vec3 ref = v1 - 2.0 * dot(v_Normal0, v1) * v_Normal0;\n'+
            // '   vec4 envMapColor = textureCube(u_envMap, ref);\n' +
            '   color = vec4(envMapColor.rgb, color.a);\n' +
            '#endif\n' +


            '#ifdef USE_Shadow\n' +
            '  vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;\n' +
            '  vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);\n' +
            '  float depth = unpackDepth(rgbaDepth);\n' +
            '  float visibility = (shadowCoord.z > depth + 0.0015) ? 0.7 : 1.0;\n' +
            '  color = vec4(color.rgb * visibility, color.a);\n' +
            '#endif\n' +

            '  gl_FragColor = color;\n' +

            '}\n';

        this.vshaderSource = VSHADER_SOURCE;
        this.fshaderSource = FSHADER_SOURCE;
    }

    setOpacity(opacity){
        this.opacity = opacity;
        this.color[3] = opacity;
        this.transparent = opacity<1;
    }

    clone(){

        var material = new Material({
            map: this.map,
            color: this.color.slice(0)
        });

        return material;
    }

}

export default Material;
