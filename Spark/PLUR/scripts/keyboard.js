//////////////////////////////////////////////////////////////////////////
// require/import

const D = require('Diagnostics');
const A = require('Animation');
const R = require('Reactive');
const T = require('Time');
const P = require('Patches');
const I = require('Instruction');

import { sleep } from './util';



//////////////////////////////////////////////////////////////////////////
// Keyboard

export class Keyboard {
    constructor(app) {
        this.app = app;

        this.musicPlaybackReady = false;
        this.musicPlaybackComplete = false;

        this.notesTotal = this.app.notesTotal;
        this.notesEffectsPoolTotal = this.app.notesEffectsPoolTotal;
        this.notesStart = 53;
        this.notesEnd = 79;
        this.notesDuration = 37500;
        this.notesHeight = 2.002;
        this.notesRangeXStart = 10000;
        this.notesRangeXEnd = 0;
        this.notesParticlesOns = [];
        this.notesParticlesOnsPositionY = [];
        this.notesParticlesOffs = [];
        this.notesParticlesOffsPositionY = [];
        this.notesEffectsPool = [];
        this.notesEffectsPoolAvailable = [];
        this.notesEffectEmitters = [];

        this.keyboardCenterVerticalOffsetEnd = 0.00261;
        this.keyboardCenterOffsetStartOffset = 0.6;
        this.keyboardCenterOffsetDuration = 800;
        this.keyboardCenterHorizontalOffsetEnd = 0.16515;

        this.score = 0;
        this.scoreDistance = 0.03;
        this.scoreChangeLast = 0;
        this.scoreNoteCatcherEmitter = 0;
        this.scoreDancefloorNoteCatcherEmitter = 0;
        this.scoreStarLevel2 = 300;
        this.scoreStarLevel3 = 500;

        this.dancefloorTitleOffset = R.val(-1);
        this.dancefloorReadyOffset = R.val(-1);
        this.dancefloorScoreOffset = R.val(-1);
        this.dancefloorScoreStarsOffset = R.val(-1);

        this.noteCatcherEmitterScoreChangeFactor = 5;
        this.dancefloorNoteCatcherEmitteScoreChangeFactor = 0.55;

        this.playerDistort = 0;
        this.playerDistortSetScalarCount = 0;
        this.playerDistortSetScalarInput = 3;
        this.playerDistortMax = 0.65;
        this.playerDistortDecrease = 0.3;
        this.playerDistortIncrease = 0.1;

        //async tokens
        this.startToken = null;
        this.startDrivers = [];
        this.startDriverSubs = [];            
        this.monitorToken = null;


        //notes emitter
        this.app.assets['noteCatcherEmitter'].sizeModifier = A.samplers.easeInQuad(0.001, 0.0015);
        this.app.assets['noteCatcherEmitter'].birthrate = 0;
        //emitter scale fix
        // this.app.assets['noteCatcherEmitter'].transform.scaleX = R.div(1, this.app.assets['planeTracker'].worldTransform.scaleX);
        // this.app.assets['noteCatcherEmitter'].transform.scaleY = R.div(1, this.app.assets['planeTracker'].worldTransform.scaleY);
        // this.app.assets['noteCatcherEmitter'].transform.scaleZ = R.div(1, this.app.assets['planeTracker'].worldTransform.scaleZ);

    
        for(let i = 0; i < this.notesEffectsPoolTotal; i++){
            const noteEffect = this.app.assets['noteEffect' + i];
            noteEffect.hidden = true;
            noteEffect.transform.y = -10000;
          
            this.notesEffectsPool.push(noteEffect);
            this.notesEffectsPoolAvailable.push(i);
    
            const noteEffectEmitter = this.app.assets['noteEffectEmitter' + i];
            this.notesEffectEmitters.push(noteEffectEmitter);
    
            noteEffectEmitter.hsvaColorModulationModifier = A.samplers.HSVA([A.samplers.constant(1), A.samplers.constant(1), A.samplers.constant(1), A.samplers.linear(1, 0)]);
            noteEffectEmitter.birthrate = 10;

        }
        
        //notes monitor
        for(let i = 0; i < this.notesTotal; i++){
            const notesParticlesOn = this.app.assets['NoteOn-' + i];
            const notesParticlesOff = this.app.assets['NoteOff-' + i];
          
            const id = R.val(i);
          
            const notesParticlesOnPosition = notesParticlesOn.transform.y;
            notesParticlesOnPosition.lt(0).monitor().subscribeWithSnapshot({ 'id': id }, (e, snapshots) => {
                const id = parseInt(snapshots['id']);
                
                if(this.notesEffectsPoolAvailable.length > 0 && this.musicPlaybackReady){
                    const availableID = this.notesEffectsPoolAvailable.pop();
            
                    this.notesEffectsPool[availableID].transform.x = this.notesParticlesOns[id].transform.x;
                    this.notesEffectsPool[availableID].hidden = false;
                    this.notesEffectsPool[availableID].transform.y = 0;
            
                    const notesParticlesOffPosition = this.notesParticlesOffs[id].transform.y;
                    
                    notesParticlesOffPosition.lt(0).monitor().subscribeWithSnapshot({ 'id': R.val(id), 'idPool': R.val(availableID) }, (e, snapshots) => {
                        const idPool = parseInt(snapshots['idPool']);
                        this.notesEffectsPool[idPool].hidden = true;
                        this.notesEffectsPool[idPool].transform.y = -10000;
                        this.notesEffectsPoolAvailable.push(idPool);
            
                    });
            
                }
        
            });
        
            this.notesParticlesOns.push(notesParticlesOn);
            this.notesParticlesOffs.push(notesParticlesOff);
    
            this.notesParticlesOnsPositionY.push(notesParticlesOn.transform.y.pinLastValue());
            this.notesParticlesOffsPositionY.push(notesParticlesOff.transform.y.pinLastValue());
    
            const notesParticlesOnPosX = notesParticlesOn.transform.x.pinLastValue();
            if(notesParticlesOnPosX < this.notesRangeXStart){
                this.notesRangeXStart = notesParticlesOnPosX;
            }
            if(notesParticlesOnPosX > this.notesRangeXEnd){
                this.notesRangeXEnd = notesParticlesOnPosX;
            }
          
        }
    
        //noteCatcher score logic
        for(let i = 0; i < this.notesEffectsPoolTotal; i++){
            this.notesEffectsPool[i].transform.position.distance(this.app.assets['noteCatcherNull'].transform.position).monitor().subscribe(e => {
                if(this.musicPlaybackReady && e.newValue < this.scoreDistance){
                    this.score = this.score + 1;
                    this.app.assets['dancefloorScore'].text = this.score.toString();    
                }
        
            });  
    
        }
    
        //noteCatcherNull wiggle workaround
        this.app.assets['noteCatcherNull'].transform.y = R.sin(T.ms).mul(0.00001);

        //
        this.app.assets['dancefloorNoteCatcherEmitter'].hsvaColorModulationModifier = A.samplers.HSVA([A.samplers.constant(1), A.samplers.constant(1), A.samplers.constant(1), A.samplers.easeInQuart(1, 0.3)]);
        this.app.assets['dancefloorNoteCatcherEmitter'].sizeModifier = A.samplers.linear(0.01, 0.1);
        this.app.assets['dancefloorNoteCatcherEmitter'].birthrate = 0;

    }

