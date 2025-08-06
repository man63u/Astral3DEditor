import 'blockly/python'
import * as Blockly from 'blockly'
import Simulation from '../../simulator/simulation';
import * as Alert from '../../alert'

const Go2Generator = Blockly.Python;
export default Go2Generator;

Go2Generator.finish_orig = Go2Generator.finish;
Go2Generator.finish = function (code) {
    const n = Go2Generator;
    n.definitions_["import_rospy"] = "import rospy";
    n.definitions_["import_std_msgs"] = "from std_msgs.msg import Float64MultiArray";
    n.definitions_["import_geometry_msgs"] = "from geometry_msgs.msg import Twist";

    n.definitions_["go2_init"] =
          "rospy.init_node('rocksi_go2_code')\n"
        + "joint_pub = rospy.Publisher('/go2/joint_commands', Float64MultiArray, queue_size=1)\n"
        + "cmd_vel_pub = rospy.Publisher('/go2/cmd_vel', Twist, queue_size=1)\n"
        + "rospy.sleep(0.5)  # Wait for publishers to be ready\n";
	
    code =
        "try:\n" +
            n.prefixLines(code, n.INDENT) + '\n' +
        "except Exception as e:\n" +
            n.prefixLines("print('Error:', str(e))", n.INDENT);
	
    return n.finish_orig(code);
};

Go2Generator.FILE_EXTENSION = '.py';
Go2Generator.MAX_MOVE_SPEED = 100;
Go2Generator.MAX_GRIPPER_SPEED = 1000;
Go2Generator.GRIPPER_SPEED = 100;

var simulation = null;
Simulation.getInstance().then(sim => simulation = sim);

function export_impossible(block_name) {
    let msg = block_name + ' cannot be translated for Go2. So sorry ._.\n'
    Alert.popWarning(msg);
    return "# " + msg;
}

/* ==============
 * BLOCKS TO CODE
 * ============== */

// Movement
Go2Generator["move"] = function (block) {
    let pose = Blockly.JavaScript.valueToCode(block, 'POSE', Blockly.JavaScript.ORDER_COMMA) || 0;
    let poseType = block.getInputTargetBlock('POSE').outputConnection.getCheck()[0];
    
    switch (poseType) {
        case 'JointspacePose':
            return 'joint_pub.publish(Float64MultiArray(data=' + pose + '))\n';
        
        case 'TaskspacePose':
            return 'cmd_vel_pub.publish(Twist(linear=Vector3(' + pose + '[0], ' + pose + '[1], 0), angular=Vector3(0, 0, ' + pose + '[5])))\n';
        
        default:
            throw new Error('Invalid move argument \'' + poseType + '\'');
    }
};

Go2Generator["default_pose"] = function (block) {
    let ret = '[' + block.defaultPose.toString() + ']';
    return [ret, Blockly.Go2Generator.ORDER_COLLECTION];
};

Go2Generator["joint_space_pose"] = function (block) {
    let pose = [];
    // Go2 has 12 joints: 4 legs × 3 joints each
    const jointNames = [
        'LF_hip_joint', 'LF_upper_leg_joint', 'LF_lower_leg_joint',
        'RF_hip_joint', 'RF_upper_leg_joint', 'RF_lower_leg_joint',
        'LR_hip_joint', 'LR_upper_leg_joint', 'LR_lower_leg_joint',
        'RR_hip_joint', 'RR_upper_leg_joint', 'RR_lower_leg_joint'
    ];
    
    for (let i = 0; i < 12; i++) {
        pose.push(block.getFieldValue('JOINT_' + (i + 1)) || 0);
    }

    let code = '[' + pose.toString() + ']';
    return [code, Blockly.Go2Generator.ORDER_COLLECTION];
};

