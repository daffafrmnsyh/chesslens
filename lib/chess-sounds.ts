import type {Move} from 'chess.js';

export type ChessSound='move'|'capture'|'check'|'castle'|'promotion'|'game-end';
export const MASTER_VOLUME=.5;

type Impact={delay?:number;duration?:number;volume?:number;brightness?:number;body?:number;bodyVolume?:number};

/**
 * A small, asset-free sound adapter. Replace `play` with decoded WAV/MP3
 * buffers later; callers only use `ChessSound`, never Web Audio details.
 */
export class ChessSoundPlayer{
 private context:AudioContext|undefined;
 private master:GainNode|undefined;
 private noise:AudioBuffer|undefined;
 private enabled=false;
 private active=new Set<AudioBufferSourceNode>();

 get isEnabled(){return this.enabled;}

 async setEnabled(enabled:boolean){
  this.enabled=enabled;
  if(!enabled){this.stopActive();if(this.context?.state==='running')void this.context.suspend();return;}
  const audioWindow=window as Window & typeof globalThis & {webkitAudioContext?:typeof AudioContext};
  const AudioContextClass=audioWindow.AudioContext??audioWindow.webkitAudioContext;
  if(!AudioContextClass){this.enabled=false;return;}
  this.context??=new AudioContextClass();
  this.master??=this.createMaster(this.context);
  if(this.context.state==='suspended')await this.context.resume();
 }

 play(sound:ChessSound){
  const context=this.context;
  if(!this.enabled||!context||context.state!=='running')return;
  this.stopActive();
  switch(sound){
   case 'move':this.impact({duration:.052,volume:.05,brightness:1450,body:175,bodyVolume:.018});break;
   case 'capture':this.impact({duration:.067,volume:.068,brightness:1050,body:135,bodyVolume:.03});this.impact({delay:.024,duration:.035,volume:.025,brightness:2100,body:260,bodyVolume:.006});break;
   case 'check':this.impact({duration:.048,volume:.064,brightness:2500,body:290,bodyVolume:.012});break;
   case 'castle':this.impact({duration:.046,volume:.045,brightness:1400,body:175,bodyVolume:.016});this.impact({delay:.052,duration:.052,volume:.048,brightness:1550,body:190,bodyVolume:.017});break;
   case 'promotion':this.impact({duration:.055,volume:.052,brightness:1500,body:175,bodyVolume:.018});this.impact({delay:.042,duration:.04,volume:.03,brightness:2900,body:440,bodyVolume:.005});break;
   case 'game-end':this.impact({duration:.07,volume:.038,brightness:1050,body:150,bodyVolume:.018});this.impact({delay:.075,duration:.095,volume:.04,brightness:1650,body:235,bodyVolume:.012});break;
  }
 }

 dispose(){this.stopActive();void this.context?.close();this.context=undefined;this.master=undefined;this.noise=undefined;}

 private createMaster(context:AudioContext){
  const master=context.createGain();
  master.gain.value=MASTER_VOLUME;
  master.connect(context.destination);
  return master;
 }

 private stopActive(){for(const source of this.active){try{source.stop();}catch{}}this.active.clear();}

 private noiseBuffer(context:AudioContext){
  if(this.noise)return this.noise;
  const buffer=context.createBuffer(1,Math.floor(context.sampleRate*.24),context.sampleRate),samples=buffer.getChannelData(0);
  let previous=0;
  for(let i=0;i<samples.length;i++){previous=previous*.96+(Math.random()*2-1)*.12;samples[i]=previous;}
  this.noise=buffer;
  return buffer;
 }

 private impact({delay=0,duration=.055,volume=.05,brightness=1500,body=180,bodyVolume=.014}:Impact){
  const context=this.context,master=this.master;
  if(!context||!master)return;
  const at=context.currentTime+delay;
  const source=context.createBufferSource(),highpass=context.createBiquadFilter(),lowpass=context.createBiquadFilter(),gain=context.createGain();
  source.buffer=this.noiseBuffer(context);highpass.type='highpass';highpass.frequency.value=80;lowpass.type='lowpass';lowpass.frequency.value=brightness;
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.002);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  source.connect(highpass).connect(lowpass).connect(gain).connect(master);
  this.start(source,at,duration+.012);

  const bodySource=context.createBufferSource(),bandpass=context.createBiquadFilter(),bodyGain=context.createGain();
  bodySource.buffer=this.noiseBuffer(context);bandpass.type='bandpass';bandpass.frequency.value=body;bandpass.Q.value=1.4;
  bodyGain.gain.setValueAtTime(.0001,at);bodyGain.gain.exponentialRampToValueAtTime(bodyVolume,at+.003);bodyGain.gain.exponentialRampToValueAtTime(.0001,at+Math.min(duration,.055));
  bodySource.connect(bandpass).connect(bodyGain).connect(master);
  this.start(bodySource,at,Math.min(duration,.055)+.012);
 }

 private start(source:AudioBufferSourceNode,at:number,duration:number){
  this.active.add(source);source.onended=()=>this.active.delete(source);
  source.start(at,Math.random()*.08,duration);source.stop(at+duration+.01);
 }
}

export function soundForMove(move:Pick<Move,'captured'|'flags'|'promotion'|'san'>,gameEnded=false):ChessSound{
 if(gameEnded)return 'game-end';
 if(move.promotion)return 'promotion';
 if(move.flags.includes('k')||move.flags.includes('q'))return 'castle';
 if(move.captured||move.flags.includes('e'))return 'capture';
 if(move.san.includes('+'))return 'check';
 return 'move';
}