    init(){
        P.inputs.setScalar('dancefloorTitleOffset', this.dancefloorTitleOffset);
        P.inputs.setScalar('dancefloorReadyOffset', this.dancefloorReadyOffset);
        P.inputs.setScalar('dancefloorScoreOffset', this.dancefloorScoreOffset);
        P.inputs.setScalar('dancefloorScoreStarsOffset', this.dancefloorScoreStarsOffset);        
        P.inputs.setBoolean('playerWiggle', false);
        P.inputs.setScalar('playerDistort', this.playerDistort);

    }

    show(){
        this.app.assets['planeTracker'].hidden = false;
        this.app.assets['scene'].hidden = false;
        this.app.assets['notesHorizontal'].hidden = false;
        this.app.assets['notesVertical'].hidden = false;
        this.app.assets['noteCatcher'].hidden = false;
        this.app.assets['dancefloor'].hidden = false;
        this.app.assets['playerMoves'].hidden = false;

    }    

    hide(){
        this.app.assets['planeTracker'].hidden = true;
        this.app.assets['scene'].hidden = true;
        this.app.assets['notesHorizontal'].hidden = true;
        this.app.assets['notesVertical'].hidden = true;
        this.app.assets['noteCatcher'].hidden = true;
        this.app.assets['dancefloor'].hidden = true;
        this.app.assets['playerMoves'].hidden = true;

    }    

