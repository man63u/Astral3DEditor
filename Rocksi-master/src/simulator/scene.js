import {
	Object3D,
	Vector3,
    Scene,
	LoaderUtils,
    WebGLRenderer,
	PerspectiveCamera,
	GridHelper,
    PolarGridHelper,
    HemisphereLight,
    PointLight,
    SpotLight,
    DirectionalLight,
    Mesh,
    SphereGeometry,
    Color,
    MeshBasicMaterial,
	LoadingManager,
	BufferGeometry,
	Line,
	LineBasicMaterial,
	Raycaster,
	Vector2
} from "three";

//Imports for managing objects and physics
import { initCannon, getWorld, addBodyToWorld } from './physics';

import { remControledSimObject, setSimObjectHighlight,
         setTCSimObjectsOnClick } from './objects/createObjects';

// In ROS models Z points upwards
Object3D.DefaultUp = new Vector3(0, 0, 1);

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

var ResizeSensor = require("css-element-queries/src/ResizeSensor");

import { XacroLoader } from "xacro-parser";
import URDFLoader from "urdf-loader";

import { default as IKSolver } from "./ik/ccdik"
//import { default as IKSolver } from "./ik/fabrik"
import Simulation from "./simulation"
import * as GUI from "./gui"
import { popInfo } from "../alert"
import { getDesiredRobot, canHover, isNarrowScreen } from "../helpers";

const path = require('path');

const selectedRobot = getDesiredRobot();
let robot;

switch (selectedRobot.toLowerCase()) {
	case 'franka':
	case 'franka_description':
		robot = require('./robots/franka');
		break;

	case 'niryo':
	case 'niryo_robot_description':
		robot = require('./robots/niryo');
		break;

	case 'sawyer':
	case 'sawyer_description':
		robot = require('./robots/sawyer');
		break;

	case 'unitree_go2':
	case 'go2_description_humble':
		robot = require('./robots/go2');
		break;

	case 'g1_description':
		robot = require('./robots/g1');
		break;

	default:
		throw ('Unknown robot \'' + selectedRobot + '\'');
}

let container;
let camera, scene, renderer;
let raycaster;
let pointerDownPixels = new Vector2();
let pointerXY = new Vector2();
let pointerDrag = false;

let tcptarget, groundLine;
let cameraControl, robotControl;
let simObjectActive = false;
let ik;

const renderCallbacks = [];

console.log('Robot xacro path:', robot.xacro);
console.log('Robot xacro type:', typeof robot.xacro);
console.log('Robot xacro value:', robot.xacro);

// 添加安全检查
if (!robot.xacro) {
	console.error('Robot xacro is undefined or null');
	console.error('Robot object:', robot);
	console.error('Robot name:', robot.name);
	console.error('Robot package:', robot._package);
	console.error('Robot xacro file:', robot._xacro);
}

loadRobotModel(robot.xacro)
	.then(model => {
		console.log('Robot model loaded successfully:', model);
		robot.init(model);
		console.log('Robot initialized:', robot);
		
		if (robot.info && robot.info.DE) {
			$('.robot-info').on('click', evt => popInfo(robot.info.DE))
		}
		robot.setPose(robot.defaultPose);
		
		// 设置机器人初始位置，让脚部接触地面
		if (robot.initialPosition) {
			console.log('Setting robot initial position:', robot.initialPosition);
			// 设置整个机器人模型的位置
			if (robot.model) {
				robot.model.position.set(robot.initialPosition[0], robot.initialPosition[1], robot.initialPosition[2]);
				console.log('Robot model position set to:', robot.model.position);
			}
			// 也设置根链接的位置
			const rootLink = robot.model.links[robot.robotRoot];
			if (rootLink) {
				rootLink.position.set(robot.initialPosition[0], robot.initialPosition[1], robot.initialPosition[2]);
				console.log('Root link position set to:', rootLink.position);
			}
		}

		initScene();
        initCannon();
        
        // 如果机器人启用了物理引擎，初始化物理体
        if (robot.enablePhysics) {
            console.log('Initializing physics for robot:', robot.name);
            initRobotPhysics(robot);
        }

		ik = new IKSolver(scene, robot);
		Simulation.init(robot, ik, ikRender);
		
		// 延迟初始化GUI，确保机器人完全加载
		setTimeout(() => {
			GUI.initGui(robot, cameraControl, ikRender);
		}, 100);
		
		// 确保加载动画被隐藏
		$('.loading-lightbox').hide();
	}, reason => {
		console.error('Failed to load robot model:', reason);
	});


