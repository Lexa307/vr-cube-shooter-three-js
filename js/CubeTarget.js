import * as THREE from 'three';
import Res from './Resources.js';
const boxGeometry = new THREE.BoxGeometry( 0.3, 0.3, 0.3 );
const boxMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
const cube = new THREE.Mesh( boxGeometry, boxMaterial );

class CubeTarget {
    static targetArray = [];
    constructor (room) {
        let targetObject = cube.clone();
        targetObject.add(Res.spawnAudio);
        targetObject.add(Res.hitAudio);
        targetObject.geometry.computeBoundingBox();
        targetObject.position.set(THREE.MathUtils.randFloat(-3, 3), THREE.MathUtils.randFloat(0, 3), THREE.MathUtils.randFloat(-3, 3))

        let knotBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        knotBBox.setFromObject(targetObject);
        targetObject.userData.knotBBox = knotBBox;
        targetObject.hit = this.hit
        CubeTarget.targetArray.push(targetObject);
        room.add(targetObject);
        let localSpawnAudio = targetObject.children[ 0 ];
        localSpawnAudio.play();
    }



    hit (index) {
        
        let localHitAudio = this.children[ 1 ];
        localHitAudio.play();
        let parent = this.parent;
        CubeTarget.targetArray.splice(index, 1);
        
        
        this.removeFromParent();
        setTimeout(() => {
            new CubeTarget(parent);
        }, 3000)
    }
    update () {
        
    }
}

export default CubeTarget;