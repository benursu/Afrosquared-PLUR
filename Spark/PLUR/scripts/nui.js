//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const NUI = require('NativeUI');
const P = require('Patches');



//////////////////////////////////////////////////////////////////////////
// Picker

export class Picker {
    constructor(app) {
        this.app = app;

        this.picker = null;

    }

    init(){

        this.picker = NUI.picker;

        let icons = [];
        this.app.modes.forEach((mode, i) => {
            icons.push({image_texture: this.app.assets['picker-' + mode]});
        });

        const index = 0;
        const configuration = {
          selectedIndex: index,
          items: icons
        };
        
        this.picker.configure(configuration);
        this.picker.visible = true;
    
        this.picker.selectedIndex.monitor().subscribe(e => {
            this.app.mode = this.app.modes[e.newValue];
            this.app.main();
        });        

    }

    hide(){
        this.picker.visible = false;

    }

    selectIndex(mode = 'play'){
        if(mode == 'play'){
            this.picker.selectedIndex = 0;
        }else if(mode == 'character'){
            this.picker.selectedIndex = 1;
        }
        
    }

}



//////////////////////////////////////////////////////////////////////////
// Slider

export class Slider {
    constructor(app) {
        this.app = app;

        this.slider = null;

    }

    init(){
        this.slider = NUI.slider;
        this.slider.visible = true;

        this.slider.value.monitor().subscribe(e => {
            if(this.app.mode == 'play'){
                this.app.assets['noteCatcher'].transform.x = (e.newValue - 0.5) * this.app.keyboard.notesRangeXEnd;
                this.app.assets['noteCatcherNull'].transform.x = (e.newValue) * this.app.keyboard.notesRangeXEnd;
    
            }
            
        });

    }

    async show(){
        this.slider.visible = true;
        this.slider.value = 0.5;
        await P.inputs.setScalar('sliderValue', this.slider.value);

        return;
        
    }

    hide(){
        if(this.slider != null){
            this.slider.visible = false;

        }

    }

}
