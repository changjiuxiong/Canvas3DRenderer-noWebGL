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

import {Vector2} from "./math/Vector2";
import {Vector3} from "./math/Vector3";

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

COOL.AmbientLight = AmbientLight;
COOL.DirectionalLight = DirectionalLight;

COOL.Geometry = Geometry;
COOL.BoxGeometry = BoxGeometry;
COOL.SphereGeometry = SphereGeometry;

// COOL.GLTFLoader = _GLTFLoader;
COOL.GLTFLoader2 = GLTFLoader;

COOL.Vector2 = Vector2;
COOL.Vector3 = Vector3;


