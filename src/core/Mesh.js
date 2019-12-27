import BoxGeometry from "./BoxGeometry.js";
import Material from "../material/Material.js";
import {Matrix4} from "../math/Matrix4";
import {Euler} from "../math/Euler";
import {Quaternion} from "../math/Quaternion";
import {Vector3} from "../math/Vector3";
import { Vector2 } from '../math/Vector2.js';
import {Ray} from "../math/Ray";

import { Sphere } from '../math/Sphere.js';
import { Triangle } from '../math/Triangle.js';
import { Face3 } from '../core/Face3.js';
import {Box3} from "../math/Box3";



class Mesh {
    constructor(param) {
        this.type = 'Mesh';
        param = param || {};
        this.geometry = param.geometry;
        this.material = param.material || new Material();

        this.position = param.position || [0,0,0];
        this.rotation = param.rotation || new Euler();
        this.scale = param.scale || [1,1,1];

        this.quaternion = new Quaternion().setFromEuler( this.rotation, false );

        this.children = [];
        this.parent = null;

        this.matrix = new Matrix4();
        this.matrixWorld = new Matrix4();
        this.updateMatrix();

    }

    setPosition(position){
        this.position = position;
        this.updateMatrix();
    }

    setRotation(rotationArray){
        this.rotation = new Euler().fromArray(rotationArray);
        var quaternion = new Quaternion().setFromEuler( this.rotation, false );
        this.setQuaternion(quaternion);
    }

    setQuaternion(quaternion){

        this.quaternion = quaternion;
        this.rotation.setFromQuaternion( quaternion, undefined, false );
        this.updateMatrix();
    }

    setScale(scaleArray){
        this.scale = scaleArray;
        this.updateMatrix();
    }

    updateMatrix(){
        this.matrix.compose( new Vector3().fromArray(this.position), this.quaternion, new Vector3().fromArray(this.scale) );
        this.updateMatrixWorld ();
    }

    setMatrix(matrix){
        this.matrix = matrix;
        this.updateMatrixWorld ();
    }

    updateMatrixWorld () {

        // this.updateMatrix();

        if ( this.parent === null ) {

            this.matrixWorld = this.matrix.clone();

        } else {

            this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

        }

        this.updateChildrenMatrixWorld();

    }

    getWorldPosition() {

        var target = new Vector3();

        // this.updateMatrixWorld();

        return target.setFromMatrixPosition( this.matrixWorld );

    }

    updateChildrenMatrixWorld(){

        for(var i in this.children){
            this.children[i].updateMatrixWorld();
        }

    }

    clone(){
        var mesh = new Mesh({
            geometry: this.geometry.clone(),
            material: this.material.clone(),
            position: this.position.slice(0),
            rotation: this.rotation.clone(),
            scale: this.scale.slice(0)
        });

        return mesh;
    }

    add(mesh){
        this.children.push(mesh);
        mesh.parent = this;
        mesh.updateMatrix();
    }

    rotateOnAxis (axis, angle) {

        var q1 = new Quaternion();
        q1.setFromAxisAngle( axis, angle );
        var quaternion = this.quaternion.multiply( q1 );
        this.setQuaternion(quaternion);

    }

    rotateX (angle) {

        this.rotateOnAxis( new Vector3(1,0,0), angle );

    }

    rotateY (angle) {

        this.rotateOnAxis( new Vector3(0,1,0), angle );

    }

    rotateZ (angle) {

        this.rotateOnAxis( new Vector3(0,0,1), angle );

    }



    raycast( raycaster, intersects ) {

        var that = this;

        var inverseMatrix = new Matrix4();
        var ray = new Ray();
        var sphere = new Sphere();

        var vA = new Vector3();
        var vB = new Vector3();
        var vC = new Vector3();

        var tempA = new Vector3();
        var tempB = new Vector3();
        var tempC = new Vector3();

        var uvA = new Vector2();
        var uvB = new Vector2();
        var uvC = new Vector2();

        var intersectionPoint = new Vector3();
        var intersectionPointWorld = new Vector3();

        function checkIntersection( object, material, raycaster, ray, pA, pB, pC, point ) {

            var intersect;

            if ( material.side === BackSide ) {

                intersect = ray.intersectTriangle( pC, pB, pA, true, point );

            } else {

                intersect = ray.intersectTriangle( pA, pB, pC, material.side !== DoubleSide, point );

            }

            if ( intersect === null ) return null;

            intersectionPointWorld.copy( point );
            intersectionPointWorld.applyMatrix4( object.matrixWorld );

            var distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );

            if ( distance < raycaster.near || distance > raycaster.far ) return null;

            return {
                distance: distance,
                point: intersectionPointWorld.clone(),
                object: object
            };

        }

