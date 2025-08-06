import Robot from './robotbase'
import Go2Generator from '../../editor/generators/go2'
const path = require('path');
var TWEEN = require('@tweenjs/tween.js');

// 计算机器狗站立时的实际高度
function calculateStandingHeight() {
    const thighLength = 0.213;
    const calfLength = 0.12;
    const footRadius = 0.022;
    
    // 当前关节角度（弧度）
    const upperLegAngle = 1.8; // 大腿角度
    const lowerLegAngle = -1.8; // 小腿角度
    
    // 计算大腿在Z方向的分量
    const thighZ = thighLength * Math.sin(upperLegAngle);
    
    // 计算小腿在Z方向的分量（相对于大腿）
    const calfZ = calfLength * Math.sin(lowerLegAngle + upperLegAngle);
    
    // 总高度 = 大腿Z分量 + 小腿Z分量 + 脚部半径
    const totalHeight = thighZ + calfZ + footRadius;
    
    console.log('Calculated standing height:', totalHeight);
    return totalHeight;
}

// 设置机器狗正确站立在地面上
function setRobotOnGround(robot) {
    if (robot.model && robot.model.position) {
        // 直接设置一个合理的站立高度
        const groundHeight = 0.15; // 地面高度
        robot.model.position.set(0, 0, groundHeight);
        console.log('Robot positioned on ground at height:', groundHeight);
    }
}

