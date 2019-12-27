/**
 * @author mrdoob / http://mrdoob.com/
 */

import LoadingManager from "./LoadingManager";


function TextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : new LoadingManager();

}

Object.assign( TextureLoader.prototype, {

    crossOrigin: 'anonymous',

    load: function ( url, onLoad, onProgress, onError ) {

        // var texture = new Texture();

        if ( onLoad !== undefined ) {

            onLoad( null );

        }

        return null;

    },

    setCrossOrigin: function ( value ) {

        this.crossOrigin = value;
        return this;

    },

    setPath: function ( value ) {

        this.path = value;
        return this;

    }

} );


export default TextureLoader;