function loadRobotModel(url) {
	console.log('Loading robot model from:', url);
	
	// 添加安全检查
	if (!url || typeof url !== 'string') {
		const error = new Error(`Invalid URL: ${url}`);
		console.error('Invalid robot xacro URL:', url);
		return Promise.reject(error);
	}
	
	return new Promise((resolve, reject) => {
		const xacroLoader = new XacroLoader();
		xacroLoader.inOrder = true;
		xacroLoader.requirePrefix = true;
		xacroLoader.localProperties = true;

		xacroLoader.rospackCommands.find = (...args) => {
			const result = path.join(robot.root, ...args);
			console.log('rospack find:', args, '->', result);
			return result;
		}

		for (let cmd in robot.rosMacros) {
			xacroLoader.rospackCommands[cmd] = robot.rosMacros[cmd];
		}

		xacroLoader.load(
			url,
			(xml) => {
				console.log('Xacro loaded successfully, parsing URDF...');
				let manager = new LoadingManager(onLoadComplete, () => {
					// 安全的渲染回调
					if (typeof render === 'function' && renderer) {
						render();
					}
				});
				const urdfLoader = new URDFLoader(manager);
				urdfLoader.packages = robot.packages;
				// 安全地处理URL路径
				let workingPath = './';
				if (url && typeof url === 'string') {
					try {
						workingPath = LoaderUtils.extractUrlBase(url);
					} catch (error) {
						console.warn('Failed to extract URL base, using default:', error);
						workingPath = './';
					}
				}
				urdfLoader.workingPath = workingPath;

				let model = urdfLoader.parse(xml);
				console.log('URDF parsed successfully:', model);
				
				// 手动触发加载完成回调
				setTimeout(() => {
					onLoadComplete();
				}, 100);
				
				resolve(model);
			},
			(error) => {
				console.error('Xacro loading failed:', error);
				reject(error);
			}
		);
	});
}

function onLoadComplete() {
	$('.loading-lightbox').hide();
	robot.onLoadComplete();
	
	// 为Go2机器人设置正确的地面位置
	if (robot.name === 'Go2' && robot.initialPosition) {
		console.log('Setting Go2 robot position to ground level');
		if (robot.model && robot.model.position) {
			robot.model.position.set(
				robot.initialPosition[0],
				robot.initialPosition[1], 
				robot.initialPosition[2]
			);
			console.log('Go2 robot positioned at:', robot.model.position);
		}
	}
}


function initScene() {
	container = document.getElementById("sim-canvas");

	scene = new Scene();
	scene.background = new Color(0x363b4b);

	// Camera
	camera = new PerspectiveCamera(
		45,
		container.clientWidth / container.clientHeight,
		1,
		2000
	);

	camera.position.set(8, 20, 17);
	camera.lookAt(0, 0, 10);

	// Grid
	//const grid = new PolarGridHelper(12, 16, 8, 64, 0x888888, 0xaaaaaa);
	const grid = new GridHelper(20, 20, 0xf0f0f0, 0x888888);
	grid.rotateX(Math.PI / 2);
	scene.add(grid);

	// for (let i = 0; i < 5; i++) {
	// 	let rock = makeRock(20, 1);
	// 	rock.position.set(i * 3, 5, 0);
	// 	scene.add(rock);
	// }

	// Robot
	scene.add(robot.model);
	// for (let joint of robot.arm.movable) {
	// 	joint.add(new ArrowHelper(new Vector3(0, 0, 1), new Vector3(), 0.3, 0x0000ff));
	// }


	// Lights
	const light = new HemisphereLight(0xffeeee, 0x111122);
	scene.add(light);

	const pointLight = new PointLight(0xffffff, 0.5);
	pointLight.position.set(30, 30, 40);
	scene.add(pointLight);

	// 为Go2机器人添加更好的光照
	if (robot.name === 'Go2') {
		// 添加填充光
		const fillLight = new DirectionalLight(0x404040, 0.3);
		fillLight.position.set(-10, 10, 10);
		scene.add(fillLight);
	}

	renderer = new WebGLRenderer();
	renderer.sortObjects = false;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	// Scene controls
	cameraControl = new OrbitControls(camera, renderer.domElement);
	cameraControl.damping = 0.2;
	cameraControl.addEventListener("change", render);

	// TCP target & controls
	tcptarget = new Mesh(
		new SphereGeometry(2),
		new MeshBasicMaterial({
			visible: false
		})
	);
	robot.tcp.object.getWorldPosition(tcptarget.position);
	scene.add(tcptarget);

	let lineVertices = [];
	lineVertices.push(tcptarget.position.clone());
	lineVertices.push(tcptarget.position.clone().setZ(0));
	let lineGeometry = new BufferGeometry().setFromPoints(lineVertices);
	groundLine = new Line(lineGeometry, new LineBasicMaterial({
		color: 0xaaaacc,
	}));
	groundLine.name = 'groundLine';
	scene.add(groundLine);

	robotControl = new TransformControls(camera, renderer.domElement);
	robotControl.setSize(canHover() ? 1.7 : 3);
	robotControl.addEventListener("change", evt => requestAnimationFrame(render));
	robotControl.addEventListener("objectChange", onTargetChange);
	robotControl.addEventListener("dragging-changed", evt => cameraControl.enabled = !evt.value);

	// TODO setMode('rotate') on click event
	robotControl.attach(tcptarget);
	scene.add(robotControl);

	robotControl.visible = false;
	robotControl.enabled = false;
	raycaster = new Raycaster();
	enablePointerEvents();

	let domParent = document.querySelector('.sim-container');
	new ResizeSensor(domParent, onCanvasResize);
	onCanvasResize();

	// 启动TWEEN动画循环
	startTweenLoop();
}

