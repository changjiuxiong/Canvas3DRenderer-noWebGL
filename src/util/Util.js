import WebGLUtils from "./webgl-utils.js";
import WebGLDebugUtils from "./webgl-debug.js";

const Util = {
    initShaders: function(gl, vshader, fshader) {
        var program = Util.createProgram(gl, vshader, fshader);
        if (!program) {
            console.log('Failed to create program');
            return false;
        }

        gl.useProgram(program);
        gl.program = program;

        return true;
    },

    createProgram: function(gl, vshader, fshader) {
        // Create shader object
        var vertexShader = Util.loadShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = Util.loadShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        // Create a program object
        var program = gl.createProgram();
        if (!program) {
            return null;
        }

        // Attach the shader objects
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Link the program object
        gl.linkProgram(program);

        // Check the result of linking
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            var error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        return program;
    },

    loadShader: function(gl, type, source) {
        // Create shader object
        var shader = gl.createShader(type);
        if (shader == null) {
            console.log('unable to create shader');
            return null;
        }

        // Set the shader program
        gl.shaderSource(shader, source);

        // Compile the shader
        gl.compileShader(shader);

        // Check the result of compilation
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            var error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    },

    getWebGLContext: function(canvas, opt_debug) {
        // Get the rendering context for WebGL
        var gl = WebGLUtils.setupWebGL(canvas);
        if (!gl) return null;

        // if opt_debug is explicitly false, create the context for debugging
        if (arguments.length < 2 || opt_debug) {
            gl = WebGLDebugUtils.makeDebugContext(gl);
        }

        return gl;
    },

    create3DContext : function(canvas, opt_attribs) {
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var context = null;
        for (var ii = 0; ii < names.length; ++ii) {
            try {
                context = canvas.getContext(names[ii], opt_attribs);
            } catch(e) {}
            if (context) {
                break;
            }
        }
        return context;
    }
}

export default Util;