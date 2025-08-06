import Robot from './robotbase'
import G1Generator from '../../editor/generators/g1'
const path = require('path');
var TWEEN = require('@tweenjs/tween.js');

// 设置人形机器人站立时的实际高度
function calculateStandingHeight() {
    const hipHeight = 0.793; // 骨盆高度
    const torsoHeight = 0.3; // 躯干高度
    const headHeight = 0.2; // 头部高度
    
    // 总高度 = 骨盆高度 + 躯干高度 + 头部高度
    const totalHeight = hipHeight + torsoHeight + headHeight;
    
    console.log('Calculated G1 standing height:', totalHeight);
    return totalHeight;
}

// 设置机器人正确站立在地面上
function setRobotOnGround(robot) {
    if (robot.model && robot.model.position) {
        // 直接设置一个合理的站立高度
        const groundHeight = 0.8; // 地面高度
        robot.model.position.set(0, 0, groundHeight);
        console.log('G1 Robot positioned on ground at height:', groundHeight);
    }
}

class G1 extends Robot {
    constructor() {
        super("G1", "g1_description", "urdf/g1_simple_test.urdf");
        this.robotRoot = "world";
        this.handRoot = "pelvis"; // 对于人形机器人，从骨盆开始遍历
        this.modelScale = 1.0; // 保持原始尺寸
        // 设置机器人初始位置，让脚部接触地面
        this.initialPosition = [0, 0, 0.8]; // 设置站立高度
        console.log('G1 initial position set to:', this.initialPosition);
        
        // 使用标准的xacro路径设置
        console.log('G1 xacro path set to:', this._xacro);
        
        // 默认姿态 - 人形机器人站立姿态
        this.defaultPose = {
            // 左腿关节
            left_hip_pitch_joint: 0.0,
            left_hip_roll_joint: 0.0,
            left_hip_yaw_joint: 0.0,
            left_knee_joint: 0.0,
            left_ankle_pitch_joint: 0.0,
            left_ankle_roll_joint: 0.0,
            
            // 右腿关节
            right_hip_pitch_joint: 0.0,
            right_hip_roll_joint: 0.0,
            right_hip_yaw_joint: 0.0,
            right_knee_joint: 0.0,
            right_ankle_pitch_joint: 0.0,
            right_ankle_roll_joint: 0.0,
            
            // 躯干关节
            waist_yaw_joint: 0.0,
            waist_roll_joint: 0.0,
            
            // 左臂关节
            left_shoulder_pitch_joint: 0.0,
            left_shoulder_roll_joint: 0.0,
            left_elbow_joint: 0.0,
            left_wrist_roll_joint: 0.0,
            left_wrist_pitch_joint: 0.0,
            left_wrist_yaw_joint: 0.0,
            
            // 右臂关节
            right_shoulder_pitch_joint: 0.0,
            right_shoulder_roll_joint: 0.0,
            right_elbow_joint: 0.0,
            right_wrist_roll_joint: 0.0,
            right_wrist_pitch_joint: 0.0,
            right_wrist_yaw_joint: 0.0
        };
        
        // TCP (Tool Center Point) 设置
        this.tcp.parent = 'left_wrist_yaw_link';
        this.tcp.position = [0, 0, 0.1]; // 手腕末端
        this.tcp.rotation = [0, 0, 0];
        
        // 启用逆运动学的关节
        this.ikEnabled = [
            // 左腿
            "left_hip_pitch_joint",
            "left_hip_roll_joint", 
            "left_hip_yaw_joint",
            "left_knee_joint",
            "left_ankle_pitch_joint",
            "left_ankle_roll_joint",
            
            // 右腿
            "right_hip_pitch_joint",
            "right_hip_roll_joint",
            "right_hip_yaw_joint", 
            "right_knee_joint",
            "right_ankle_pitch_joint",
            "right_ankle_roll_joint",
            
            // 躯干
            "waist_yaw_joint",
            "waist_roll_joint",
            
            // 左臂
            "left_shoulder_pitch_joint",
            "left_shoulder_roll_joint",
            "left_elbow_joint",
            "left_wrist_roll_joint",
            "left_wrist_pitch_joint",
            "left_wrist_yaw_joint",
            
            // 右臂
            "right_shoulder_pitch_joint",
            "right_shoulder_roll_joint",
            "right_elbow_joint",
            "right_wrist_roll_joint",
            "right_wrist_pitch_joint",
            "right_wrist_yaw_joint"
        ];
        
        this.generator = G1Generator;
        
        // 添加ROS宏配置，用于解析URDF中的$(find g1_description)
        this.rosMacros = {
            find: (packageName) => {
                if (packageName === 'g1_description') {
                    return path.join(this.root, 'g1_description');
                }
                return path.join(this.root, packageName);
            }
        };
        
        // 添加机器人信息
        this.info = {
            DE: "G1 ist ein humanoider Roboter von Unitree Robotics. Er kann laufen, greifen und verschiedene Bewegungen ausführen.",
            EN: "G1 is a humanoid robot from Unitree Robotics. It can walk, grasp and perform various movements."
        };
        
        // 启用物理引擎
        this.enablePhysics = true;
        
        // 设置机器人部件名称
        this.partNames = {
            arm: [
                "left_shoulder_pitch_joint",
                "left_shoulder_roll_joint", 
                "left_elbow_joint",
                "left_wrist_roll_joint",
                "left_wrist_pitch_joint",
                "left_wrist_yaw_joint",
                "right_shoulder_pitch_joint",
                "right_shoulder_roll_joint",
                "right_elbow_joint", 
                "right_wrist_roll_joint",
                "right_wrist_pitch_joint",
                "right_wrist_yaw_joint"
            ],
            hand: [
                "left_wrist_roll_joint",
                "left_wrist_pitch_joint", 
                "left_wrist_yaw_joint",
                "right_wrist_roll_joint",
                "right_wrist_pitch_joint",
                "right_wrist_yaw_joint"
            ],
            leg: [
                "left_hip_pitch_joint",
                "left_hip_roll_joint",
                "left_hip_yaw_joint", 
                "left_knee_joint",
                "left_ankle_pitch_joint",
                "left_ankle_roll_joint",
                "right_hip_pitch_joint",
                "right_hip_roll_joint",
                "right_hip_yaw_joint",
                "right_knee_joint", 
                "right_ankle_pitch_joint",
                "right_ankle_roll_joint"
            ],
            torso: [
                "waist_yaw_joint",
                "waist_roll_joint"
            ]
        };
        
        // 关节速度限制
        this.maxSpeed = {
            move: 1.0,
            gripper: 0.2
        };
        
        // 关节交互限制
        this.interactionJointLimits = {
            left_hip_pitch_joint: {
                lower: -2.5307,
                upper: 2.8798,
            },
            left_hip_roll_joint: {
                lower: -0.5236,
                upper: 2.9671,
            },
            left_hip_yaw_joint: {
                lower: -2.7576,
                upper: 2.7576,
            },
            left_knee_joint: {
                lower: -0.087267,
                upper: 2.8798,
            },
            left_ankle_pitch_joint: {
                lower: -0.87267,
                upper: 0.5236,
            },
            left_ankle_roll_joint: {
                lower: -0.2618,
                upper: 0.2618,
            },
            right_hip_pitch_joint: {
                lower: -2.5307,
                upper: 2.8798,
            },
            right_hip_roll_joint: {
                lower: -2.9671,
                upper: 0.5236,
            },
            right_hip_yaw_joint: {
                lower: -2.7576,
                upper: 2.7576,
            },
            right_knee_joint: {
                lower: -0.087267,
                upper: 2.8798,
            },
            right_ankle_pitch_joint: {
                lower: -0.87267,
                upper: 0.5236,
            },
            right_ankle_roll_joint: {
                lower: -0.2618,
                upper: 0.2618,
            }
        };
    }