    start(){
        this.startToken = {};
        this.startAsync(this.startToken);

    }

    async startAsync(token = {}){
        let cancelled = false;
  
        token.cancel = () => {
          cancelled = true;
        }; 

        this.startDrivers = [];
        this.startDriverSubs = [];    
    
        await P.inputs.setScalar('dancefloorTitleOffset', -1);
        await P.inputs.setScalar('dancefloorReadyOffset', -1);
        await P.inputs.setScalar('dancefloorScoreOffset', -1); 
        await P.inputs.setScalar('dancefloorScoreStarsOffset', -1); 
    
        this.app.assets['dancefloorTitle'].hidden = false;
        this.app.assets['dancefloorReady'].hidden = false;
        this.app.assets['dancefloorScore'].hidden = false;
        this.app.assets['dancefloorNoteCatcherEmitter'].hidden = false;
    
        if(!cancelled){ 
            await sleep(100);
        }
    
        if(!cancelled){
            await P.inputs.setPulse('audioAnalyzerPlay', R.once());
    
            //
            var driver = A.timeDriver({ durationMilliseconds: this.notesDuration });
            var sampler = A.samplers.linear(0, -this.notesHeight);
            this.app.assets['notesHorizontal'].transform.y = A.animate(driver, sampler);
            this.app.assets['notesVertical'].transform.y = A.animate(driver, sampler);
            var driverSub = driver.onCompleted().subscribe(e => {
                this.end();
            });
            driver.start();
            this.startDrivers.push(driver);
            this.startDriverSubs.push(driverSub);
    
            for(let i = 0; i < this.notesTotal; i++){
                var driver = A.timeDriver({ durationMilliseconds: this.notesDuration });
                var sampler = A.samplers.linear(this.notesParticlesOnsPositionY[i], this.notesParticlesOnsPositionY[i] - this.notesHeight);
                this.notesParticlesOns[i].transform.y = A.animate(driver, sampler);
                driver.start();
                this.startDrivers.push(driver);
    
                var driver = A.timeDriver({ durationMilliseconds: this.notesDuration });
                var sampler = A.samplers.linear(this.notesParticlesOffsPositionY[i], this.notesParticlesOffsPositionY[i] - this.notesHeight);
                this.notesParticlesOffs[i].transform.y = A.animate(driver, sampler);
                driver.start();
                this.startDrivers.push(driver);
                
            }    
    
            //
            this.app.assets['keyboardCenterVertical'].hidden = false;
            this.app.assets['keyboardCenterVertical'].transform.y = this.keyboardCenterVerticalOffsetEnd;
    
            //
            this.app.assets['keyboardCenterHorizontal'].hidden = false;
            this.app.assets['keyboardCenterHorizontal'].transform.z = this.keyboardCenterHorizontalOffsetEnd;
    
            //
            this.musicPlaybackReady = true;
    
        }
    
        if(!cancelled){ 
            await sleep(700);
        }
    
        if(!cancelled){ 
            var driver = A.timeDriver({ durationMilliseconds: 500 });
            var sampler = A.samplers.easeOutQuad(-1, -0.05);
            this.dancefloorTitleOffset = A.animate(driver, sampler);
            driver.start();
            this.startDrivers.push(driver);
            await P.inputs.setScalar('dancefloorTitleOffset', this.dancefloorTitleOffset);
    
        }
    
        if(!cancelled){ 
            await sleep(500);
        }
    
        if(!cancelled){
            var driver = A.timeDriver({ durationMilliseconds: 1600 });
            var sampler = A.samplers.linear(-0.05, 0.05);
            this.dancefloorTitleOffset = A.animate(driver, sampler);
            driver.start();
            this.startDrivers.push(driver);
            await P.inputs.setScalar('dancefloorTitleOffset', this.dancefloorTitleOffset);  
    
        };
    
        if(!cancelled){ 
            await sleep(400);
        }
    
        if(!cancelled){ 
            this.app.assets['dancefloorNoteCatcherEmitter'].hidden = false;
            this.app.assets['dancefloorNoteCatcherEmitter'].birthrate = 1;
    
            var driver = A.timeDriver({ durationMilliseconds: 1500 });
            var sampler = A.samplers.linear(0, 1);
            this.app.assets['noteCatcherBarMaterial'].opacity = A.animate(driver, sampler);
            driver.start();        
            this.startDrivers.push(driver);
    
        }
    
        if(!cancelled){ 
            await sleep(1400);
        }
    
        if(!cancelled){     
            var driver = A.timeDriver({ durationMilliseconds: 500 });
            var sampler = A.samplers.easeInQuad(0.05, 1);
            this.dancefloorTitleOffset = A.animate(driver, sampler);
            driver.start();
            this.startDrivers.push(driver);
            await P.inputs.setScalar('dancefloorTitleOffset', this.dancefloorTitleOffset);
    
        }
    
        if(!cancelled){ 
            await sleep(200);
        }

        if(!cancelled){ 
            var driver = A.timeDriver({ durationMilliseconds: 500 });
            var sampler = A.samplers.easeOutQuad(-1, -0.05);
            this.dancefloorReadyOffset = A.animate(driver, sampler);
            driver.start();
            this.startDrivers.push(driver);
            await P.inputs.setScalar('dancefloorReadyOffset', this.dancefloorReadyOffset);
    
        }
    
        if(!cancelled){ 
            await sleep(500);
        }
    
        if(!cancelled){
            var driver = A.timeDriver({ durationMilliseconds: 1600 });
            var sampler = A.samplers.linear(-0.05, 0.05);
            this.dancefloorReadyOffset = A.animate(driver, sampler);
            driver.start();
            this.startDrivers.push(driver);
            await P.inputs.setScalar('dancefloorReadyOffset', this.dancefloorReadyOffset);  
    
        };                

        if(!cancelled){ 
            await sleep(1400);
        }

        if(!cancelled){     
            var driver = A.timeDriver({ durationMilliseconds: 500 });
            var sampler = A.samplers.easeInQuad(0.05, 1);
            this.dancefloorReadyOffset = A.animate(driver, sampler);
            driver.start();
            this.startDrivers.push(driver);
            await P.inputs.setScalar('dancefloorReadyOffset', this.dancefloorReadyOffset);
    
        }
    
        if(!cancelled){ 
            await sleep(200);
        }

        if(!cancelled){
            var driver = A.timeDriver({ durationMilliseconds: 500 });
            var sampler = A.samplers.easeOutQuad(-1, 0);
            this.dancefloorScoreOffset = A.animate(driver, sampler);
            driver.start();
            this.startDrivers.push(driver);
            await P.inputs.setScalar('dancefloorScoreOffset', this.dancefloorScoreOffset);
    
            await P.inputs.setBoolean('playerWiggle', true);
    
        }

        return;

    }

