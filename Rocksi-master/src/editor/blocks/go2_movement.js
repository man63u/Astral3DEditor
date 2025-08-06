import * as Blockly from 'blockly/core';

// Go2机器狗行走块
Blockly.Blocks['go2_walk'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("机器狗行走")
        .appendField(new Blockly.FieldDropdown([
          ["前进", "FORWARD"],
          ["后退", "BACKWARD"],
          ["左转", "LEFT"],
          ["右转", "RIGHT"],
          ["停止", "STOP"]
        ]), "DIRECTION");
    this.appendValueInput("SPEED")
        .setCheck("Number")
        .appendField("速度");
    this.appendValueInput("DURATION")
        .setCheck("Number")
        .appendField("持续时间(秒)");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("控制Go2机器狗行走");
    this.setHelpUrl("");
  }
};

// Go2机器狗姿态控制块
Blockly.Blocks['go2_pose'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("机器狗姿态")
        .appendField(new Blockly.FieldDropdown([
          ["站立", "STAND"],
          ["蹲下", "SQUAT"],
          ["趴下", "LIE_DOWN"],
          ["跳跃", "JUMP"],
          ["自定义", "CUSTOM"]
        ]), "POSE_TYPE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("设置Go2机器狗的姿态");
    this.setHelpUrl("");
  }
};

// Go2机器狗腿部控制块
Blockly.Blocks['go2_leg_control'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("腿部控制")
        .appendField(new Blockly.FieldDropdown([
          ["前左腿", "LF"],
          ["前右腿", "RF"],
          ["后左腿", "LR"],
          ["后右腿", "RR"],
          ["所有腿", "ALL"]
        ]), "LEG");
    this.appendValueInput("HIP_ANGLE")
        .setCheck("Number")
        .appendField("髋关节角度");
    this.appendValueInput("THIGH_ANGLE")
        .setCheck("Number")
        .appendField("大腿角度");
    this.appendValueInput("CALF_ANGLE")
        .setCheck("Number")
        .appendField("小腿角度");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("控制Go2机器狗的腿部关节");
    this.setHelpUrl("");
  }
};

// Go2机器狗物理引擎控制块
Blockly.Blocks['go2_physics'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("物理引擎")
        .appendField(new Blockly.FieldDropdown([
          ["启用重力", "ENABLE_GRAVITY"],
          ["禁用重力", "DISABLE_GRAVITY"],
          ["掉落测试", "DROP_TEST"],
          ["重置位置", "RESET_POSITION"]
        ]), "PHYSICS_ACTION");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("控制Go2机器狗的物理引擎");
    this.setHelpUrl("");
  }
};

// Go2机器狗传感器块
Blockly.Blocks['go2_sensor'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("传感器")
        .appendField(new Blockly.FieldDropdown([
          ["IMU数据", "IMU"],
          ["关节位置", "JOINT_POSITIONS"],
          ["足部接触", "FOOT_CONTACT"],
          ["电池电量", "BATTERY"]
        ]), "SENSOR_TYPE");
    this.setOutput(true, "Number");
    this.setColour(60);
    this.setTooltip("获取Go2机器狗的传感器数据");
    this.setHelpUrl("");
  }
};