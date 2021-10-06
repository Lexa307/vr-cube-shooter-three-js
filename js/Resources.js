import * as THREE from 'three';
let Res = {
    blastAudio: undefined,
    spawnAudio: undefined,
    hitAudio: undefined,
    initRes: async function (listener) {
        const audioLoader = new THREE.AudioLoader();
        let audioNames = ["blast", "spawn", "hit"]
        for (let audioName of audioNames) {
            await new Promise((resolve, reject) => {
                audioLoader.load( `sounds/audio/${audioName}.mp3`, ( buffer ) => {
                    this[audioName+"Audio"] = new THREE.PositionalAudio( listener );
                    this[audioName+"Audio"].setBuffer( buffer );
                    resolve();
                })
            })
        }
        console.log(this);
    }
}

export default Res;