    monitor(){
        this.monitorToken = {};
        this.monitorAsync(this.monitorToken);

    }

    async monitorAsync(token = {}){
        let cancelled = false;
  
        token.cancel = () => {
          cancelled = true;
        };
    
        if(!cancelled){
            const scoreDiff = this.score - this.scoreChangeLast;
    
            //
            const newScoreNoteCatcherEmitter = scoreDiff * this.noteCatcherEmitterScoreChangeFactor;
            if(newScoreNoteCatcherEmitter > this.scoreNoteCatcherEmitter){
                this.scoreNoteCatcherEmitter = newScoreNoteCatcherEmitter;
            }
            
            this.app.assets['noteCatcherEmitter'].birthrate = this.scoreNoteCatcherEmitter;
    
            this.scoreNoteCatcherEmitter = this.scoreNoteCatcherEmitter - 11;
            if(this.scoreNoteCatcherEmitter < 0){
                this.scoreNoteCatcherEmitter = 0;
            }
    
            //
            const newDancefloorNoteCatcherEmitter = scoreDiff * this.dancefloorNoteCatcherEmitteScoreChangeFactor;
            if(newDancefloorNoteCatcherEmitter > this.scoreDancefloorNoteCatcherEmitter){
                this.scoreDancefloorNoteCatcherEmitter = newDancefloorNoteCatcherEmitter;
            }
            
            this.app.assets['dancefloorNoteCatcherEmitter'].birthrate = this.scoreDancefloorNoteCatcherEmitter;
    
            this.scoreDancefloorNoteCatcherEmitter = this.scoreDancefloorNoteCatcherEmitter - 0.5;
            if(this.scoreDancefloorNoteCatcherEmitter < 1){
                this.scoreDancefloorNoteCatcherEmitter = 1;
            }
    
            //
            if(scoreDiff > 0){
                this.playerDistort += this.playerDistortIncrease;
                if(this.playerDistort > this.playerDistortMax){
                    this.playerDistort = this.playerDistortMax;
                }
            }else{
                this.playerDistort -= this.playerDistortDecrease;
                if(this.playerDistort < 0){
                    this.playerDistort = 0;
                }
            }
            this.playerDistortSetScalarCount++;
            if(this.playerDistortSetScalarCount > this.playerDistortSetScalarInput){
                this.playerDistortSetScalarCount = 0;
                P.inputs.setScalar('playerDistort', this.playerDistort).then(() => { });
            }
    
            //
            this.scoreChangeLast = this.score;
    
        }
        
        if(!cancelled){
            await sleep(300);
        }
    
        if(!cancelled){
            this.monitor();
        }

        return;

    }

