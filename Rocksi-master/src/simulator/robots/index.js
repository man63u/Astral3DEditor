const robots = {
    niryo_robot_description: require('./niryo'),
    franka_description: require('./franka'),
    sawyer_description: require('./sawyer'),
    unitree_go2: require('./go2'),
    go2_description_humble: require('./go2'),
    g1_description: require('./g1'),
};

module.exports = robots;