class Go2 extends Robot {
    constructor() {
        super("Go2", "go2_description-humble", "urdf/go2_detailed.urdf");
        this.robotRoot = "odom";
        this.handRoot = "base_link";
        this.modelScale = 0.5; // 缩小机器人尺寸，使其更精致
        // 设置机器人初始位置，让脚部接触地面
        this.initialPosition = [0, 0, 0.22]; // 进一步增加高度，确保脚部在地面上
        console.log('Go2 initial position set to:', this.initialPosition);
        this.defaultPose = {
            LF_hip_joint: 0,
            LF_upper_leg_joint: 0.0,  // 左前腿大腿角度
            LF_lower_leg_joint: 0.0,  // 左前腿小腿角度
            RF_hip_joint: 0,
            RF_upper_leg_joint: 0.5,  // 右前腿大腿角度（尝试正角度）
            RF_lower_leg_joint: -0.5, // 右前腿小腿角度（尝试负角度）
            LR_hip_joint: 0,
            LR_upper_leg_joint: 0.0,  // 左后腿大腿角度
            LR_lower_leg_joint: 0.0,  // 左后腿小腿角度
            RR_hip_joint: 0,
            RR_upper_leg_joint: 0.5,  // 右后腿大腿角度（尝试正角度）
            RR_lower_leg_joint: -0.5  // 右后腿小腿角度（尝试负角度）
        };
        this.tcp.parent = 'base_link';
        this.tcp.position = [0, 0, 0];
        this.tcp.rotation = [0, 0, 0];
        this.ikEnabled = [
            "LF_hip_joint",
            "LF_upper_leg_joint",
            "LF_lower_leg_joint",
            "RF_hip_joint",
            "RF_upper_leg_joint",
            "RF_lower_leg_joint",
            "LR_hip_joint",
            "LR_upper_leg_joint",
            "LR_lower_leg_joint",
            "RR_hip_joint",
            "RR_upper_leg_joint",
            "RR_lower_leg_joint"
        ];
        this.generator = Go2Generator;
        
        // 添加ROS宏配置，用于解析URDF中的$(find go2_description)
        this.rosMacros = {
            find: (packageName) => {
                if (packageName === 'go2_description') {
                    return path.join(this.root, 'go2_description-humble');
                }
                return path.join(this.root, packageName);
            }
        };
        
        // 添加机器人信息
        this.info = {
            DE: "Go2 ist ein vierbeiniger Roboter von Unitree Robotics. Er kann laufen, springen und verschiedene Bewegungen ausführen.",
            EN: "Go2 is a quadruped robot from Unitree Robotics. It can walk, jump and perform various movements."
        };
        
        // 启用物理引擎
        this.enablePhysics = true;
        
        // 添加调试函数：检查关节初始状态
        this.debugJoints = function() {
            console.log('=== 调试关节状态 ===');
            if (this.model && this.model.joints) {
                const allLegJoints = [
                    'LF_hip_joint', 'LF_upper_leg_joint', 'LF_lower_leg_joint',
                    'RF_hip_joint', 'RF_upper_leg_joint', 'RF_lower_leg_joint',
                    'LR_hip_joint', 'LR_upper_leg_joint', 'LR_lower_leg_joint',
                    'RR_hip_joint', 'RR_upper_leg_joint', 'RR_lower_leg_joint'
                ];
                
                allLegJoints.forEach(jointName => {
                    if (this.model.joints[jointName]) {
                        const joint = this.model.joints[jointName];
                        console.log(`${jointName}:`, {
                            angle: joint.angle,
                            hasSetJointValue: typeof joint.setJointValue === 'function',
                            jointType: joint.type || 'unknown'
                        });
                    } else {
                        console.error(`${jointName}: 不存在!`);
                    }
                });
            } else {
                console.error('模型或关节不可用');
            }
            console.log('=== 调试结束 ===');
        };
        
        // 添加测试方法：让机器狗掉落
        this.dropToGround = function() {
            console.log('Dropping robot to ground...');
            if (this.model && this.model.position) {
                this.model.position.set(0, 0, 0.5); // 设置一个较高的位置
                console.log('Robot position set to:', this.model.position);
            }
        };
        
        // 腿部行走动画方法 - 实现四足对角步态
        // 四足步态逻辑：
        // 1. 左前腿(LF)和右后腿(RR)为一组，同时抬起/放下
        // 2. 右前腿(RF)和左后腿(LR)为一组，与第一组交替运动
        // 3. 这样形成稳定的对角步态，符合四足动物行走的力学原理
        this.startWalkingAnimation = function(duration) {
            console.log('Starting walking animation for', duration, 'seconds');
            console.log('TWEEN library available:', typeof TWEEN !== 'undefined');
            console.log('Robot model joints:', self.model.joints);
            
            // 检查所有腿部关节
            const allLegJoints = [
                'LF_hip_joint', 'LF_upper_leg_joint', 'LF_lower_leg_joint',
                'RF_hip_joint', 'RF_upper_leg_joint', 'RF_lower_leg_joint',
                'LR_hip_joint', 'LR_upper_leg_joint', 'LR_lower_leg_joint',
                'RR_hip_joint', 'RR_upper_leg_joint', 'RR_lower_leg_joint'
            ];
            
            allLegJoints.forEach(jointName => {
                if (self.model.joints && self.model.joints[jointName]) {
                    const joint = self.model.joints[jointName];
                    console.log(`关节 ${jointName}:`, {
                        angle: joint.angle,
                        hasSetJointValue: typeof joint.setJointValue === 'function',
                        joint: joint
                    });
                } else {
                    console.error(`关节 ${jointName} 不存在!`);
                }
            });
            
            try {
                if (!self.model || !self.model.joints) {
                    console.error('Robot model or joints not available');
                    return;
                }
            
            // 定义腿部关节名称
            const legJoints = {
                LF: ['LF_hip_joint', 'LF_upper_leg_joint', 'LF_lower_leg_joint'],
                RF: ['RF_hip_joint', 'RF_upper_leg_joint', 'RF_lower_leg_joint'],
                LR: ['LR_hip_joint', 'LR_upper_leg_joint', 'LR_lower_leg_joint'],
                RR: ['RR_hip_joint', 'RR_upper_leg_joint', 'RR_lower_leg_joint']
            };
            
            // 行走步态参数
            const stepFrequency = 2.0; // 步频（每秒步数）
            const stepDuration = 1000 / stepFrequency; // 每步持续时间（毫秒）
            
            // 为每条腿创建行走动画
            Object.keys(legJoints).forEach((leg, legIndex) => {
                const joints = legJoints[leg];
                // 修复相位计算：确保每条腿都有不同的相位，并且左前腿有动画
                const phaseOffset = (legIndex * Math.PI) / 2; // 四足步态相位差
                
                console.log(`Creating animation for leg ${leg} with phase offset: ${phaseOffset}`);
                
                // 创建腿部摆动动画
                joints.forEach((jointName, jointIndex) => {
                    if (self.model.joints && self.model.joints[jointName]) {
                        const joint = self.model.joints[jointName];
                        const currentAngle = joint.angle || 0;
                        
                        // 根据关节类型设置不同的动画
                        let targetAngle = currentAngle;
                        let amplitude = 0;
                        
                        if (jointName.includes('upper_leg')) {
                            // 大腿关节：上下摆动 - 增加幅度确保可见
                            amplitude = 1.0;
                            // 确保所有腿都有动画，包括左前腿
                            targetAngle = currentAngle + Math.sin(phaseOffset) * amplitude;
                        } else if (jointName.includes('lower_leg')) {
                            // 小腿关节：补偿摆动 - 增加幅度确保可见
                            amplitude = 0.8;
                            targetAngle = currentAngle - Math.sin(phaseOffset) * amplitude;
                        } else if (jointName.includes('hip')) {
                            // 髋关节：轻微摆动 - 增加幅度确保可见
                            amplitude = 0.4;
                            targetAngle = currentAngle + Math.sin(phaseOffset) * amplitude;
                        }
                        
                        // 实现正确的四足步态：对角步态
                        // 左前腿(LF)和右后腿(RR)为一组，右前腿(RF)和左后腿(LR)为一组
                        if (leg === 'LF' || leg === 'RR') {
                            // 第一组腿：左前腿和右后腿
                            if (jointName.includes('upper_leg')) {
                                targetAngle = currentAngle + 0.8; // 大腿抬起
                            } else if (jointName.includes('lower_leg')) {
                                targetAngle = currentAngle - 0.6; // 小腿配合
                            } else if (jointName.includes('hip')) {
                                targetAngle = currentAngle + 0.3; // 髋关节轻微摆动
                            }
                            console.log(`第一组腿 ${leg} 关节 ${jointName}: 抬起动作, current=${currentAngle}, target=${targetAngle}`);
                        } else if (leg === 'RF' || leg === 'LR') {
                            // 第二组腿：右前腿和左后腿
                            if (jointName.includes('upper_leg')) {
                                targetAngle = currentAngle - 0.8; // 大腿放下
                            } else if (jointName.includes('lower_leg')) {
                                targetAngle = currentAngle + 0.6; // 小腿配合
                            } else if (jointName.includes('hip')) {
                                targetAngle = currentAngle - 0.3; // 髋关节轻微摆动
                            }
                            console.log(`第二组腿 ${leg} 关节 ${jointName}: 放下动作, current=${currentAngle}, target=${targetAngle}`);
                        }
                        
                        // 创建关节动画 - 实现交替步态
                        const jointTween = new TWEEN.Tween({ angle: currentAngle })
                            .to({ angle: targetAngle }, stepDuration) // 使用完整步长时间
                            .easing(TWEEN.Easing.Sinusoidal.InOut)
                            .onUpdate(function(obj) {
                                if (joint && typeof joint.setJointValue === 'function') {
                                    joint.setJointValue(obj.angle);
                                }
                            })
                            .yoyo(true)
                            .repeat(Math.floor(duration * stepFrequency)); // 标准重复次数
                        
                        jointTween.start();
                    } else {
                        console.warn(`Joint ${jointName} not found in robot model`);
                    }
                });
            });
            } catch (error) {
                console.error('Error in walking animation:', error);
            }
        };
        
        // 物理引擎控制方法
        this.physicsControl = {
            enableGravity: function() {
                console.log('Enabling gravity for Go2');
                // 这里可以启用物理引擎的重力
            },
            disableGravity: function() {
                console.log('Disabling gravity for Go2');
                // 这里可以禁用物理引擎的重力
            },
            dropTest: function() {
                console.log('Starting drop test for Go2');
                if (this.model && this.model.position) {
                    this.model.position.set(0, 0, 1.0); // 设置到高处
                }
            },
            resetPosition: function() {
                console.log('Resetting Go2 position');
                if (this.model && this.model.position) {
                    this.model.position.set(0, 0, standingHeight * this.modelScale);
                }
            }
        };
        
        // 行走控制方法
        const self = this; // 保存this引用
        this.walkControl = {
            forward: function(speed = 0.5, duration = 1.0) {
                console.log('Go2 walking forward with speed:', speed, 'duration:', duration);
                // 实现前进动画
                if (self.model && self.model.position) {
                    // 计算移动距离
                    const distance = speed * duration;
                    
                    // 获取机器狗当前的朝向角度（Z轴旋转）
                    const currentRotationZ = self.model.rotation.z || 0;
                    
                    // 根据机器狗的朝向计算前进方向
                    const deltaX = distance * Math.cos(currentRotationZ);
                    const deltaY = distance * Math.sin(currentRotationZ);
                    
                    const currentX = self.model.position.x;
                    const currentY = self.model.position.y;
                    const targetX = currentX + deltaX;
                    const targetY = currentY + deltaY;
                    
                    console.log('Robot orientation (Z rotation):', currentRotationZ);
                    console.log('Forward direction: deltaX =', deltaX, 'deltaY =', deltaY);
                    console.log('Animation: moving from (', currentX, ',', currentY, ') to (', targetX, ',', targetY, ') over', duration, 'seconds');
                    
                    // 创建位置动画（同时更新X和Y坐标）
                    const positionTween = new TWEEN.Tween({ x: currentX, y: currentY })
                        .to({ x: targetX, y: targetY }, duration * 1000)
                        .easing(TWEEN.Easing.Linear.None)
                        .onUpdate(function(obj) {
                            self.model.position.x = obj.x;
                            self.model.position.y = obj.y;
                            console.log('Animation update: position = (', obj.x, ',', obj.y, ')');
                        })
                        .onComplete(function() {
                            console.log('Forward animation completed');
                        });
                    
                    // 创建腿部行走动画
                    self.startWalkingAnimation(duration);
                    
                    positionTween.start();
                    console.log('Forward animation started');
                } else {
                    console.error('Robot model or position not available');
                }
            },
            backward: function(speed = 0.5, duration = 1.0) {
                console.log('Go2 walking backward with speed:', speed, 'duration:', duration);
                if (self.model && self.model.position) {
                    const distance = speed * duration;
                    
                    // 获取机器狗当前的朝向角度（Z轴旋转）
                    const currentRotationZ = self.model.rotation.z || 0;
                    
                    // 根据机器狗的朝向计算后退方向（与前进方向相反）
                    const deltaX = -distance * Math.cos(currentRotationZ);
                    const deltaY = -distance * Math.sin(currentRotationZ);
                    
                    const currentX = self.model.position.x;
                    const currentY = self.model.position.y;
                    const targetX = currentX + deltaX;
                    const targetY = currentY + deltaY;
                    
                    console.log('Robot orientation (Z rotation):', currentRotationZ);
                    console.log('Backward direction: deltaX =', deltaX, 'deltaY =', deltaY);
                    console.log('Animation: moving from (', currentX, ',', currentY, ') to (', targetX, ',', targetY, ') over', duration, 'seconds');
                    
                    // 创建位置动画（同时更新X和Y坐标）
                    const positionTween = new TWEEN.Tween({ x: currentX, y: currentY })
                        .to({ x: targetX, y: targetY }, duration * 1000)
                        .easing(TWEEN.Easing.Linear.None)
                        .onUpdate(function(obj) {
                            self.model.position.x = obj.x;
                            self.model.position.y = obj.y;
                            console.log('Animation update: position = (', obj.x, ',', obj.y, ')');
                        })
                        .onComplete(function() {
                            console.log('Backward animation completed');
                        });
                    
                    // 创建腿部行走动画
                    self.startWalkingAnimation(duration);
                    
                    positionTween.start();
                    console.log('Backward animation started');
                } else {
                    console.error('Robot model or position not available');
                }
            },
            turnLeft: function(speed = 0.5, duration = 1.0) {
                console.log('Go2 turning left with speed:', speed, 'duration:', duration);
                if (self.model && self.model.rotation) {
                    // 限制转向角度，避免过度旋转
                    const maxAngle = Math.PI / 4; // 最大45度
                    const angle = Math.min(speed * duration, maxAngle);
                    
                    // 检查当前旋转状态
                    console.log('Current rotation:', {
                        x: self.model.rotation.x,
                        y: self.model.rotation.y,
                        z: self.model.rotation.z
                    });
                    
                    const currentZ = self.model.rotation.z;
                    // 绕Z轴旋转：左转为正方向
                    const targetZ = currentZ + angle;
                    
                    console.log('Turn animation: rotating Z from', currentZ, 'to', targetZ, 'over', duration, 'seconds');
                    console.log('LEFT turn: rotating around Z-axis (upward axis)');
                    
                    // 直接设置rotation.z，但确保只旋转Z轴
                    const tween = new TWEEN.Tween({ z: currentZ })
                        .to({ z: targetZ }, duration * 1000)
                        .easing(TWEEN.Easing.Linear.None)
                        .onUpdate(function(obj) {
                            // 只修改Z轴旋转，保持X和Y轴不变
                            self.model.rotation.z = obj.z;
                            // 确保X和Y轴旋转为0
                            self.model.rotation.x = 0;
                            self.model.rotation.y = 0;
                        })
                        .onComplete(function() {
                            console.log('Turn left animation completed');
                            console.log('Final rotation:', {
                                x: self.model.rotation.x,
                                y: self.model.rotation.y,
                                z: self.model.rotation.z
                            });
                            // 转向完成后，立即回到正常站立姿态
                            if (self.poseControl && self.poseControl.stand) {
                                self.poseControl.stand();
                            }
                        });
                    
                    // 转向时不使用腿部行走动画，避免姿态冲突
                    // self.startWalkingAnimation(duration);
                    
                    tween.start();
                }
            },
            turnRight: function(speed = 0.5, duration = 1.0) {
                console.log('Go2 turning right with speed:', speed, 'duration:', duration);
                if (self.model && self.model.rotation) {
                    // 限制转向角度，避免过度旋转
                    const maxAngle = Math.PI / 4; // 最大45度
                    const angle = Math.min(speed * duration, maxAngle);
                    
                    // 检查当前旋转状态
                    console.log('Current rotation:', {
                        x: self.model.rotation.x,
                        y: self.model.rotation.y,
                        z: self.model.rotation.z
                    });
                    
                    const currentZ = self.model.rotation.z;
                    // 绕Z轴旋转：右转为负方向
                    const targetZ = currentZ - angle;
                    
                    console.log('Turn animation: rotating Z from', currentZ, 'to', targetZ, 'over', duration, 'seconds');
                    console.log('RIGHT turn: rotating around Z-axis (upward axis)');
                    
                    // 直接设置rotation.z，但确保只旋转Z轴
                    const tween = new TWEEN.Tween({ z: currentZ })
                        .to({ z: targetZ }, duration * 1000)
                        .easing(TWEEN.Easing.Linear.None)
                        .onUpdate(function(obj) {
                            // 只修改Z轴旋转，保持X和Y轴不变
                            self.model.rotation.z = obj.z;
                            // 确保X和Y轴旋转为0
                            self.model.rotation.x = 0;
                            self.model.rotation.y = 0;
                        })
                        .onComplete(function() {
                            console.log('Turn right animation completed');
                            console.log('Final rotation:', {
                                x: self.model.rotation.x,
                                y: self.model.rotation.y,
                                z: self.model.rotation.z
                            });
                            // 转向完成后，立即回到正常站立姿态
                            if (self.poseControl && self.poseControl.stand) {
                                self.poseControl.stand();
                            }
                        });
                    
                    // 转向时不使用腿部行走动画，避免姿态冲突
                    // self.startWalkingAnimation(duration);
                    
                    tween.start();
                }
            },
            stop: function() {
                console.log('Go2 stopping');
                // 停止所有动画
                TWEEN.removeAll();
                
                // 回到站立姿态
                if (self.poseControl && self.poseControl.stand) {
                    self.poseControl.stand();
                }
            }
        };
        
        // 姿态控制方法
        this.poseControl = {
            stand: function() {
                console.log('Go2 standing pose - adjusted right leg angles');
                this.setPose({
                    LF_hip_joint: 0, LF_upper_leg_joint: 0.0, LF_lower_leg_joint: 0.0,
                    RF_hip_joint: 0, RF_upper_leg_joint: 0.5, RF_lower_leg_joint: -0.5,
                    LR_hip_joint: 0, LR_upper_leg_joint: 0.0, LR_lower_leg_joint: 0.0,
                    RR_hip_joint: 0, RR_upper_leg_joint: 0.5, RR_lower_leg_joint: -0.5
                });
            }.bind(this),
            squat: function() {
                console.log('Go2 squatting pose');
                this.setPose({
                    LF_hip_joint: 0, LF_upper_leg_joint: 2.5, LF_lower_leg_joint: -2.5,
                    RF_hip_joint: 0, RF_upper_leg_joint: 2.5, RF_lower_leg_joint: -2.5,
                    LR_hip_joint: 0, LR_upper_leg_joint: 2.5, LR_lower_leg_joint: -2.5,
                    RR_hip_joint: 0, RR_upper_leg_joint: 2.5, RR_lower_leg_joint: -2.5
                });
            }.bind(this),
            lieDown: function() {
                console.log('Go2 lying down pose');
                this.setPose({
                    LF_hip_joint: 0, LF_upper_leg_joint: 3.0, LF_lower_leg_joint: -3.0,
                    RF_hip_joint: 0, RF_upper_leg_joint: 3.0, RF_lower_leg_joint: -3.0,
                    LR_hip_joint: 0, LR_upper_leg_joint: 3.0, LR_lower_leg_joint: -3.0,
                    RR_hip_joint: 0, RR_upper_leg_joint: 3.0, RR_lower_leg_joint: -3.0
                });
            }.bind(this),
            jump: function() {
                console.log('Go2 jumping pose');
                this.setPose({
                    LF_hip_joint: 0, LF_upper_leg_joint: 0.5, LF_lower_leg_joint: -0.5,
                    RF_hip_joint: 0, RF_upper_leg_joint: 0.5, RF_lower_leg_joint: -0.5,
                    LR_hip_joint: 0, LR_upper_leg_joint: 0.5, LR_lower_leg_joint: -0.5,
                    RR_hip_joint: 0, RR_upper_leg_joint: 0.5, RR_lower_leg_joint: -0.5
                });
            }.bind(this)
        };
    }
}

module.exports = new Go2();