//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const R = require('Reactive');
const A = require('Animation');
const P = require('Patches');
const I = require('Instruction');

import { sleep } from './util';



//////////////////////////////////////////////////////////////////////////
// Character

export class Character {
    constructor(app) {
        this.app = app;

        this.playerCaptured = false;

    }

    init(){
        P.inputs.setScalar('captureInitMoves', 0);
        P.inputs.setBoolean('playerCaptured', false);
        
    }

    show(){
        this.app.assets['cameraLongDelay'].hidden = false;
        this.app.assets['cameraCheckerboard'].hidden = false;

    }

    hide(){
        this.app.assets['cameraWhiteOut'].hidden = true;
        this.app.assets['cameraLongDelay'].hidden = true;
        this.app.assets['cameraCheckerboard'].hidden = true;
        this.app.assets['captureMoves'].hidden = true;
        this.app.assets['cameraWhiteBkg'].hidden = true;

    }

    async capture(){
        I.bind(false, 'tap_to_reply');

        this.app.assets['cameraWhiteOut'].hidden = false;
        this.app.assets['cameraWhiteBkg'].hidden = false;
    
        let driver = A.timeDriver({durationMilliseconds: 300});
        let sampler = A.samplers.linear(1, 0);
        this.app.assets['cameraWhiteOutMaterial'].opacity = A.animate(driver, sampler);
        driver.start();
    
        await P.inputs.setScalar('captureInitMoves', 1);
        await P.inputs.setPulse('captureMoves', R.once());
    
        this.app.assets['cameraLongDelay'].hidden = true;
        this.app.assets['captureMoves'].hidden = false;
    
        this.playerCaptured = true;
        await P.inputs.setBoolean('playerCaptured', this.playerCaptured);
    
        await sleep(700);
    
        this.app.picker.selectIndex('play');

        return;

    }
    
}
