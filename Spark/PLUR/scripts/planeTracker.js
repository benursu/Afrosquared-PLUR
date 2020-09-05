//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const TG = require('TouchGestures');
const R = require('Reactive');
const I = require('Instruction');



//////////////////////////////////////////////////////////////////////////
// PlaneTracker

export class PlaneTracker {
    constructor(app) {
        this.app = app;

        this.planeTracker = this.app.assets['planeTracker'];
        this.container = this.app.assets['container'];

        this.planeTrackerStarted = false;
        this.planeTrackerInstructionUnderstood = false;

        TG.onTap().subscribe(gesture => {
            if(this.app.mode == 'character'){
                this.app.character.capture();
            
            }else if(this.app.mode == 'play' && this.app.cameraInfoPosition.direction == 'back'){
                if(this.app.keyboard.musicPlaybackComplete){
                    this.app.keyboard.restart();
    
                }else{
                    this.planeTracker.trackPoint(gesture.location);
    
                }
                
            }
    
        });  
    
        TG.onPinch().subscribeWithSnapshot({ 'container.transform.scaleX': this.container.transform.scaleX, 'container.transform.scaleY': this.container.transform.scaleY, 'container.transform.scaleZ': this.container.transform.scaleZ }, (gesture, snapshots) => {
            if((this.app.mode == 'character' || this.app.mode == 'play') && this.app.cameraInfoPosition.direction == 'back'){
                if(!this.planeTrackerInstructionUnderstood){
                    this.planeTrackerInstructionUnderstood = true;
                    I.bind(false, 'use_2_fingers_to_rotate');
                }
    
                var lastScaleX = snapshots['container.transform.scaleX'];
                this.container.transform.scaleX = R.mul(lastScaleX, gesture.scale);
                
                var lastScaleY = snapshots['container.transform.scaleY'];
                this.container.transform.scaleY = R.mul(lastScaleY, gesture.scale);
                
                var lastScaleZ = snapshots['container.transform.scaleZ'];
                this.container.transform.scaleZ = R.mul(lastScaleZ, gesture.scale);
    
            }
    
        });
    
        TG.onRotate().subscribeWithSnapshot({ 'container.transform.rotationY': this.container.transform.rotationY }, (gesture, snapshots) => {
            if((this.app.mode == 'character' || this.app.mode == 'play') && this.app.cameraInfoPosition.direction == 'back'){
                if(!this.planeTrackerInstructionUnderstood){
                    this.planeTrackerInstructionUnderstood = true;
                    I.bind(false, 'use_2_fingers_to_rotate');
                }
    
                var lastRotationY = snapshots['container.transform.rotationY'];
                this.container.transform.rotationY = R.add(lastRotationY, R.mul(-1, gesture.rotation));
    
            }
    
        });

    }
    
}