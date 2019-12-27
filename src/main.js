
import Renderer from './core/Renderer.js';
import Mesh from "./core/Mesh.js";
import Camera from "./camera/Camera.js";
import CameraController from "./camera/CameraController.js";
import Scene from "./core/Scene.js";
import Material from "./material/Material";
import Texture from "./material/Texture";
import MeshBasicMaterial from "./material/MeshBasicMaterial";
import MeshLambertMaterial from "./material/MeshLambertMaterial";
import AmbientLight from "./light/AmbientLight";
import DirectionalLight from "./light/DirectionalLight";
import MeshStandardMaterial from "./material/MeshStandardMaterial";
import Geometry from "./core/Geometry";
import BoxGeometry from "./core/BoxGeometry";
import SphereGeometry from "./core/SphereGeometry";

// import _GLTFLoader from "./core/GLTFLoader";
import GLTFLoader from "./core/GLTFLoader2";

import OrthoCamera from "./camera/OrthoCamera";
import Animation from "./animation/Animation";
import {Raycaster} from "./core/Raycaster";

import {Vector2} from "./math/Vector2";
import {Vector3} from "./math/Vector3";
import {ExtrudeGeometry} from "./loader/ExtrudeGeometry";
import {ExtrudeBufferGeometry} from "./loader/ExtrudeGeometry";
import {Shape} from "./extras/core/Shape.js";
import TextGeometry from "./core/TextGeometry";
import CubeTexture from "./material/CubeTexture";


var COOL = window.COOL = {};

COOL.LINEAR = 9729;
COOL.NEAREST = 9728;

COOL.CLAMP_TO_EDGE = 33071;
COOL.REPEAT = 10497;
COOL.MIRRORED_REPEAT = 33648;

COOL.Renderer = Renderer;
COOL.Mesh = Mesh;
COOL.Camera = Camera;
COOL.OrthoCamera = OrthoCamera;
COOL.CameraController = CameraController;
COOL.Scene = Scene;
COOL.Material = Material;
COOL.MeshBasicMaterial = MeshBasicMaterial;
COOL.MeshLambertMaterial = MeshLambertMaterial;
COOL.MeshStandardMaterial = MeshStandardMaterial;

COOL.Texture = Texture;
COOL.CubeTexture = CubeTexture;

COOL.AmbientLight = AmbientLight;
COOL.DirectionalLight = DirectionalLight;

COOL.Geometry = Geometry;
COOL.BoxGeometry = BoxGeometry;
COOL.SphereGeometry = SphereGeometry;

// COOL.GLTFLoader = _GLTFLoader;
COOL.GLTFLoader2 = GLTFLoader;

COOL.Animation = Animation;

COOL.Raycaster = Raycaster;

COOL.Vector2 = Vector2;
COOL.Vector3 = Vector3;

COOL.ExtrudeGeometry = ExtrudeGeometry;
COOL.ExtrudeBufferGeometry = ExtrudeBufferGeometry;
COOL.TextGeometry = TextGeometry;
COOL.Shape = Shape;