        function checkBufferGeometryIntersection( object, material, raycaster, ray, position, uv, a, b, c ) {

            vA.fromBufferAttribute( position, a );
            vB.fromBufferAttribute( position, b );
            vC.fromBufferAttribute( position, c );

            var intersection = checkIntersection( object, material, raycaster, ray, vA, vB, vC, intersectionPoint );

            if ( intersection ) {

                if ( uv ) {

                    uvA.fromBufferAttribute( uv, a );
                    uvB.fromBufferAttribute( uv, b );
                    uvC.fromBufferAttribute( uv, c );

                    intersection.uv = Triangle.getUV( intersectionPoint, vA, vB, vC, uvA, uvB, uvC, new Vector2() );

                }

                var face = new Face3( a, b, c );
                Triangle.getNormal( vA, vB, vC, face.normal );

                intersection.face = face;

            }

            return intersection;

        }

        var geometry = this.geometry;
        var material = this.material;
        var matrixWorld = this.matrixWorld;

        if ( material === undefined ) return;

        // Checking boundingSphere distance to ray

        if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

        sphere.copy( geometry.boundingSphere );
        sphere.applyMatrix4( matrixWorld );

        var box3 = new Box3().copy(geometry.boundingBox);
        box3.applyMatrix4( matrixWorld );

        // raycaster.ray.intersectsSphere( sphere ) ||
        if ( raycaster.ray.intersectsBox( box3 ) ) {
            var worldPosition = new Vector3().setFromMatrixPosition( this.matrixWorld );
            that.distance = raycaster.ray.origin.distanceTo( worldPosition );
            intersects.push(that);
        }

