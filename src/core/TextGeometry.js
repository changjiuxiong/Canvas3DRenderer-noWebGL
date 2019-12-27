import {Vector3} from "../math/Vector3";
import {Vector2} from "../math/Vector2";
import {Sphere} from "../math/Sphere";
import {Box3} from "../math/Box3";
import {ExtrudeBufferGeometry} from "../loader/ExtrudeGeometry";
import {Shape} from "../extras/core/Shape";

class TextGeometry {
    constructor(param) {
        param = param || {};

        this.text = param.text == undefined ? '0' : param.text;

        if(this.text == '2'){

            var pts = [];

            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 5, 10 ) );
            pts.push( new Vector2( 5, 4.5 ) );
            pts.push( new Vector2( 1, 4.5 ) );
            pts.push( new Vector2( 1, 1 ) );
            pts.push( new Vector2( 5, 1 ) );
            pts.push( new Vector2( 5, 0 ) );
            pts.push( new Vector2( 0, 0 ) );
            pts.push( new Vector2( 0, 5.5 ) );
            pts.push( new Vector2( 4, 5.5 ) );
            pts.push( new Vector2( 4, 9 ) );
            pts.push( new Vector2( 0, 9 ) );

            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;


        }else if(this.text == '1'){

            var pts = [];

            pts.push( new Vector2( 4.5, 0 ) );
            pts.push( new Vector2( 4.5, 10 ) );
            pts.push( new Vector2( 5.5, 10 ) );
            pts.push( new Vector2( 5.5, 0 ) );


            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;


        }else if(this.text == '3'){

            var pts = [];

            pts.push( new Vector2( 0, 0 ) );
            pts.push( new Vector2( 0, 1 ) );
            pts.push( new Vector2( 4, 1 ) );
            pts.push( new Vector2( 4, 4.5 ) );
            pts.push( new Vector2( 0, 4.5 ) );
            pts.push( new Vector2( 0, 5.5 ) );
            pts.push( new Vector2( 4, 5.5 ) );
            pts.push( new Vector2( 4, 9 ) );
            pts.push( new Vector2( 0, 9 ) );
            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 5, 10 ) );
            pts.push( new Vector2( 5, 0 ) );
            pts.push( new Vector2( 5, 0 ) );



            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;


        }else if(this.text == '4'){

            var pts = [];

            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 1, 10 ) );
            pts.push( new Vector2( 1, 5.5 ) );
            pts.push( new Vector2( 4, 5.5 ) );
            pts.push( new Vector2( 4, 10 ) );
            pts.push( new Vector2( 5, 10 ) );
            pts.push( new Vector2( 5, 0 ) );
            pts.push( new Vector2( 4, 0 ) );
            pts.push( new Vector2( 4, 4.5 ) );
            pts.push( new Vector2( 0, 4.5 ) );


            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;


        }else if(this.text == '5'){

            var pts = [];

            pts.push( new Vector2( 0, 0 ) );
            pts.push( new Vector2( 0, 1 ) );
            pts.push( new Vector2( 4, 1 ) );
            pts.push( new Vector2( 4, 4.5 ) );
            pts.push( new Vector2( 0, 4.5 ) );
            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 5, 10 ) );
            pts.push( new Vector2( 5, 9 ) );
            pts.push( new Vector2( 1, 9 ) );
            pts.push( new Vector2( 1, 5.5 ) );
            pts.push( new Vector2( 5, 5.5 ) );
            pts.push( new Vector2( 5, 0 ) );


            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;
        }else if(this.text == '6'){

            var pts = [];

            pts.push( new Vector2( 5, 10 ) );
            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 0, 0 ) );
            pts.push( new Vector2( 5, 0 ) );
            pts.push( new Vector2( 5, 5.5 ) );
            pts.push( new Vector2( 1, 5.5 ) );
            pts.push( new Vector2( 1, 4.5 ) );
            pts.push( new Vector2( 4, 4.5 ) );
            pts.push( new Vector2( 4, 1 ) );
            pts.push( new Vector2( 1, 1 ) );
            pts.push( new Vector2( 1, 9 ) );
            pts.push( new Vector2( 5, 9 ) );



            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;
        }else if(this.text == '7'){

            var pts = [];

            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 5, 10 ) );
            pts.push( new Vector2( 5, 0 ) );
            pts.push( new Vector2( 4, 0 ) );
            pts.push( new Vector2( 4, 9 ) );
            pts.push( new Vector2( 0, 9 ) );


            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;
        }else if(this.text == '8'){

            var pts = [];

            pts.push( new Vector2( 5, 10 ) );
            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 0, 0 ) );
            pts.push( new Vector2( 5, 0 ) );

            pts.push( new Vector2( 5, 9 ) );
            pts.push( new Vector2( 4, 9 ) );
            pts.push( new Vector2( 4, 5.5 ) );
            pts.push( new Vector2( 1, 5.5 ) );

            pts.push( new Vector2( 1, 4.5 ) );
            pts.push( new Vector2( 4, 4.5 ) );
            pts.push( new Vector2( 4, 1 ) );
            pts.push( new Vector2( 1, 1 ) );
            pts.push( new Vector2( 1, 9 ) );
            pts.push( new Vector2( 5, 9 ) );


            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;
        }else if(this.text == '9'){

            var pts = [];

            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 1, 10 ) );
            pts.push( new Vector2( 1, 5.5 ) );
            pts.push( new Vector2( 4, 5.5 ) );

            pts.push( new Vector2( 4, 9 ) );
            pts.push( new Vector2( 1, 9 ) );
            pts.push( new Vector2( 1, 10 ) );
            pts.push( new Vector2( 5, 10 ) );

            pts.push( new Vector2( 5, 0 ) );
            pts.push( new Vector2( 4, 0 ) );
            pts.push( new Vector2( 4, 4.5 ) );
            pts.push( new Vector2( 0, 4.5 ) );


            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;
        }else if(this.text == '0'){

            var pts = [];

            pts.push( new Vector2( 5, 10 ) );
            pts.push( new Vector2( 0, 10 ) );
            pts.push( new Vector2( 0, 0 ) );
            pts.push( new Vector2( 5, 0 ) );

            pts.push( new Vector2( 5, 9 ) );
            pts.push( new Vector2( 4, 9 ) );
            pts.push( new Vector2( 4, 1 ) );
            pts.push( new Vector2( 1, 1 ) );

            pts.push( new Vector2( 1, 9 ) );
            pts.push( new Vector2( 5, 9 ) );


            var shape = new Shape( pts );
            var extrudeSettings = {
                depth: 3,
                steps: 1,
                bevelEnabled: false,
                bevelThickness: 2,
                bevelSize: 4,
                bevelSegments: 1
            };
            var extrudeGeometry = new ExtrudeBufferGeometry( shape, extrudeSettings );

            var indices = [];
            for(var i=0; i<extrudeGeometry.attributes.position.array.length/3; i++){
                indices.push(i);
            }

            param.vertices = extrudeGeometry.attributes.position.array;
            param.normal = extrudeGeometry.attributes.normal.array;
            param.uv = extrudeGeometry.attributes.uv.array;
            param.indices = indices;
        }

        this.uv = param.uv || new Float32Array([   // Vertex coordinates

            1,1, 0,1, 0,0, 1,0,  // v0-v1-v2-v3 front
            0,1, 0,0, 1,0, 1,1,  // v0-v3-v4-v5 right
            1,0, 1,1, 0,1, 0,0,  // v0-v5-v6-v1 up
            1,1, 0,1, 0,0, 1,0,  // v1-v6-v7-v2 left
            0,1, 1,1, 1,0, 0,0,  // v7-v4-v3-v2 down
            1,0, 0,0, 0,1, 1,1   // v4-v7-v6-v5 back

        ]);

        this.vertices = param.vertices || new Float32Array([   // Vertex coordinates
            0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,  // v0-v1-v2-v3 front
            0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5,  // v0-v3-v4-v5 right
            0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,  // v0-v5-v6-v1 up
            -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  // v1-v6-v7-v2 left
            -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,  // v7-v4-v3-v2 down
            0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5   // v4-v7-v6-v5 back
        ]);

        this.normal = param.normal || this.vertices;

        this.indices = new Uint16Array(param.indices);

        this.morphAttributes = param.morphAttributes;

        this.boundingSphere = new Sphere();
        this.boundingBox = new Box3();
        this.computeBoundingBox();

        // this.updateNormal();

        this.updataBuffer();

    }

    updataBuffer(){
        var buffer = [];
        var uv = this.uv;
        var vertices = this.vertices;
        var normal = this.normal;
        for(var i=0; i<vertices.length; i+=3){
            buffer.push(vertices[i+0]);
            buffer.push(vertices[i+1]);
            buffer.push(vertices[i+2]);

            buffer.push(normal[i+0]);
            buffer.push(normal[i+1]);
            buffer.push(normal[i+2]);

            buffer.push(uv[i/3*2+0]);
            buffer.push(uv[i/3*2+1]);
        }

        this.buffer = new Float32Array(buffer);
    }

    updateNormal(){
        var normal = [];
        var vertices = this.vertices;
        for(var i=0; i<vertices.length; i+=3*4){
            var line1 = new Vector3().subVectors(
                new Vector3(vertices[i+0], vertices[i+1], vertices[i+2]),
                new Vector3(vertices[i+3], vertices[i+4], vertices[i+5])
            );
            var line2 = new Vector3().subVectors(
                new Vector3(vertices[i+3], vertices[i+4], vertices[i+5]),
                new Vector3(vertices[i+6], vertices[i+7], vertices[i+8]),
            );
            var cur_normal = new Vector3().crossVectors(
                line1,
                line2
            ).toArray();
            for(var j=0 ;j<4; j++){
                normal.push(cur_normal[0], cur_normal[1], cur_normal[2]);
            }
        }
        this.normal = new Float32Array(normal);

    }

    computeBoundingBox () {
        var verticesV3 = [];
        for(var i=0; i<this.vertices.length; i+=3){
            verticesV3.push(new Vector3(this.vertices[i], this.vertices[i+1], this.vertices[i+2]))
        }
        this.boundingBox.setFromPoints(verticesV3);
    }

}

export default TextGeometry;
