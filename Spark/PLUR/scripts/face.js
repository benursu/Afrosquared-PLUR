//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const FT = require('FaceTracking');
const R = require('Reactive');



//////////////////////////////////////////////////////////////////////////
// Face

export class Face {
    constructor(app) {
        this.app = app;

        const face = FT.face(0);
        this.app.assets['faceTrackerObjects'].hidden = R.not(face.isTracked);

    }

    show(){
        this.app.assets['faceTrackerContainer'].hidden = false;

    }

    hide(){
        this.app.assets['faceTrackerContainer'].hidden = true;

    }
    
}
