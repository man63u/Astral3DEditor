import * as Blockly from "blockly";
//Imports for SimObject and related stuff
import  Simulation from "../../simulator/simulation";

import { getSimObject,
         getSimObjectIdx,
         randomColour,
         isAttached } from "../../simulator/objects/createObjects";



/* ========
 * MOVEMENT
 * ======== */

Blockly.JavaScript["move"] = function (block) {
	let pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;
	let poseType = block.getInputTargetBlock('POSE').outputConnection.getCheck()[0];

	var code = 'robot("move", "' + poseType + '", ' + pose + ');\n';
	return code;
};

Blockly.JavaScript["default_pose"] = function (block) {
	let ret = '[' + this.defaultPose.toString() + ']';
    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["joint_space_pose"] = function (block) {
	let pose = [];
    for (let i = 1; i < 8; i++) {
        pose.push(block.getFieldValue('JOINT_' + i));
    }

	let code = '[' + pose.toString() + ']';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["task_space_pose"] = function (block) {
    let pose = [];
    for (const key of ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW']) {
        pose.push(block.getFieldValue(key));
    }

    let code = '[' + pose.toString() + ']';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["joint_absolute"] = function (block) {
	let joint = block.getFieldValue('JOINT');
	let angle = block.getFieldValue('DEGREES');

	let code = 'robot("joint_absolute", ' + joint + ', ' + angle + ');\n';
	return code;
};

Blockly.JavaScript["joint_relative"] = function (block) {
	let joint = block.getFieldValue('JOINT');
	let angle = block.getFieldValue('DEGREES');

	let code = 'robot("joint_relative", ' + joint + ', ' + angle + ');\n';
	return code;
};


/* =======
 * OBJECTS
 * ======= */

Blockly.JavaScript["gripper_open"] = function (block) {
	var code = 'robot("gripper_open");\n';
	return code;
};

Blockly.JavaScript["gripper_close"] = function (block) {
	var code = 'robot("gripper_close");\n';
	return code;
};

Blockly.JavaScript["add_sim_object"] = function (block) {
    var idx = getSimObjectIdx(this.id);
    var simObject = getSimObject(this.id);
    simObject.updateFromFieldValues();
    var code = 'robot("startPhysicalBody", ' + idx + ');'
	return code;
};

Blockly.JavaScript["physics_done"] = function (block) {
    let code = 'robot("getPhysicsDone")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript["is_attached"] = function (block) {
    let ret = '["is_attached", ' + isAttached() + ']';
    console.log(ret);
    return [ret, Blockly.JavaScript.ORDER_ATOMIC];
};

/* ======
 * EXTRAS
 * ====== */

Blockly.JavaScript["comment"] = function (block) {
	return "// " + block.getFieldValue('COMMENT') + '\n';
};

Blockly.JavaScript["wait"] = function (block) {
	let time = block.getFieldValue('SECONDS');
	return 'robot("wait", ' + (time * 1000) + ');\n';
};

Blockly.JavaScript["suspend"] = function (block) {
    return 'Simulation.instance.suspend();\n';
};

Blockly.JavaScript["set_speed"] = function (block) {
	var motion = block.getFieldValue('MOTION_TYPE');
	var speed = block.getFieldValue('SPEED');

	var code = 'robot("setParam", "velocity/' + motion + '", ' + speed/100 + ');\n';
	return code;
};

Blockly.JavaScript["joint_lock"] = function (block) {
	var joint = block.getFieldValue('JOINT');
	var code = 'robot("lockJoint", ' + joint + ');\n';
	return code;
};

Blockly.JavaScript["joint_unlock"] = function (block) {
	var joint = block.getFieldValue('JOINT');
	var code = 'robot("unlockJoint", ' + joint + ');\n';
	return code;
};

/* ===========
 * GO2 ROBOT
 * =========== */

// Go2机器狗行走
Blockly.JavaScript["go2_walk"] = function (block) {
    let direction = block.getFieldValue('DIRECTION');
    let speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_COMMA) || 0.5;
    let duration = Blockly.JavaScript.valueToCode(block, 'DURATION', Blockly.JavaScript.ORDER_COMMA) || 1.0;
    
    let code = 'robot("go2_walk", "' + direction + '", ' + speed + ', ' + duration + ');\n';
    return code;
};

// Go2机器狗姿态
Blockly.JavaScript["go2_pose"] = function (block) {
    let poseType = block.getFieldValue('POSE_TYPE');
    
    let code = 'robot("go2_pose", "' + poseType + '");\n';
    return code;
};

// Go2机器狗腿部控制
Blockly.JavaScript["go2_leg_control"] = function (block) {
    let leg = block.getFieldValue('LEG');
    let hipAngle = Blockly.JavaScript.valueToCode(block, 'HIP_ANGLE', Blockly.JavaScript.ORDER_COMMA) || 0;
    let thighAngle = Blockly.JavaScript.valueToCode(block, 'THIGH_ANGLE', Blockly.JavaScript.ORDER_COMMA) || 1.8;
    let calfAngle = Blockly.JavaScript.valueToCode(block, 'CALF_ANGLE', Blockly.JavaScript.ORDER_COMMA) || -1.8;
    
    let code = 'robot("go2_leg_control", "' + leg + '", ' + hipAngle + ', ' + thighAngle + ', ' + calfAngle + ');\n';
    return code;
};

// Go2机器狗物理引擎控制
Blockly.JavaScript["go2_physics"] = function (block) {
    let action = block.getFieldValue('PHYSICS_ACTION');
    
    let code = 'robot("go2_physics", "' + action + '");\n';
    return code;
};

// Go2机器狗传感器
Blockly.JavaScript["go2_sensor"] = function (block) {
    let sensorType = block.getFieldValue('SENSOR_TYPE');
    
    let code = 'robot("go2_sensor", "' + sensorType + '")';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
