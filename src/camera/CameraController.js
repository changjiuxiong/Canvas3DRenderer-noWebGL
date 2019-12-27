
import {Vector3} from "../math/Vector3";

class CameraController {
    constructor(camera) {
        this.camera = camera;

        this.mouse0State = 'up';
        this.mouse1State = 'up';
        this.mouse2State = 'up';

        this.x = -1;
        this.y = -1;

        this.minTilt = 0.1;
        this.maxTilt = 3.04;
    }

    update(){
        var that = this;

        window.addEventListener('mousedown',function (e) {
            // console.log(e.button+' down '+e.clientX+','+e.clientY);
            var dom =  window.document.getElementsByTagName('canvas')[0];
            if(!dom){
                return;
            }
            var rect = dom.getBoundingClientRect();
            if(e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom){
                return;
            }
            if(e.button == 0){
                that.mouse0State = 'down';
            }else if(e.button == 1){
                that.mouse1State = 'down';
            }else if(e.button == 2){
                that.mouse2State = 'down';
            }
        });

        window.addEventListener('mouseup',function (e) {
            // console.log(e.button+' up '+e.clientX+','+e.clientY);
            if(e.button == 0){
                that.mouse0State = 'up';
            }else if(e.button == 1){
                that.mouse1State = 'up';
            }else if(e.button == 2){
                that.mouse2State = 'up';
            }
        });

        window.addEventListener('mousemove',function (e) {
            // console.log(e.button+' move '+e.clientX+','+e.clientY);

            var camera = that.camera;
            if(that.mouse0State == 'down'){
                var deltaX = e.clientX - that.x;
                var deltaY = e.clientY - that.y;

                // var angle = Math.sqrt(deltaX*deltaX + deltaY*deltaY)/80;
                //
                // var upV3 = new Vector3(camera.up);
                // var rightV3 = new Vector3(camera.right);
                //
                // var axisV3 = new Vector3().addVectors( new Vector3().scaleVectors(upV3,deltaX) , new Vector3().scaleVectors(rightV3,deltaY)).normalize();
                //
                // var oldPositionV3 = new Vector3(camera.position);
                // var newPositionV3 = new Vector3().rotateByVector(oldPositionV3, axisV3, angle);
                // var newPosition = newPositionV3.toArray();
                //
                // camera.setPosition(newPosition);

                var axisYV3 = new Vector3(0,1,0);
                var angleY = deltaX/200;
                var oldPositionV3 = new Vector3().fromArray(camera.position);
                var newPositionV3 = new Vector3().rotateByVector(oldPositionV3, axisYV3, angleY);
                var newPosition = newPositionV3.toArray();
                camera.setPosition(newPosition);


                var angleX = deltaY/200;
                var tilt = that.getTilt();
                var endTilt = tilt - angleX;

                if(endTilt<that.maxTilt && endTilt>that.minTilt){

                    var axisXV3 = new Vector3(camera.right[0], camera.right[1], camera.right[2]);
                    oldPositionV3 = new Vector3().fromArray(camera.position);
                    newPositionV3 = new Vector3().rotateByVector(oldPositionV3, axisXV3, angleX);
                    newPosition = newPositionV3.toArray();
                    camera.setPosition(newPosition);
                }

            }

            if(that.mouse2State == 'down'){
                var deltaX = e.clientX - that.x;
                var deltaY = e.clientY - that.y;

                var tempUp = new Vector3().crossVectors(new Vector3().fromArray(camera.right), new Vector3().fromArray(camera.direction));
                var axisYV3 = tempUp;

                var oldTargetV3 = new Vector3().fromArray(camera.target);
                var newTargetV3 = new Vector3().addVectors(oldTargetV3, new Vector3().scaleVectors(axisYV3, deltaY/30));
                var newTargetV3 = newTargetV3.toArray();
                camera.setTarget(newTargetV3);

                var oldPositionV3 = new Vector3().fromArray(camera.position);
                var newPositionV3 = new Vector3().addVectors(oldPositionV3, new Vector3().scaleVectors(axisYV3, deltaY/30));
                var newPosition = newPositionV3.toArray();
                camera.setPosition(newPosition);

                var axisXV3 = new Vector3().fromArray(camera.right);

                oldTargetV3 = new Vector3().fromArray(camera.target);
                newTargetV3 = new Vector3().addVectors(oldTargetV3, new Vector3().scaleVectors(axisXV3, -deltaX/30));
                newTargetV3 = newTargetV3.toArray();
                camera.setTarget(newTargetV3);

                oldPositionV3 = new Vector3().fromArray(camera.position);
                var newPositionV3 = new Vector3().addVectors(oldPositionV3, new Vector3().scaleVectors(axisXV3, -deltaX/30));
                newPosition = newPositionV3.toArray();
                camera.setPosition(newPosition);

            }

            that.x = e.clientX;
            that.y = e.clientY;
        });

        window.addEventListener('mousewheel',function (e) {
            // console.log(e.button+' wheel '+e.wheelDelta);

            var camera = that.camera;

            var delta = e.wheelDelta;

            if(delta == 0 || typeof(delta) != 'number'){
                return;
            }
            delta = Math.abs(delta)/delta;

            var directionV3 = new Vector3().fromArray(camera.direction);

            var oldPositionV3 = new Vector3().fromArray(camera.position);
            var dis = oldPositionV3.lengthSq();
            dis = Math.sqrt(dis);
            var newPositionV3 = new Vector3().addVectors(oldPositionV3, new Vector3().scaleVectors(directionV3, dis/10*delta));
            var newPosition = newPositionV3.toArray();

            camera.setPosition(newPosition);

        });
    }

    getTilt(){
        var camera = this.camera;
        var dir = camera.direction;
        var axixY = new Vector3(0,-1,0);
        var dirV3 = new Vector3().fromArray(dir);

        var tilt = axixY.angleTo(dirV3);
        return tilt;

    }
}

export default CameraController;