Go2Generator["task_space_pose"] = function (block) {
    let pose = [];
    for (const key of ['X', 'Y', 'Z', 'ROLL', 'PITCH', 'YAW']) {
        pose.push(block.getFieldValue(key) || 0);
    }

    let code = '[' + pose.toString() + ']';
    return [code, Blockly.Go2Generator.ORDER_COLLECTION];
};

// Gripper (not applicable for Go2, but keeping for compatibility)
Go2Generator["gripper"] = function (block) {
    return export_impossible('gripper');
};

Go2Generator["gripper_open"] = function (block) {
    return export_impossible('gripper_open');
};

Go2Generator["gripper_close"] = function (block) {
    return export_impossible('gripper_close');
};

// Wait
Go2Generator["wait"] = function (block) {
    let time = Blockly.JavaScript.valueToCode(block, 'TIME', Blockly.JavaScript.ORDER_COMMA) || 1;
    return 'rospy.sleep(' + time + ')\n';
};

// Go2机器狗行走
Go2Generator["go2_walk"] = function (block) {
    let direction = block.getFieldValue('DIRECTION');
    let speed = Blockly.JavaScript.valueToCode(block, 'SPEED', Blockly.JavaScript.ORDER_COMMA) || 0.5;
    let duration = Blockly.JavaScript.valueToCode(block, 'DURATION', Blockly.JavaScript.ORDER_COMMA) || 1.0;
    
    let code = '';
    switch (direction) {
        case 'FORWARD':
            code = 'cmd_vel_pub.publish(Twist(linear=Vector3(' + speed + ', 0, 0), angular=Vector3(0, 0, 0)))\n';
            break;
        case 'BACKWARD':
            code = 'cmd_vel_pub.publish(Twist(linear=Vector3(-' + speed + ', 0, 0), angular=Vector3(0, 0, 0)))\n';
            break;
        case 'LEFT':
            code = 'cmd_vel_pub.publish(Twist(linear=Vector3(0, 0, 0), angular=Vector3(0, 0, ' + speed + ')))\n';
            break;
        case 'RIGHT':
            code = 'cmd_vel_pub.publish(Twist(linear=Vector3(0, 0, 0), angular=Vector3(0, 0, -' + speed + ')))\n';
            break;
        case 'STOP':
            code = 'cmd_vel_pub.publish(Twist(linear=Vector3(0, 0, 0), angular=Vector3(0, 0, 0)))\n';
            break;
    }
    
    code += 'rospy.sleep(' + duration + ')\n';
    return code;
};

// Go2机器狗姿态
Go2Generator["go2_pose"] = function (block) {
    let poseType = block.getFieldValue('POSE_TYPE');
    
    let code = '';
    switch (poseType) {
        case 'STAND':
            code = 'joint_pub.publish(Float64MultiArray(data=[0, 1.8, -1.8, 0, 1.8, -1.8, 0, 1.8, -1.8, 0, 1.8, -1.8]))\n';
            break;
        case 'SQUAT':
            code = 'joint_pub.publish(Float64MultiArray(data=[0, 2.5, -2.5, 0, 2.5, -2.5, 0, 2.5, -2.5, 0, 2.5, -2.5]))\n';
            break;
        case 'LIE_DOWN':
            code = 'joint_pub.publish(Float64MultiArray(data=[0, 3.0, -3.0, 0, 3.0, -3.0, 0, 3.0, -3.0, 0, 3.0, -3.0]))\n';
            break;
        case 'JUMP':
            code = 'joint_pub.publish(Float64MultiArray(data=[0, 0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, -0.5]))\n';
            break;
        case 'CUSTOM':
            code = '# 自定义姿态 - 需要手动设置关节角度\n';
            break;
    }
    
    code += 'rospy.sleep(1.0)\n';
    return code;
};