    init(model) {
        super.init(model);
        
        // 对于人形机器人，我们需要手动设置arm.movable
        // 因为默认的遍历方式不适合人形机器人的结构
        this.arm.movable = [];
        this.arm.joints = [];
        this.arm.links = [];
        
        // 添加所有可移动的关节到arm.movable
        for (let jointName in this.joints) {
            const joint = this.joints[jointName];
            if (this.isMovable(joint)) {
                this.arm.movable.push(joint);
                this.arm.joints.push(joint);
            }
        }
        
        // 添加所有链接到arm.links
        for (let linkName in this.links) {
            this.arm.links.push(this.links[linkName]);
        }
        
        console.log('G1 robot initialized with', this.arm.movable.length, 'movable joints');
    }

    onLoadComplete() {
        super.onLoadComplete();
        
        // 设置机器人初始位置
        setRobotOnGround(this);
        
        // 应用默认姿态
        this.setPose(this.defaultPose);
        
        console.log('G1 robot loaded successfully');
    }

    // 重写isArm方法以包含人形机器人的手臂
    isArm(part) {
        return this.partNames.arm.includes(part);
    }

    // 重写isHand方法以包含人形机器人的手部
    isHand(part) {
        return this.partNames.hand.includes(part);
    }

    // 添加腿部检查方法
    isLeg(part) {
        return this.partNames.leg.includes(part);
    }

