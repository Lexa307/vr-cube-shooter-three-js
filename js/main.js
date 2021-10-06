		import * as THREE from 'three'; //../node_modules/three/build/three.module.js
		import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
		import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
		import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
		import CubeTarget from './CubeTarget.js'
		import Bullet from './Bullet.js'
		import Res from './Resources.js'

			let camera, scene, renderer;
			let controller1, controller2;
			let controllerGrip1, controllerGrip2;

			let room;
			let blasterReady = true;
			init();
			animate();

			function init() {

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x505050 );

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
				camera.position.set( 0, 1.6, 3 );

				room = new THREE.LineSegments(
					new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
					new THREE.LineBasicMaterial( { color: 0x808080 } )
				);
				room.geometry.translate( 0, 3, 0 );
				scene.add( room );

				const listener = new THREE.AudioListener();
				camera.add( listener );

				scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

				const light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 1, 1, 1 ).normalize();
				scene.add( light );
				Res.initRes(listener);

				setTimeout(()=>{new CubeTarget(room);}, 3000);  

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.outputEncoding = THREE.sRGBEncoding;
				renderer.xr.enabled = true;
				document.body.appendChild( renderer.domElement );

				//

				document.body.appendChild( VRButton.createButton( renderer ) );

				// controllers

				function onSelectStart() {

					this.userData.isSelecting = true;

				}

				function onSelectEnd() {

					this.userData.isSelecting = false;

				}

				controller1 = renderer.xr.getController( 0 );
				controller1.addEventListener( 'selectstart', onSelectStart );
				controller1.addEventListener( 'selectend', onSelectEnd );
				controller1.addEventListener( 'connected', function ( event ) {

					this.add( buildController( event.data ) );

				} );
				controller1.addEventListener( 'disconnected', function () {

					this.remove( this.children[ 0 ] );

				} );
				scene.add( controller1 );
				
				controller2 = renderer.xr.getController( 1 );
				controller2.addEventListener( 'selectstart', onSelectStart );
				controller2.addEventListener( 'selectend', onSelectEnd );
				controller2.addEventListener( 'connected', function ( event ) {

					this.add( buildController( event.data ) );

				} );
				controller2.addEventListener( 'disconnected', function () {

					this.remove( this.children[ 0 ] );

				} );
				scene.add( controller2 );

				// The XRControllerModelFactory will automatically fetch controller models
				// that match what the user is holding as closely as possible. The models
				// should be attached to the object returned from getControllerGrip in
				// order to match the orientation of the held device.

				const controllerModelFactory = new XRControllerModelFactory();

				controllerGrip1 = renderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				scene.add( controllerGrip1 );

				controllerGrip2 = renderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				scene.add( controllerGrip2 );
				window.addEventListener( 'resize', onWindowResize );

			}

			function buildController( data ) {

				let geometry, material;

				switch ( data.targetRayMode ) {

					case 'tracked-pointer':

						geometry = new THREE.BufferGeometry();
						geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
						geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );
						material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );
						return new THREE.Line( geometry, material );

					case 'gaze':

						geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
						material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
						return new THREE.Mesh( geometry, material );
				}
			}

			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function handleController( controller ) {
				if ( controller.userData.isSelecting && blasterReady ) {
					room.add(new Bullet(controller.position, controller.rotation, controller.quaternion))
					blasterReady = false;
					setTimeout(()=> {blasterReady = true}, 400);
				}
			}

			function animate() {

				renderer.setAnimationLoop( render );

			}

			function render() {
				handleController( controller1 );
				handleController( controller2 );
				Bullet.update();
				renderer.render( scene, camera );

			}
