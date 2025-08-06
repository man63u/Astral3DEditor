# Go2机器人集成到Rocksi-master项目

## 项目概述

本项目成功将宇树科技Go2四足机器人模型集成到Rocksi-master前端应用中，实现了完整的3D可视化、物理引擎支持、动画控制和Blockly编程功能。

## 功能特性

### 🦮 机器人模型
- **完整四足机器人模型**：基于URDF/Xacro的Go2机器人描述文件
- **高精度3D渲染**：使用Three.js实现高质量3D可视化
- **物理引擎集成**：Cannon.js物理引擎支持重力、碰撞检测
- **关节动画**：12个关节的实时动画控制

### 🎮 控制功能
- **基础移动**：前进、后退、左转、右转
- **四足步态**：对角步态（Diagonal Gait）实现
- **姿态控制**：站立、蹲下等预设姿态
- **关节控制**：单个关节精确控制
- **物理交互**：重力、碰撞、约束

### 🧩 Blockly编程
- **可视化编程**：卡片式编程界面
- **Go2专用模块**：机器狗专用编程块
- **代码生成**：Python和JavaScript代码自动生成
- **实时执行**：程序实时执行和动画展示

## 技术架构

### 前端技术栈
- **Three.js**：3D渲染引擎
- **Cannon.js**：物理引擎
- **TWEEN.js**：动画引擎
- **Blockly**：可视化编程
- **URDFLoader**：机器人模型加载

### 核心模块
```
Rocksi-master/
├── src/
│   ├── simulator/
│   │   ├── robots/
│   │   │   ├── go2.js              # Go2机器人控制逻辑
│   │   │   └── index.js            # 机器人注册
│   │   ├── scene.js                # 3D场景管理
│   │   ├── physics.js              # 物理引擎
│   │   └── simulation.js           # 仿真控制
│   ├── editor/
│   │   ├── blocks/
│   │   │   └── go2_movement.js     # Go2 Blockly块定义
│   │   ├── generators/
│   │   │   ├── go2.js              # Python代码生成器
│   │   │   └── javascript.js       # JavaScript代码生成器
│   │   ├── blockly.js              # Blockly初始化
│   │   └── toolbox.xml             # 编程工具箱
│   └── assets/
│       └── models/
│           └── go2_description-humble/
│               └── urdf/
│                   ├── go2_detailed.urdf      # 完整URDF文件
│                   └── dae/                   # 3D模型文件
```

## 安装和配置

### 1. 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 2. 安装依赖
```bash
# cd Rocksi-master
# npm install
# 如果遇到依赖问题，可尝试
npm install --legacy-peer-deps
npm run dev
```

### 3. 启动项目
```bash
npm start
```

### 4. 访问应用
打开浏览器访问 `http://localhost:3000`

## 主要修改内容

### 1. 机器人模型集成

#### 1.1 创建Go2机器人类 (`src/simulator/robots/go2.js`)

```javascript
class Go2 extends RobotBase {
    constructor() {
        super("Go2", "go2_description-humble", "urdf/go2_detailed.urdf");
        
        // 机器人配置
        this.robotRoot = "odom";
        this.initialPosition = [0, 0, 0.22];
        this.modelScale = 0.5;
        this.enablePhysics = true;
        
        // 关节配置
        this.defaultPose = {
            LF_hip_joint: 0, LF_upper_leg_joint: 0.0, LF_lower_leg_joint: 0.0,
            RF_hip_joint: 0, RF_upper_leg_joint: 0.5, RF_lower_leg_joint: -0.5,
            LR_hip_joint: 0, LR_upper_leg_joint: 0.0, LR_lower_leg_joint: 0.0,
            RR_hip_joint: 0, RR_upper_leg_joint: 0.5, RR_lower_leg_joint: -0.5
        };
        
        // 控制功能
        this.walkControl = { forward, backward, turnLeft, turnRight, stop };
        this.poseControl = { stand, sit, lie };
        this.physicsControl = { enableGravity, dropToGround };
    }
}
```

#### 1.2 注册机器人 (`src/simulator/robots/index.js`)

```javascript
module.exports = {
    // ... 其他机器人
    go2_description_humble: require('./go2')
};
```

### 2. 3D场景和物理引擎

#### 2.1 场景管理 (`src/simulator/scene.js`)

```javascript
// 添加Go2机器人支持
case 'unitree_go2':
    robot = new (require('./robots/go2'))();
    break;

// 物理引擎初始化
if (robot.enablePhysics) {
    initRobotPhysics(robot);
}

// 动画循环
function startTweenLoop() {
    TWEEN.update();
    requestAnimationFrame(startTweenLoop);
}
```

#### 2.2 物理引擎集成