    async end(){
        if(this.monitorToken != null){
            this.monitorToken.cancel();
        }
    
        await P.inputs.setBoolean('playerWiggle', false);   

        this.notesReset();
    
        var driver = A.timeDriver({ durationMilliseconds: 300 });
        var sampler = A.samplers.linear(1, 0);
        this.app.assets['noteCatcherBarMaterial'].opacity = A.animate(driver, sampler);
        driver.start();        
    
        this.app.assets['noteCatcherEmitter'].birthrate = 0;
        this.app.assets['dancefloorNoteCatcherEmitter'].birthrate = 0;
    
        this.app.assets['dancefloorScoreStars'].hidden = false;    
        this.app.assets['dancefloorScoreStar1Emitter'].hidden = true;
        this.app.assets['dancefloorScoreStar1Material'].opacity = 0.5;
        this.app.assets['dancefloorScoreStar2Emitter'].hidden = true;
        this.app.assets['dancefloorScoreStar2Material'].opacity = 0.5;
    
        this.playerDistort = 0;   
        if(this.score > this.scoreStarLevel2){
            this.app.assets['dancefloorScoreStar1Emitter'].hidden = false;
            this.app.assets['dancefloorScoreStar1Material'].opacity = 1;
            this.playerDistort = this.playerDistortMax / 2;
        }
        if(this.score > this.scoreStarLevel3){
            this.app.assets['dancefloorScoreStar2Emitter'].hidden = false;
            this.app.assets['dancefloorScoreStar2Material'].opacity = 1;
            this.playerDistort = this.playerDistortMax;
        }
        await P.inputs.setScalar('playerDistort', this.playerDistort);
    
        var driver = A.timeDriver({ durationMilliseconds: 500 });
        var sampler = A.samplers.easeOutQuad(-1, 0);
        this.dancefloorScoreStarsOffset = A.animate(driver, sampler);
        driver.start();
        this.startDrivers.push(driver);
        await P.inputs.setScalar('dancefloorScoreStarsOffset', this.dancefloorScoreStarsOffset);       
    
        this.musicPlaybackReady = false;
        this.musicPlaybackComplete = true;
        I.bind(true, 'tap_to_reply');

        return;

    }

