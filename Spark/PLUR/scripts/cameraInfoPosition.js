//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const CI = require('CameraInfo');



//////////////////////////////////////////////////////////////////////////
// CameraInfoPosition

export class CameraInfoPosition {
    constructor(app) {
        this.app = app;

        this.direction = null;
        this.initialValue = true;
    }

    monitor(){
        return new Promise(resolve => {
            CI.captureDevicePosition.monitor({fireOnInitialValue: true}).subscribe(e => {
                if(e.newValue == 'FRONT'){
                    this.direction = 'front';
                    if(!this.initialValue){
                        this.app.front();
                    }
        
                }else{
                    this.direction = 'back';
                    if(!this.initialValue){
                        this.app.back();
                    }
        
                }
                this.initialValue = false;
                resolve();
            });
        });

    }
}
