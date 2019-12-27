var Interpolant = function( parameterPositions, sampleValues, sampleSize, resultBuffer ) {

    this.parameterPositions = parameterPositions;
    this._cachedIndex = 0;

    this.resultBuffer = resultBuffer !== undefined ?
        resultBuffer : new sampleValues.constructor( sampleSize );
    this.sampleValues = sampleValues;
    this.valueSize = sampleSize;

};

export default Interpolant;