function onCanvasResize() {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
	requestAnimationFrame(render);
}


function onTargetChange() {
	// Prevent target from going beneath the floor
	tcptarget.position.z = Math.max(0, tcptarget.position.z);
	updateGroundLine();

	// Do the IK if the target has been moved
	ik.solve(
		tcptarget,
		robot,
		robot.ikEnabled,
		{
			// we don't have to be all that precise here
			maxIterations: 3,
			stopDistance: 0.1,
			jointLimits: robot.interactionJointLimits,
			apply: true
		}
	);

	// requestAnimationFrame is called in the transformControl's change-listener,
	// so we can skip it here
}

function ikRender() {
	robot.tcp.object.getWorldPosition(tcptarget.position);
	robot.tcp.object.getWorldQuaternion(tcptarget.quaternion);
	updateGroundLine();
	requestAnimationFrame(render);
}

function updateGroundLine() {
	const geom = groundLine.geometry;
	const position = geom.attributes.position;
	position.setXYZ(0, tcptarget.position.x, tcptarget.position.y, tcptarget.position.z);
	position.setXYZ(1, tcptarget.position.x, tcptarget.position.y, 0);
	position.needsUpdate = true;
}

function render() {
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }

	for (let cb of renderCallbacks) {
		cb(robot);
	}
}

// 添加持续的TWEEN更新循环
function startTweenLoop() {
    var TWEEN = require('@tweenjs/tween.js');
    
    function animateTween(time) {
        TWEEN.update(time);
        
        // 强制渲染场景以显示动画
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
        
        requestAnimationFrame(animateTween);
    }
    
    requestAnimationFrame(animateTween);
}

export function enablePointerEvents() {
	if (canHover()) {
		container.addEventListener('pointermove', onHoverPointerMove);
		container.addEventListener('pointerdown', onHoverPointerDown);
		container.addEventListener('pointerup', onHoverPointerUp);
	}
	else {
		container.addEventListener('pointermove', onClickPointerMove);
		container.addEventListener('pointerdown', onClickPointerDown);
		container.addEventListener('pointerup', onClickPointerUp);
	}
}

export function disablePointerEvents() {
	if (canHover()) {
		container.removeEventListener('pointermove', onHoverPointerMove);
		container.removeEventListener('pointerdown', onHoverPointerDown);
		container.removeEventListener('pointerup', onHoverPointerUp);
	}
	else {
		container.removeEventListener('pointermove', onClickPointerMove);
		container.removeEventListener('pointerdown', onClickPointerDown);
		container.removeEventListener('pointerup', onClickPointerUp);
	}

	remControledSimObject();
	robotControl.visible = false;
	robotControl.enabled = false;
}