    async restart(){
        I.bind(false, 'tap_to_reply');

        this.musicPlaybackReady = false;
    
        var driver = A.timeDriver({ durationMilliseconds: 500 });
        var sampler = A.samplers.easeInQuad(0, 1);
        this.dancefloorScoreOffset = A.animate(driver, sampler);
        driver.start();
        this.startDrivers.push(driver);
        await P.inputs.setScalar('dancefloorScoreOffset', this.dancefloorScoreOffset);
    
        await sleep(50);
    
        var driver = A.timeDriver({ durationMilliseconds: 500 });
        var sampler = A.samplers.easeInQuad(0, 1);
        this.dancefloorScoreStarsOffset = A.animate(driver, sampler);
        driver.start();
        this.startDrivers.push(driver);
        await P.inputs.setScalar('dancefloorScoreStarsOffset', this.dancefloorScoreStarsOffset);
    
        await sleep(500);
    
        await P.inputs.setPulse('audioAnalyzerStop', R.once());
    
        await P.inputs.setBoolean('playerWiggle', false);
    
        this.playerDistort = 0;
        await P.inputs.setScalar('playerDistort', this.playerDistort);
    
        await P.inputs.setScalar('dancefloorTitleOffset', -1);
    
        await this.reset();
        this.start();
        this.monitor();

        return;

    }

    async reset(){
        this.musicPlaybackReady = false;
        this.musicPlaybackComplete = false;

        if(this.startToken != null){
            this.startToken.cancel();
        }
    
        if(this.monitorToken != null){
            this.monitorToken.cancel();
        }
    
        for(let i = 0; i < this.startDrivers.length; i++){
            if(this.startDrivers[i] != null){
                this.startDrivers[i].stop();
            } 
        }
        for(let i = 0; i < this.startDriverSubs.length; i++){
            if(this.startDriverSubs[i] != null){
                this.startDriverSubs[i].unsubscribe();
            }
        }
    
        this.app.assets['noteCatcherBarMaterial'].opacity = 0;
        this.app.assets['noteCatcherEmitter'].birthrate = 0;   
        this.app.assets['keyboardCenterVertical'].hidden = true;
        this.app.assets['keyboardCenterHorizontal'].hidden = true;
        this.app.assets['notesHorizontal'].transform.y = 0;
        this.app.assets['notesVertical'].transform.y = 0;
        this.notesReset();
        for(let i = 0; i < this.notesTotal; i++){
            this.notesParticlesOns[i].transform.y = this.notesParticlesOnsPositionY[i];
            this.notesParticlesOffs[i].transform.y = this.notesParticlesOffsPositionY[i];
        }    
    
        this.app.assets['dancefloorTitle'].hidden = false;
        this.app.assets['dancefloorScore'].hidden = false;
        this.app.assets['dancefloorNoteCatcherEmitter'].birthrate = 0;
    
        this.score = 0;
        this.scoreChangeLast = 0;
        this.scoreNoteCatcherEmitter = 0;
        this.scoreDancefloorNoteCatcherEmitter = 0;
        this.app.assets['dancefloorScore'].text = '0';

        await P.inputs.setPulse('audioAnalyzerStop', R.once());
        await P.inputs.setBoolean('playerWiggle', false);

        return;

    }

    notesReset(){
        for(let i = 0; i < this.notesEffectsPoolTotal; i++){
            this.notesEffectsPool[i].hidden = true;
            this.notesEffectsPool[i].transform.y = -10000;
        }

    }

}