```javascript
// 创建物理体
function createPhysicsBodyForLink(link, geometry) {
    let body;
    if (geometry.type === 'BoxGeometry') {
        body = new CANNON.Body({ mass: 1 });
        body.addShape(new CANNON.Box(new CANNON.Vec3(
            geometry.parameters.width / 2,
            geometry.parameters.height / 2,
            geometry.parameters.depth / 2
        )));
    }
    // ... 其他几何体
    return body;
}
```

### 3. 动画系统

<!-- #### 3.1 四足步态实现

```javascript
function startWalkingAnimation(duration) {
    const stepFrequency = 2.0;
    const stepDuration = duration / stepFrequency;
    
    // 对角步态：LF+RR vs RF+LR
    const group1 = ['LF', 'RR']; // 第一组：抬起
    const group2 = ['RF', 'LR']; // 第二组：放下
    
    group1.forEach(leg => {
        animateLeg(leg, 'up', stepDuration);
    });
    
    group2.forEach(leg => {
        animateLeg(leg, 'down', stepDuration);
    });
}
``` -->

<!-- #### 3.2 关节动画

```javascript
function animateLeg(leg, action, duration) {
    const joints = [
        `${leg}_hip_joint`,
        `${leg}_upper_leg_joint`, 
        `${leg}_lower_leg_joint`
    ];
    
    const amplitudes = action === 'up' 
        ? [0.3, 0.8, -0.6]  // 抬起姿态
        : [-0.3, -0.8, 0.6]; // 放下姿态
    
    joints.forEach((jointName, index) => {
        const joint = this.model.joints[jointName];
        if (joint && typeof joint.setJointValue === 'function') {
            const targetAngle = joint.angle + amplitudes[index];
            new TWEEN.Tween({ angle: joint.angle })
                .to({ angle: targetAngle }, duration)
                .onUpdate(obj => joint.setJointValue(obj.angle))
                .start();
        }
    });
}
``` -->

### 4. Blockly编程系统

#### 4.1 自定义编程块 (`src/editor/blocks/go2_movement.js`)

```javascript
Blockly.Blocks['go2_walk'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Go2")
            .appendField(new Blockly.FieldDropdown([
                ["前进", "FORWARD"],
                ["后退", "BACKWARD"], 
                ["左转", "TURN_LEFT"],
                ["右转", "TURN_RIGHT"]
            ]), "DIRECTION")
            .appendField("速度")
            .appendField(new Blockly.FieldNumber(1, 0, 5), "SPEED")
            .appendField("持续时间")
            .appendField(new Blockly.FieldNumber(2, 0.1, 10), "DURATION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
    }
};
```

#### 4.2 代码生成器

**Python代码生成器 (`src/editor/generators/go2.js`)**
```javascript
Blockly.Python['go2_walk'] = function(block) {
    const direction = block.getFieldValue('DIRECTION');
    const speed = block.getFieldValue('SPEED');
    const duration = block.getFieldValue('DURATION');
    
    return `robot.go2_walk("${direction}", ${speed}, ${duration})\n`;
};
```

**JavaScript代码生成器 (`src/editor/generators/javascript.js`)**
```javascript
Blockly.JavaScript['go2_walk'] = function(block) {
    const direction = block.getFieldValue('DIRECTION');
    const speed = block.getFieldValue('SPEED');
    const duration = block.getFieldValue('DURATION');
    
    return `robot("go2_walk", "${direction}", ${speed}, ${duration});\n`;
};
```

#### 4.3 工具箱配置 (`src/editor/toolbox.xml`)

```xml
<category name="Go2机器狗" categorystyle="go2_category">
    <block type="go2_walk"></block>
    <block type="go2_pose"></block>
    <block type="go2_leg_control"></block>
    <block type="go2_physics"></block>
    <block type="go2_sensor"></block>
</category>
```

### 5. URDF模型文件

#### 5.1 完整URDF文件 (`assets/models/go2_description-humble/urdf/go2_detailed.urdf`)

```xml
<?xml version="1.0"?>
<robot name="go2">
    <!-- 基础链接 -->
    <link name="base_link">
        <visual>
            <geometry>
                <mesh filename="package://go2_description-humble/dae/base.dae"/>
            </geometry>
        </visual>
    </link>
    
    <!-- 四条腿的完整定义 -->
    <!-- 左前腿 -->
    <link name="LF_hip">...</link>
    <link name="LF_thigh">...</link>
    <link name="LF_calf">...</link>
    <link name="LF_foot">...</link>
    
    <!-- 右前腿 -->
    <link name="RF_hip">...</link>
    <link name="RF_thigh">...</link>
    <link name="RF_calf">...</link>
    <link name="RF_foot">...</link>
    
    <!-- 左后腿 -->
    <link name="LR_hip">...</link>
    <link name="LR_thigh">...</link>
    <link name="LR_calf">...</link>
    <link name="LR_foot">...</link>
    
    <!-- 右后腿 -->
    <link name="RR_hip">...</link>
    <link name="RR_thigh">...</link>
    <link name="RR_calf">...</link>
    <link name="RR_foot">...</link>
    
    <!-- 关节定义 -->
    <joint name="LF_hip_joint" type="revolute">
        <origin xyz="0.1934 0.0465 0" rpy="0 0 0"/>
        <parent link="base_link"/>
        <child link="LF_hip"/>
        <axis xyz="1 0 0"/>
    </joint>
    <!-- ... 其他关节 -->
</robot>
```

