import {Vector3} from "../math/Vector3";

class BoxGeometry {
    constructor(param) {
        param = param || {};

        this.uv = param.uv || new Float32Array([   // Vertex coordinates

            1,1, 0,1, 0,0, 1,0,  // v0-v1-v2-v3 front
            0,1, 0,0, 1,0, 1,1,  // v0-v3-v4-v5 right
            1,0, 1,1, 0,1, 0,0,  // v0-v5-v6-v1 up
            1,1, 0,1, 0,0, 1,0,  // v1-v6-v7-v2 left
            0,1, 1,1, 1,0, 0,0,  // v7-v4-v3-v2 down
            1,0, 0,0, 0,1, 1,1   // v4-v7-v6-v5 back

        ]);

        this.vertices = param.indices || new Float32Array([   // Vertex coordinates
            0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,  // v0-v1-v2-v3 front
            0.5, 0.5, 0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5,  // v0-v3-v4-v5 right
            0.5, 0.5, 0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,  // v0-v5-v6-v1 up
            -0.5, 0.5, 0.5,  -0.5, 0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,  // v1-v6-v7-v2 left
            -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5,-0.5, 0.5,  -0.5,-0.5, 0.5,  // v7-v4-v3-v2 down
            0.5,-0.5,-0.5,  -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,   0.5, 0.5,-0.5   // v4-v7-v6-v5 back
        ]);

        this.normal = param.normal || this.vertices;

        this.indices = param.indices || new Uint16Array([       // Indices of the vertices
            0, 1, 2,   0, 2, 3,    // front
            4, 5, 6,   4, 6, 7,    // right
            8, 9,10,   8,10,11,    // up
            12,13,14,  12,14,15,    // left
            16,17,18,  16,18,19,    // down
            20,21,22,  20,22,23     // back
        ]);

        this.updateNormal();

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


    clone(){
        var geometry = new BoxGeometry({
            vertices: this.vertices.slice(0),
            indices: this.indices.slice(0)
        });

        return geometry;
    }
}

export default BoxGeometry;