    // 添加躯干检查方法
    isTorso(part) {
        return this.partNames.torso.includes(part);
    }

    // 重写isMovable方法以包含所有可移动部件
    isMovable(part) {
        // 如果part是关节对象，检查其名称
        if (part && part.name) {
            return this.isArm(part.name) || this.isHand(part.name) || this.isLeg(part.name) || this.isTorso(part.name);
        }
        // 如果part是字符串（关节名称）
        if (typeof part === 'string') {
            return this.isArm(part) || this.isHand(part) || this.isLeg(part) || this.isTorso(part);
        }
        return false;
    }

    // 重写isIKEnabled方法
    isIKEnabled(part) {
        return this.ikEnabled.includes(part);
    }

    // 获取夹爪状态（对于人形机器人，使用手腕关节）
    isGripperOpen() {
        // 检查手腕关节是否处于打开状态
        const leftWristPitch = this.getJointValue('left_wrist_pitch_joint') || 0;
        const rightWristPitch = this.getJointValue('right_wrist_pitch_joint') || 0;
        
        // 如果手腕关节角度大于阈值，认为夹爪是打开的
        const threshold = 0.5;
        return Math.abs(leftWristPitch) > threshold || Math.abs(rightWristPitch) > threshold;
    }

    // 获取夹爪开合角度
    getGripperAbduction() {
        const leftWristPitch = this.getJointValue('left_wrist_pitch_joint') || 0;
        const rightWristPitch = this.getJointValue('right_wrist_pitch_joint') || 0;
        
        // 返回手腕关节的平均角度
        return (Math.abs(leftWristPitch) + Math.abs(rightWristPitch)) / 2;
    }

    // 设置夹爪开合
    setGripperAbduction(abduction) {
        const angle = Math.max(0, Math.min(abduction, Math.PI / 2));
        
        // 设置左右手腕关节
        this.setJointValue('left_wrist_pitch_joint', angle);
        this.setJointValue('right_wrist_pitch_joint', angle);
    }

    // 获取关节值
    getJointValue(jointName) {
        if (this.joints[jointName]) {
            return this.joints[jointName].rotation.z;
        }
        return 0;
    }

    // 设置关节值
    setJointValue(jointName, value) {
        if (this.joints[jointName]) {
            this.joints[jointName].rotation.z = value;
        }
    }

    // 创建人形机器人的骨架结构
    createSkeleton() {
        const skeleton = super.createSkeleton();
        
        // 添加腿部骨架
        if (this.links['left_hip_pitch_link']) {
            skeleton.add(this.links['left_hip_pitch_link']);
        }
        if (this.links['right_hip_pitch_link']) {
            skeleton.add(this.links['right_hip_pitch_link']);
        }
        
        // 添加躯干骨架
        if (this.links['torso_link']) {
            skeleton.add(this.links['torso_link']);
        }
        
        // 添加头部骨架
        if (this.links['head_link']) {
            skeleton.add(this.links['head_link']);
        }
        
        return skeleton;
    }

    // 更新机器人状态
    update(deltaTime) {
        super.update(deltaTime);
        
        // 可以在这里添加G1特有的更新逻辑
        // 例如：平衡控制、步态规划等
    }

    // 重置机器人到初始状态
    reset() {
        super.reset();
        this.setPose(this.defaultPose);
        setRobotOnGround(this);
    }

    // 获取机器人信息
    getInfo() {
        return this.info;
    }
    
    // 直接返回有效的xacro路径
    get xacro() {
        // 直接使用相对路径，避免path.join的问题
        const relativePath = './models/' + this._package + this._xacro;
        console.log('G1 xacro path:', relativePath);
        return relativePath;
    }
}

module.exports = new G1(); 