//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// P.L.U.R
// @afrosquared | @rufuss12 | Monro Productions
// Spark AR Studio v94
// Instagram | https://www.instagram.com/a/r/?effect_id=



//////////////////////////////////////////////////////////////////////////
// require/import

const S = require('Scene');
const R = require('Reactive');
const M = require('Materials');
const TX = require('Textures');
const D = require('Diagnostics');
const T = require('Time');
const P = require('Patches');
const I = require('Instruction');

import { sleep } from './util';
import { PlaneTracker } from './planeTracker';
import { CameraInfoPosition } from './cameraInfoPosition';
import { Keyboard } from './keyboard';
import { Character } from './character';
import { Picker, Slider } from './nui';
import { Face } from './face';



//////////////////////////////////////////////////////////////////////////
//constants

const notesTotal = 29;
const notesEffectsPoolTotal = 3;



//////////////////////////////////////////////////////////////////////////
//preload

var preload = [
    { id: 'deviceScreenSize', promise: P.outputs.getPoint2D('deviceScreenSize') },
    { id: 'deviceScreenScale', promise: P.outputs.getScalar('deviceScreenScale') },
    { id: 'faceTracker', promise: S.root.findFirst('faceTracker') },
    { id: 'faceTrackerContainer', promise: S.root.findFirst('faceTrackerContainer') },
    { id: 'faceTrackerObjects', promise: S.root.findFirst('faceTrackerObjects') },
    { id: 'planeTracker', promise: S.root.findFirst('planeTracker') },
    { id: 'container', promise: S.root.findFirst('container') },
    { id: 'scaler', promise: S.root.findFirst('scaler') },
    { id: 'scene', promise: S.root.findFirst('scene') },
    { id: 'scenePlanes', promise: S.root.findFirst('scenePlanes') },
    { id: 'sceneBkgPlanes', promise: S.root.findFirst('sceneBkgPlanes') },
    { id: 'cameraWhiteOut', promise: S.root.findFirst('cameraWhiteOut') },
    { id: 'cameraLongDelay', promise: S.root.findFirst('cameraLongDelay') },
    { id: 'cameraCheckerboard', promise: S.root.findFirst('cameraCheckerboard') },
    { id: 'captureMoves', promise: S.root.findFirst('captureMoves') },
    { id: 'cameraWhiteBkg', promise: S.root.findFirst('cameraWhiteBkg') },
    { id: 'playerMoves', promise: S.root.findFirst('playerMoves') },
    { id: 'dancefloor', promise: S.root.findFirst('dancefloor') },
    { id: 'dancefloorTitle', promise: S.root.findFirst('dancefloorTitle') },
    { id: 'dancefloorReady', promise: S.root.findFirst('dancefloorReady') },
    { id: 'dancefloorScore', promise: S.root.findFirst('dancefloorScore') },
    { id: 'dancefloorNoteCatcherEmitter', promise: S.root.findFirst('dancefloorNoteCatcherEmitter') },
    { id: 'keyboardCenterVertical', promise: S.root.findFirst('keyboardCenterVertical') },
    { id: 'keyboardCenterHorizontal', promise: S.root.findFirst('keyboardCenterHorizontal') },
    { id: 'notesHorizontal', promise: S.root.findFirst('notesHorizontal') },
    { id: 'notesVertical', promise: S.root.findFirst('notesVertical') },
    { id: 'notesParticles', promise: S.root.findFirst('notesParticles') },
    { id: 'notesEffects', promise: S.root.findFirst('notesEffects') },
    { id: 'noteCatcher', promise: S.root.findFirst('noteCatcher') },
    { id: 'noteCatcherNull', promise: S.root.findFirst('noteCatcherNull') },
    { id: 'noteCatcherEmitter', promise: S.root.findFirst('noteCatcherEmitter') },
    { id: 'dancefloorScoreStars', promise: S.root.findFirst('dancefloorScoreStars') },
    { id: 'dancefloorScoreStar0', promise: S.root.findFirst('dancefloorScoreStar0') },
    { id: 'dancefloorScoreStar1', promise: S.root.findFirst('dancefloorScoreStar1') },
    { id: 'dancefloorScoreStar2', promise: S.root.findFirst('dancefloorScoreStar2') },
    { id: 'dancefloorScoreStar0Emitter', promise: S.root.findFirst('dancefloorScoreStar0Emitter') },
    { id: 'dancefloorScoreStar1Emitter', promise: S.root.findFirst('dancefloorScoreStar1Emitter') },
    { id: 'dancefloorScoreStar2Emitter', promise: S.root.findFirst('dancefloorScoreStar2Emitter') },
    { id: 'cameraWhiteOutMaterial', promise: M.findFirst('cameraWhiteOut') },
    { id: 'noteCatcherBarMaterial', promise: M.findFirst('noteCatcherBar') },
    { id: 'dancefloorScoreStar0Material', promise: M.findFirst('dancefloorScoreStar0') },
    { id: 'dancefloorScoreStar1Material', promise: M.findFirst('dancefloorScoreStar1') },
    { id: 'dancefloorScoreStar2Material', promise: M.findFirst('dancefloorScoreStar2') },
    { id: 'picker-play', promise: TX.findFirst('picker-play') },
    { id: 'picker-character', promise: TX.findFirst('picker-character') },
];

