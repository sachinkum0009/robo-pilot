#!/usr/bin/bash

source /opt/ros/jazzy/setup.bash

colcon build --symlink-install

echo "Build completed successfully."