### 6. 样式配置

#### 6.1 CSS样式 (`css/blockly.css`)

```css
#blockly-5.label {
    background-color: #e6f3ff;
    color: #0066cc;
}

#blockly-5.label::before {
    content: "\f6d3";
    font-family: "Font Awesome 5 Free";
    margin-right: 5px;
}
```

## 使用指南

### 1. 选择机器人
1. 打开应用后，在机器人选择下拉菜单中选择"Go2"
2. 等待模型加载完成

### 2. 基础控制
- **前进**：机器人向前移动，四足对角步态
- **后退**：机器人向后移动，四足对角步态  
- **左转**：机器人绕Z轴向左旋转
- **右转**：机器人绕Z轴向右旋转

### 3. Blockly编程
1. 在左侧工具箱中选择"Go2机器狗"类别
2. 拖拽编程块到工作区
3. 配置参数（方向、速度、持续时间等）
4. 点击"运行"执行程序

### 4. 示例程序

#### 基础行走演示
```
Go2 前进 速度:1 持续时间:2
等待 2秒
Go2 左转 速度:1 持续时间:1
等待 1秒
Go2 后退 速度:1 持续时间:2
```

<!-- #### 姿态控制演示
```
Go2 站立姿态
等待 1秒
Go2 蹲下姿态
等待 1秒
Go2 躺下姿态
``` -->

<!-- #### 物理引擎演示
```
启用重力
等待 1秒
Go2 自由落体
等待 2秒
重置位置
``` -->

## 技术难点和解决方案

### 1. URDF解析问题
**问题**：原始URDF包含ROS2控制标签，导致解析失败
**解决**：创建简化版本，移除不兼容标签

### 2. 关节贴合问题
**问题**：右腿关节方向与左腿相反，导致贴合失败
**解决**：分析URDF关节定义，为右腿设置相反角度

### 3. 动画系统集成
**问题**：TWEEN.js与Three.js对象兼容性问题
**解决**：直接操作标量属性，避免对象克隆

### 4. 四足步态实现
**问题**：需要实现物理准确的对角步态
**解决**：将四条腿分为两组，交替执行抬起和放下动作

### 5. 相对方向移动
**问题**：移动方向基于世界坐标系而非机器人自身
**解决**：根据机器人当前旋转角度计算相对位移

## 性能优化

### 1. 渲染优化
- 使用LOD（细节层次）技术
- 优化光照设置
- 合理设置模型缩放

### 2. 物理优化
- 简化碰撞几何体
- 优化物理更新频率
- 合理设置质量分布

### 3. 动画优化
- 使用requestAnimationFrame
- 优化TWEEN更新循环
- 合理设置动画时长

## 测试和验证

### 1. 功能测试
- [x] 模型加载和显示
- [x] 基础移动控制
- [x] 关节动画
- [x] 物理引擎
- [x] Blockly编程
- [x] 代码生成

### 2. 性能测试
- [x] 渲染性能
- [x] 动画流畅度
- [x] 内存使用
- [x] 响应时间

### 3. 兼容性测试
- [x] 浏览器兼容性
- [x] 设备兼容性
- [x] 分辨率适配

## 贡献指南

### 1. 代码规范
- 使用ES6+语法
- 遵循JavaScript标准
- 添加适当的注释
- 保持代码简洁

### 2. 提交规范
- 使用清晰的提交信息
- 一个提交一个功能
- 包含测试用例
- 更新相关文档

### 3. 问题报告
- 详细描述问题
- 提供复现步骤
- 包含错误日志
- 说明环境信息

## 许可证

本项目基于MIT许可证开源。

## 致谢

- 宇树科技：提供Go2机器人模型
- Three.js团队：3D渲染引擎
- Cannon.js团队：物理引擎
- Blockly团队：可视化编程框架

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 完成Go2机器人集成
- 实现基础移动和动画
- 添加Blockly编程支持
- 集成物理引擎

---

**注意**：本项目仅供学习和研究使用，请勿用于商业用途。 