        //
        // inverseMatrix.getInverse( matrixWorld );
        // ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );
        //
        // // Check boundingBox before continuing
        //
        // if ( geometry.boundingBox !== null ) {
        //
        //     if ( ray.intersectsBox( geometry.boundingBox ) === false ) return;
        //
        // }
        //
        // var intersection;
        //
        // if ( geometry.isBufferGeometry ) {
        //
        //     var a, b, c;
        //     var index = geometry.index;
        //     var position = geometry.attributes.position;
        //     var uv = geometry.attributes.uv;
        //     var groups = geometry.groups;
        //     var drawRange = geometry.drawRange;
        //     var i, j, il, jl;
        //     var group, groupMaterial;
        //     var start, end;
        //
        //     if ( index !== null ) {
        //
        //         // indexed buffer geometry
        //
        //         if ( Array.isArray( material ) ) {
        //
        //             for ( i = 0, il = groups.length; i < il; i ++ ) {
        //
        //                 group = groups[ i ];
        //                 groupMaterial = material[ group.materialIndex ];
        //
        //                 start = Math.max( group.start, drawRange.start );
        //                 end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );
        //
        //                 for ( j = start, jl = end; j < jl; j += 3 ) {
        //
        //                     a = index.getX( j );
        //                     b = index.getX( j + 1 );
        //                     c = index.getX( j + 2 );
        //
        //                     intersection = checkBufferGeometryIntersection( this, groupMaterial, raycaster, ray, position, uv, a, b, c );
        //
        //                     if ( intersection ) {
        //
        //                         intersection.faceIndex = Math.floor( j / 3 ); // triangle number in indexed buffer semantics
        //                         intersects.push( intersection );
        //
        //                     }
        //
        //                 }
        //
        //             }
        //
        //         } else {
        //
        //             start = Math.max( 0, drawRange.start );
        //             end = Math.min( index.count, ( drawRange.start + drawRange.count ) );
        //
        //             for ( i = start, il = end; i < il; i += 3 ) {
        //
        //                 a = index.getX( i );
        //                 b = index.getX( i + 1 );
        //                 c = index.getX( i + 2 );
        //
        //                 intersection = checkBufferGeometryIntersection( this, material, raycaster, ray, position, uv, a, b, c );
        //
        //                 if ( intersection ) {
        //
        //                     intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indexed buffer semantics
        //                     intersects.push( intersection );
        //
        //                 }
        //
        //             }
        //
        //         }
        //
        //     } else if ( position !== undefined ) {
        //
        //         // non-indexed buffer geometry
        //
        //         if ( Array.isArray( material ) ) {
        //
        //             for ( i = 0, il = groups.length; i < il; i ++ ) {
        //
        //                 group = groups[ i ];
        //                 groupMaterial = material[ group.materialIndex ];
        //
        //                 start = Math.max( group.start, drawRange.start );
        //                 end = Math.min( ( group.start + group.count ), ( drawRange.start + drawRange.count ) );
        //
        //                 for ( j = start, jl = end; j < jl; j += 3 ) {
        //
        //                     a = j;
        //                     b = j + 1;
        //                     c = j + 2;
        //
        //                     intersection = checkBufferGeometryIntersection( this, groupMaterial, raycaster, ray, position, uv, a, b, c );
        //
        //                     if ( intersection ) {
        //
        //                         intersection.faceIndex = Math.floor( j / 3 ); // triangle number in non-indexed buffer semantics
        //                         intersects.push( intersection );
        //
        //                     }
        //
        //                 }
        //
        //             }
        //
        //         } else {
        //
        //             start = Math.max( 0, drawRange.start );
        //             end = Math.min( position.count, ( drawRange.start + drawRange.count ) );
        //
        //             for ( i = start, il = end; i < il; i += 3 ) {
        //
        //                 a = i;
        //                 b = i + 1;
        //                 c = i + 2;
        //
        //                 intersection = checkBufferGeometryIntersection( this, material, raycaster, ray, position, uv, a, b, c );
        //
        //                 if ( intersection ) {
        //
        //                     intersection.faceIndex = Math.floor( i / 3 ); // triangle number in non-indexed buffer semantics
        //                     intersects.push( intersection );
        //
        //                 }
        //
        //             }
        //
        //         }
        //
        //     }
        //
        // } else if ( geometry.isGeometry ) {
        //
        //     var fvA, fvB, fvC;
        //     var isMultiMaterial = Array.isArray( material );
        //
        //     var vertices = geometry.vertices;
        //     var faces = geometry.faces;
        //     var uvs;
        //
        //     var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
        //     if ( faceVertexUvs.length > 0 ) uvs = faceVertexUvs;
        //
        //     for ( var f = 0, fl = faces.length; f < fl; f ++ ) {
        //
        //         var face = faces[ f ];
        //         var faceMaterial = isMultiMaterial ? material[ face.materialIndex ] : material;
        //
        //         if ( faceMaterial === undefined ) continue;
        //
        //         fvA = vertices[ face.a ];
        //         fvB = vertices[ face.b ];
        //         fvC = vertices[ face.c ];
        //
        //         if ( faceMaterial.morphTargets === true ) {
        //
        //             var morphTargets = geometry.morphTargets;
        //             var morphInfluences = this.morphTargetInfluences;
        //
        //             vA.set( 0, 0, 0 );
        //             vB.set( 0, 0, 0 );
        //             vC.set( 0, 0, 0 );
        //
        //             for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {
        //
        //                 var influence = morphInfluences[ t ];
        //
        //                 if ( influence === 0 ) continue;
        //
        //                 var targets = morphTargets[ t ].vertices;
        //
        //                 vA.addScaledVector( tempA.subVectors( targets[ face.a ], fvA ), influence );
        //                 vB.addScaledVector( tempB.subVectors( targets[ face.b ], fvB ), influence );
        //                 vC.addScaledVector( tempC.subVectors( targets[ face.c ], fvC ), influence );
        //
        //             }
        //
        //             vA.add( fvA );
        //             vB.add( fvB );
        //             vC.add( fvC );
        //
        //             fvA = vA;
        //             fvB = vB;
        //             fvC = vC;
        //
        //         }
        //
        //         intersection = checkIntersection( this, faceMaterial, raycaster, ray, fvA, fvB, fvC, intersectionPoint );
        //
        //         if ( intersection ) {
        //
        //             if ( uvs && uvs[ f ] ) {
        //
        //                 var uvs_f = uvs[ f ];
        //                 uvA.copy( uvs_f[ 0 ] );
        //                 uvB.copy( uvs_f[ 1 ] );
        //                 uvC.copy( uvs_f[ 2 ] );
        //
        //                 intersection.uv = Triangle.getUV( intersectionPoint, fvA, fvB, fvC, uvA, uvB, uvC, new Vector2() );
        //
        //             }
        //
        //             intersection.face = face;
        //             intersection.faceIndex = f;
        //             intersects.push( intersection );
        //
        //         }
        //
        //     }
        //
        // }

    }



}

export default Mesh;