// Go2机器狗腿部控制
Go2Generator["go2_leg_control"] = function (block) {
    let leg = block.getFieldValue('LEG');
    let hipAngle = Blockly.JavaScript.valueToCode(block, 'HIP_ANGLE', Blockly.JavaScript.ORDER_COMMA) || 0;
    let thighAngle = Blockly.JavaScript.valueToCode(block, 'THIGH_ANGLE', Blockly.JavaScript.ORDER_COMMA) || 1.8;
    let calfAngle = Blockly.JavaScript.valueToCode(block, 'CALF_ANGLE', Blockly.JavaScript.ORDER_COMMA) || -1.8;
    
    let code = '';
    if (leg === 'ALL') {
        code = 'joint_pub.publish(Float64MultiArray(data=[' + hipAngle + ', ' + thighAngle + ', ' + calfAngle + ', ' + hipAngle + ', ' + thighAngle + ', ' + calfAngle + ', ' + hipAngle + ', ' + thighAngle + ', ' + calfAngle + ', ' + hipAngle + ', ' + thighAngle + ', ' + calfAngle + ']))\n';
    } else {
        // 为特定腿部设置关节角度
        let jointIndices = {
            'LF': [0, 1, 2],
            'RF': [3, 4, 5],
            'LR': [6, 7, 8],
            'RR': [9, 10, 11]
        };
        
        let indices = jointIndices[leg];
        code = '# 设置' + leg + '腿部关节\n';
        code += 'current_pose = [0] * 12\n';
        code += 'current_pose[' + indices[0] + '] = ' + hipAngle + '\n';
        code += 'current_pose[' + indices[1] + '] = ' + thighAngle + '\n';
        code += 'current_pose[' + indices[2] + '] = ' + calfAngle + '\n';
        code += 'joint_pub.publish(Float64MultiArray(data=current_pose))\n';
    }
    
    code += 'rospy.sleep(0.5)\n';
    return code;
};

// Go2机器狗物理引擎控制
Go2Generator["go2_physics"] = function (block) {
    let action = block.getFieldValue('PHYSICS_ACTION');
    
    let code = '';
    switch (action) {
        case 'ENABLE_GRAVITY':
            code = '# 启用重力模拟\n';
            code += 'print("重力已启用")\n';
            break;
        case 'DISABLE_GRAVITY':
            code = '# 禁用重力模拟\n';
            code += 'print("重力已禁用")\n';
            break;
        case 'DROP_TEST':
            code = '# 执行掉落测试\n';
            code += 'print("开始掉落测试")\n';
            break;
        case 'RESET_POSITION':
            code = '# 重置机器人位置\n';
            code += 'print("位置已重置")\n';
            break;
    }
    
    return code;
};

// Go2机器狗传感器
Go2Generator["go2_sensor"] = function (block) {
    let sensorType = block.getFieldValue('SENSOR_TYPE');
    
    let code = '';
    switch (sensorType) {
        case 'IMU':
            code = '0.0  # IMU数据 - 需要订阅相应的topic\n';
            break;
        case 'JOINT_POSITIONS':
            code = '[0] * 12  # 关节位置数组\n';
            break;
        case 'FOOT_CONTACT':
            code = '[True, True, True, True]  # 足部接触状态\n';
            break;
        case 'BATTERY':
            code = '100.0  # 电池电量百分比\n';
            break;
    }
    
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

// Loop
Go2Generator["loop"] = function (block) {
    let times = Blockly.JavaScript.valueToCode(block, 'TIMES', Blockly.JavaScript.ORDER_COMMA) || 1;
    let branch = Go2Generator.statementToCode(block, 'DO');
    let code = 'for i in range(' + times + '):\n' + Go2Generator.prefixLines(branch, Go2Generator.INDENT);
    return code;
};

// If statement
Go2Generator["if"] = function (block) {
    let condition = Blockly.JavaScript.valueToCode(block, 'IF', Blockly.JavaScript.ORDER_COMMA) || 'False';
    let branch = Go2Generator.statementToCode(block, 'DO');
    let code = 'if ' + condition + ':\n' + Go2Generator.prefixLines(branch, Go2Generator.INDENT);
    return code;
}; 