import Scene from "./Scene";
import Mesh from "./Mesh";
import Geometry from "./Geometry";
import MeshLambertMaterial from "../material/MeshLambertMaterial";
import {Quaternion} from "../math/Quaternion";
import {Matrix4} from "../math/Matrix4";

class GLTFLoader{
    constructor(){
        this.gltfObj = null;
        this.urlBase = null;

        this.arrayBuffers = [];
        this.arrayBufferCount = 0;
        this.dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;
    }

    load(url, onLoadSuccess){
        this.gltfObj = null;
        this.urlBase = null;

        this.arrayBuffers = [];
        this.arrayBufferCount = 0;

        var that = this;
        var urlArray = url.split('/');
        var jsonName = urlArray[urlArray.length-1];
        that.urlBase = url.split(jsonName)[0];

        var request = new XMLHttpRequest();
        request.open("get", url);
        request.onload = function () {
            if (request.status == 200) {
                var gltfObj = JSON.parse(request.responseText);
                that.gltfObj = gltfObj;
                console.log(gltfObj);

                that.arrayBufferCount = gltfObj.buffers.length;
                var loadBufferCount = 0;

                for(var i in gltfObj.buffers){

                    var buffer = gltfObj.buffers[i];

                    var dataUriRegexResult = buffer.uri.match( that.dataUriRegex );
                    if(dataUriRegexResult){

                        var buffer = that.base64ToArrayBuffer(dataUriRegexResult);
                        if(buffer){
                            that.arrayBuffers[i] = buffer;
                            loadBufferCount ++;

                            if(loadBufferCount = that.arrayBufferCount){

                                var sceneObj = gltfObj.scenes[0];
                                var scene = new Scene();
                                for(var nodeindex in sceneObj.nodes){
                                    var nodesIndex = sceneObj.nodes[nodeindex];
                                    var nodesObj = gltfObj.nodes[nodesIndex];
                                    var cur_mesh = that.nodeToMesh(nodesObj);
                                    scene.add(cur_mesh);
                                }
                                onLoadSuccess(scene);

                            }

                        }

                    }else{

                        var bufferDataUri = that.urlBase + buffer.uri;

                        var xhr = new XMLHttpRequest();
                        xhr.open( 'GET', bufferDataUri, true );
                        xhr.addEventListener( 'load', function ( event ) {

                            var buffer = this.response;
                            that.arrayBuffers[i] = buffer;
                            loadBufferCount ++;

                            if(loadBufferCount = that.arrayBufferCount){

                                var sceneObj = gltfObj.scenes[0];
                                var scene = new Scene();
                                for(var nodeindex in sceneObj.nodes){
                                    var nodesIndex = sceneObj.nodes[nodeindex];
                                    var nodesObj = gltfObj.nodes[nodesIndex];
                                    var cur_mesh = that.nodeToMesh(nodesObj);
                                    scene.add(cur_mesh);
                                }
                                onLoadSuccess(scene);

                            }


                        }, false );
                        xhr.responseType = 'arraybuffer';
                        xhr.send( null );

                    }


                }


            }
        };
        request.send(null);

    }

    nodeToMesh(node){
        var that = this;

        var meshIndex = node.mesh;
        var mesh = null;

        if(meshIndex != undefined){
            var meshObj = that.gltfObj.meshes[meshIndex];
            var geometryAndMaterial = that.meshToGeometry(meshObj);
            mesh = new Mesh({
                geometry:geometryAndMaterial[0],
                material:geometryAndMaterial[1]
            });
        }else{
            mesh = new Mesh();
        }

        var scale = node.scale;
        if(scale){
            mesh.setScale(scale);
        }

        var rotation = node.rotation;
        if(rotation){
            var quaternion = new Quaternion().fromArray(rotation);
            mesh.setQuaternion(quaternion);
        }

        var translation = node.translation;
        if(translation){
            mesh.setPosition(translation);
        }

        var matrix = node.matrix;
        if(matrix){
            mesh.setMatrix(new Matrix4().fromArray(matrix));
        }

        for(var i in node.children){
            var nodeChild = that.gltfObj.nodes[node.children[i]];
            var meshChild = that.nodeToMesh(nodeChild);
            mesh.add(meshChild);
        }

        return mesh;
    }