function onHoverPointerMove(evt) {
	evt.preventDefault();
	pointerDrag = true;

	pointerXY.x = (evt.offsetX / container.clientWidth) * 2 - 1;
	pointerXY.y = -(evt.offsetY / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(pointerXY, camera);
    setSimObjectHighlight(raycaster); //does this for all TransformControls of simObjects
	let showRTC = false;

	// Only show the robot controls if no object is visible
	if (!simObjectActive) {
    	const intersections = raycaster.intersectObjects([tcptarget]);
    	showRTC = intersections.length > 0;
	}

    if (showRTC !== robotControl.visible) {
        robotControl.visible = showRTC;
		robotControl.enabled = showRTC;
    }

	requestAnimationFrame(render);
}

function onHoverPointerDown(evt) {
	pointerDrag = false;
	pointerDownPixels.x = evt.offsetX;
	pointerDownPixels.y = evt.offsetY;
}

function onHoverPointerUp(evt) {
	// Don't change transform controls if the pointer was dragged at least (5) pixels
	if (pointerDrag || new Vector2(evt.offsetX, evt.offsetY).sub(pointerDownPixels).length() > 5) {
		return;
	}
	simObjectActive = setTCSimObjectsOnClick(raycaster);
	requestAnimationFrame(render);
}


function onClickPointerMove(evt) {
	evt.preventDefault();
	pointerDrag = true;
	requestAnimationFrame(render);
}

function onClickPointerDown(evt) {
	pointerDrag = false;
	pointerDownPixels.x = evt.offsetX;
	pointerDownPixels.y = evt.offsetY;
}

function onClickPointerUp(evt) {
	// Don't do anything if the pointer was dragged at least (5) pixels
	if (pointerDrag || new Vector2(evt.offsetX, evt.offsetY).sub(pointerDownPixels).length() > 5) {
		return;
	}

	pointerXY.x = (evt.offsetX / container.clientWidth) * 2 - 1;
	pointerXY.y = -(evt.offsetY / container.clientHeight) * 2 + 1;
	raycaster.setFromCamera(pointerXY, camera);

	let showRTC = false;

	// SimObjects first since they are harder to hit
	let simObjectHit = setTCSimObjectsOnClick(raycaster);
	if (!simObjectHit) {
		let intersected = raycaster.intersectObjects([tcptarget]);
		showRTC = intersected.length > 0;
	}

	if (showRTC !== robotControl.visible) {
        robotControl.visible = showRTC;
		robotControl.enabled = showRTC;
    }

	requestAnimationFrame(render);
}


export function addRenderCallback (callback) {
	if (renderCallbacks.includes(callback)) {
		return;
	}

	renderCallbacks.push(callback);
}

//Functions for access to the scene and the robot model
export function requestAF () { requestAnimationFrame(render); }

export function getScene () { return scene; }

export function getRobot () { return robot; }

export function getControl () {
    const contObj = {
        camera: camera,
        orbitControls: cameraControl,
        renderer: renderer,
    }
    return contObj;
}

// 初始化机器人物理引擎
function initRobotPhysics(robot) {
    console.log('Initializing robot physics for:', robot.name);
    
    const world = getWorld();
    if (!world) {
        console.error('Physics world not initialized');
        return;
    }
    
    // 为机器人的每个链接创建物理体
    for (const linkName in robot.model.links) {
        const link = robot.model.links[linkName];
        if (link && link.geometry) {
            // 创建物理体
            const body = createPhysicsBodyForLink(link, robot);
            if (body) {
                // 设置物理体的初始位置
                if (robot.initialPosition) {
                    body.position.set(robot.initialPosition[0], robot.initialPosition[1], robot.initialPosition[2]);
                }
                // 将物理体添加到世界
                world.addBody(body);
                console.log('Added physics body for link:', linkName, 'at position:', body.position);
            }
        }
    }
    
    // 启动物理模拟
    startPhysicsSimulation();
}

// 启动物理模拟
function startPhysicsSimulation() {
    console.log('Starting physics simulation...');
    
    // 添加物理模拟更新到渲染循环
    const updatePhysics = () => {
        const world = getWorld();
        if (world) {
            world.step(1/60); // 60 FPS物理更新
        }
        requestAnimationFrame(updatePhysics);
    };
    
    updatePhysics();
}

// 为链接创建物理体
function createPhysicsBodyForLink(link, robot) {
    const CANNON = require('cannon-es');
    
    // 根据几何体类型创建物理体
    if (link.geometry.type === 'BoxGeometry') {
        const size = link.geometry.parameters;
        const shape = new CANNON.Box(new CANNON.Vec3(size.width/2, size.height/2, size.depth/2));
        const body = new CANNON.Body({ mass: 1 });
        body.addShape(shape);
        body.position.copy(link.position);
        return body;
    }
    else if (link.geometry.type === 'CylinderGeometry') {
        const params = link.geometry.parameters;
        const shape = new CANNON.Cylinder(params.radiusTop, params.radiusBottom, params.height, params.radialSegments);
        const body = new CANNON.Body({ mass: 1 });
        body.addShape(shape);
        body.position.copy(link.position);
        return body;
    }
    else if (link.geometry.type === 'SphereGeometry') {
        const params = link.geometry.parameters;
        const shape = new CANNON.Sphere(params.radius);
        const body = new CANNON.Body({ mass: 1 });
        body.addShape(shape);
        body.position.copy(link.position);
        return body;
    }
    
    return null;
}



