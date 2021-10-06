import * as THREE from 'three';
import CubeTarget from './CubeTarget.js'
import Res from './Resources.js';

const clock = new THREE.Clock();
const radius = 0.08;
const range = 3 - radius;

const geometry = new THREE.IcosahedronGeometry( radius, 3 );
const bulletMesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xff0000 } ) );

class Bullet {
    constructor(position, rotation, quaternion) { // gets arguments from controller fields
        const object = bulletMesh.clone();
        object.userData.velocity = new THREE.Vector3();
        object.scale.x = object.scale.y = 0.1;
        object.add(Res.blastAudio); // TO DO : add resource loader
        Bullet.bulletArray.push(object);
        object.rotation.copy( rotation );
        object.position.copy( position );
        object.userData.velocity.x = ( Math.random() - 0.1 );
        object.userData.velocity.y = ( Math.random() - 0.1 );
        object.userData.velocity.z = ( Math.random() - 9 );
        object.userData.velocity.applyQuaternion( quaternion );
        object.geometry.computeBoundingBox();
        let knotBBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        knotBBox.setFromObject(object);
        object.userData.knotBBox = knotBBox;
        
        let localAudio = object.children[ 0 ];
        if(localAudio.isPlaying) localAudio.stop();
        localAudio.play();
        return object;
    }

    static bulletArray = [];

    static update () {
        const delta = clock.getDelta() * 0.8; // slow down simulation

        if (Bullet.bulletArray.length) {
            for ( let i = 0; i < Bullet.bulletArray.length; i++ ) {
                const bullet =  Bullet.bulletArray[ i ];
					
                bullet.position.x += bullet.userData.velocity.x * delta;
                bullet.position.y += bullet.userData.velocity.y * delta;
                bullet.position.z += bullet.userData.velocity.z * delta;

                bullet.userData.knotBBox.setFromObject(bullet); // recalculate bullet bounding box

                if (CubeTarget.targetArray.length) {
                    for (let j = 0; j < CubeTarget.targetArray.length; j++) { // TO DO : hit detection for multiple targets
                        if(bullet.userData.knotBBox.intersectsBox(CubeTarget.targetArray[0].userData.knotBBox) === true) {
                            CubeTarget.targetArray[0].hit(0);
                        }
                    }
                }

                // removing bullet from out of range:

                if ( bullet.position.x < - range || bullet.position.x > range ) {
                    Bullet.bulletArray.splice(i, 1);
                    bullet.removeFromParent();
                }
                if ( bullet.position.y < radius || bullet.position.y > 6 ) {
                    Bullet.bulletArray.splice(i, 1);
                    bullet.removeFromParent();
                }
                if ( bullet.position.z < - range || bullet.position.z > range ) {
                    Bullet.bulletArray.splice(i, 1);
                    bullet.removeFromParent();
                }
            }
        }
    }
}

export default Bullet;