    meshToGeometry(mesh){
        var that = this;

        var primitive0 = mesh.primitives[0];
        var attributes = primitive0.attributes;

        var positionAccessorIndex = attributes.POSITION;
        var positionAccessor = that.gltfObj.accessors[positionAccessorIndex];
        var positionBufferViewIndex = positionAccessor.bufferView;
        var positionBufferView = that.gltfObj.bufferViews[positionBufferViewIndex];
        var positionData = that.getDataByBufferView(positionBufferView,positionAccessor);

        var normalAccessorIndex = attributes.NORMAL;
        var normalAccessor = that.gltfObj.accessors[normalAccessorIndex];
        var normalBufferViewIndex = normalAccessor.bufferView;
        var normalBufferView = that.gltfObj.bufferViews[normalBufferViewIndex];
        var normalData = that.getDataByBufferView(normalBufferView,normalAccessor);

        //TEXCOORD_0
        var uv0AccessorIndex = attributes.TEXCOORD_0;
        var uv0Accessor = that.gltfObj.accessors[uv0AccessorIndex];
        var uv0BufferViewIndex = uv0Accessor.bufferView;
        var uv0BufferView = that.gltfObj.bufferViews[uv0BufferViewIndex];
        var uv0Data = that.getDataByBufferView(uv0BufferView,uv0Accessor);

        var indicesData = null;
        var indicesAccessorIndex = primitive0.indices;

        if(indicesAccessorIndex != undefined){
            var indicesAccessor = that.gltfObj.accessors[indicesAccessorIndex];
            var indicesBufferViewIndex = indicesAccessor.bufferView;
            var indicesBufferView = that.gltfObj.bufferViews[indicesBufferViewIndex];
            indicesData = that.getDataByBufferView(indicesBufferView,indicesAccessor);
        }

        var materialIndex = primitive0.material;
        var materialObj = that.gltfObj.materials[materialIndex];

        if(materialObj.pbrMetallicRoughness.baseColorTexture){
            var baseColorTextureIndex = materialObj.pbrMetallicRoughness.baseColorTexture.index;
            var textureObj = that.gltfObj.textures[baseColorTextureIndex];
            var imageIndex = textureObj.source;
            var imageObj = that.gltfObj.images[imageIndex];
            var imageUri = imageObj.uri;

            var dataUriRegexResult = imageObj.uri.match( that.dataUriRegex );
            if(!dataUriRegexResult){
                imageUri = that.urlBase + imageObj.uri;
            }

            var samplerIndex = textureObj.sampler;
            var sampler = that.gltfObj.samplers[samplerIndex];

            var image = new Image();
            image.crossOrigin = "anonymous";
            image.src= imageUri;

            var texture = new COOL.Texture({
                image:image,
                //这两个参数有问题，有的9729 9986是什么东西
                // magFilter: sampler.magFilter,
                // minFilter: sampler.minFilter,
                wrapS: sampler.wrapS,
                wrapT: sampler.wrapT,
            });
        }


        var material = new COOL.MeshLambertMaterial({map:texture});

        return [
            new Geometry({
                vertices: positionData,
                indices: indicesData,
                normal:normalData,
                uv:uv0Data
            }),
            material
        ];
    }

    getDataByBufferView(bufferView, accessor){
        var that = this;
        var bufferIndex = bufferView.buffer;

        var byteLength = bufferView.byteLength || 0;
        var byteOffset = bufferView.byteOffset || 0;

        var buffer = that.gltfObj.buffers[bufferIndex];
        var bufferDataUri = that.urlBase + buffer.uri;

        var arrayBuffer = that.arrayBuffers[bufferIndex];

        var cur_buffer = arrayBuffer.slice( byteOffset, byteOffset + byteLength );

        var array = null;
        var itemSize = null;

        var accessorByteOffset = accessor.byteOffset || 0;

        if(accessor.type == 'SCALAR'){
            itemSize = 1;
        }else if(accessor.type == 'VEC2'){
            itemSize = 2;
        }else if(accessor.type == 'VEC3'){
            itemSize = 3;
        }else if(accessor.type == 'VEC4'){
            itemSize = 4;
        }else{
            console.warn('accessor.type undefined');
        }

        if(accessor.componentType == 5126){
            array = new Float32Array( cur_buffer, accessorByteOffset, accessor.count * itemSize );
        }else if(accessor.componentType == 5123){
            array = new Uint16Array( cur_buffer, accessorByteOffset, accessor.count * itemSize );
        }else if(accessor.componentType == 5120){
            array = new Int8Array( cur_buffer, accessorByteOffset, accessor.count * itemSize );
        }else if(accessor.componentType == 5121){
            array = new Uint8Array( cur_buffer, accessorByteOffset, accessor.count * itemSize );
        }else if(accessor.componentType == 5122){
            array = new Int16Array( cur_buffer, accessorByteOffset, accessor.count * itemSize );
        }else if(accessor.componentType == 5125){
            array = new Uint32Array( cur_buffer, accessorByteOffset, accessor.count * itemSize );
        }else{
            console.warn('accessor.componentType undefined');
        }

        return array;


    }

    base64ToArrayBuffer(dataUriRegexResult){

        var data = dataUriRegexResult[ 3 ];
        data = decodeURIComponent( data );
        data = atob( data );

        try {

            var view = new Uint8Array( data.length );
            for ( var i = 0; i < data.length; i ++ ) {
                view[ i ] = data.charCodeAt( i );
            }

            var arrayBuffer = view.buffer;
            return arrayBuffer;

        } catch ( error ) {
            return null;
        }
    }

}

export default GLTFLoader;
