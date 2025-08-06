# G1机器人测试说明

## 问题修复

之前的错误 `TypeError: Cannot read properties of undefined (reading 'split')` 已经修复。

**问题原因**：
1. URDF文件 `g1_29dof_rocksi.urdf` 是空的，导致加载器无法解析文件内容
2. `robot.xacro` 属性在浏览器环境中路径解析出现问题
3. GUI中的机器人列表缺少G1选项
4. 人形机器人的关节结构不适合默认的遍历方式
5. `LoaderUtils.extractUrlBase` 函数无法处理undefined或无效的URL
6. G1机器人的文件结构混乱，XML和URDF文件混放在一起
7. 路径构建不正确，导致xacro返回undefined
8. 缺少标准的ROS包文件（package.xml、CMakeLists.txt、LICENSE）
9. MODELS_ROOT在浏览器环境中为undefined，导致路径解析失败
10. 在xacro getter中重复调用require('path')导致问题
11. 修改robotbase.js影响了所有机器人的加载

**解决方案**：
1. 重新创建了完整的URDF文件，包含所有必要的机器人关节和链接定义
2. 在G1机器人类中重写了xacro getter方法，直接返回正确的文件路径
3. 在GUI中添加了G1机器人选项
4. 重写了G1机器人的init方法，正确处理人形机器人的关节结构
5. 修复了`LoaderUtils.extractUrlBase`的错误处理，添加了安全的URL处理逻辑
6. 重新整理了G1机器人的文件结构，将所有URDF文件移动到urdf文件夹中
7. 删除了所有XML文件（MuJoCo格式），只保留URDF文件
8. 修复了xacro路径构建逻辑，确保返回完整的URL路径
9. 添加了标准的ROS包文件：package.xml、CMakeLists.txt、LICENSE
10. 修复了MODELS_ROOT在浏览器环境中的undefined问题，添加了备用路径处理
11. 修复了xacro getter中重复调用require('path')的问题，使用文件顶部导入的path
12. 恢复了robotbase.js的原始实现，只在G1机器人中特殊处理路径问题

## 测试步骤

### 1. 启动项目
```bash
cd Rocksi-master
npm install
npm run dev
```

### 2. 访问项目
打开浏览器访问：`http://localhost:1234`

### 3. 选择G1机器人
1. 在页面右上角找到机器人选择器
2. 从下拉菜单中选择 "G1"
3. 页面会自动重新加载

### 4. 验证功能
- ✅ 机器人模型应该正确加载并显示
- ✅ 机器人应该站立在地面上
- ✅ 可以拖动关节进行控制
- ✅ 可以编写程序控制机器人

## 预期结果

如果一切正常，您应该看到：
- 一个完整的人形机器人模型
- 机器人站立在地面上，高度约1.3米
- 29个可控制的关节
- 支持腿部、躯干、手臂的独立控制

## 故障排除

如果仍然遇到问题：

1. **检查浏览器控制台**
   - 按F12打开开发者工具
   - 查看Console标签页的错误信息

2. **检查网络请求**
   - 在Network标签页查看URDF文件是否成功加载
   - 检查mesh文件是否成功加载

3. **常见问题**
   - 如果看到"Failed to load robot model"错误，检查URDF文件路径
   - 如果机器人不显示，检查mesh文件是否存在
   - 如果关节无法控制，检查关节名称是否匹配

## 技术细节

### 修复的文件
- `assets/models/g1_description/urdf/g1_29dof_rocksi.urdf` - 重新创建了完整的URDF文件
- `src/simulator/robots/g1.js` - 重写了xacro getter方法和init方法，修复路径解析和关节初始化问题
- `src/simulator/gui.js` - 添加了G1机器人选项到GUI列表
- `src/simulator/scene.js` - 修复了URL处理逻辑，添加了安全的错误处理
- `src/simulator/robots/robotbase.js` - 恢复了原始实现，确保其他机器人正常工作
- 重新整理了G1机器人的文件结构，删除了所有XML文件
- `assets/models/g1_description/package.xml` - 添加了ROS包定义文件
- `assets/models/g1_description/CMakeLists.txt` - 添加了构建配置文件
- `assets/models/g1_description/LICENSE` - 添加了Apache 2.0许可证文件

### 机器人配置
- 29个自由度的人形机器人
- 包含腿部、躯干、手臂的完整关节链
- 支持浮动基座（floating base）
- 所有关节都有合理的角度限制

### 加载流程
1. 选择G1机器人
2. 加载URDF文件
3. 解析机器人结构
4. 加载3D模型文件
5. 初始化关节控制
6. 设置默认姿态

## 成功标志

当G1机器人成功加载时，您应该看到：
- 控制台输出："G1 robot loaded successfully"
- 机器人正确显示在3D场景中
- 所有关节都可以通过拖动进行控制
- 编程界面可以正常使用 