for(let i = 0; i < notesEffectsPoolTotal; i++){
    preload.push({ id: 'noteEffect' + i, promise: S.root.findFirst('noteEffect' + i) });
    preload.push({ id: 'noteEffectEmitter' + i, promise: S.root.findFirst('noteEffectEmitter' + i) });
}

for(let i = 0; i < notesTotal; i++){
    preload.push({ id: 'NoteOn-' + i, promise: S.root.findFirst('NoteOn-' + i) });
    preload.push({ id: 'NoteOff-' + i, promise: S.root.findFirst('NoteOff-' + i) });
}



//////////////////////////////////////////////////////////////////////////
//App

const App = {
    //init
    assets: {},

    //vars
    notesTotal: notesTotal,
    notesEffectsPoolTotal: notesEffectsPoolTotal,
    modes: ['play', 'character'],
    mode: 'play',
    instructionSoundShown: false,

    //from script
    deviceScreenSize: null,
    deviceScreenScale: null,

    //nui
    picker: null,
    slider: null,

    init(preload = []) {
        let promises = [];
        preload.forEach((asset, i) => {
            promises.push(asset.promise);
        });
        Promise.all(promises).then(results => this.onLoad(results));

    },

    onLoad(results) {
        results.forEach((promise, i) => {
            this.assets[preload[i].id] = promise;
        });

        this.deviceScreenSize = this.assets['deviceScreenSize'];
        this.deviceScreenSize = this.assets['deviceScreenScale'];

        this.cameraInfoPosition = new CameraInfoPosition(this);
        this.cameraInfoPosition.monitor().then(() => {
            this.keyboard = new Keyboard(this);
            this.character = new Character(this);
            this.planeTracker = new PlaneTracker(this);
            this.picker = new Picker(this);
            this.slider = new Slider(this);
            this.face = new Face(this);

            if(this.cameraInfoPosition.direction == 'front'){
                this.front();
            }else{
                this.back();
            }

        });

    },

    front(){
        I.bind(true, 'switch_camera_view_to_place');

        this.slider.hide();
        this.keyboard.notesReset();
        this.face.show();
        
    },

    back(){
        I.bind(false, 'switch_camera_view_to_place');

        this.face.hide();

        if(!this.planeTracker.planeTrackerStarted){
            this.planeTracker.planeTrackerStarted = true;         
            this.picker.init();
            this.slider.init();
            this.character.init();
            this.keyboard.init();
            this.main();

        }else{
            if(this.mode == 'play'){
                this.slider.show();
            }

        }

    },

    async main(){
    
        this.character.hide();
        this.keyboard.hide();
        await this.keyboard.reset();
              
        if(this.mode == 'character'){
            this.slider.hide();
            this.character.show();
    
            I.bind(true, 'tap_change_character');
    
        }else if(this.mode == 'play'){
            this.slider.show();

            this.keyboard.start();
            this.keyboard.monitor();
            this.keyboard.show();
        
            I.bind(false, 'tap_to_reply');
    
        }

        if(this.mode == 'play' && this.cameraInfoPosition.direction == 'front'){
            I.bind(true, 'switch_camera_view_to_place');
        }    
    
        if(!this.instructionSoundShown){
            this.instructionSoundShown = true;
            I.bind(true, 'effect_include_sound');
    
            T.setTimeout(function () {
                I.bind(false, 'effect_include_sound');
            }, 2000);

        }

        return;

    }

}



//////////////////////////////////////////////////////////////////////////
//App init
App.init(preload);
