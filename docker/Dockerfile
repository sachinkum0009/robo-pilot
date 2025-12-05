ARG ROS_DISTRO=jazzy
FROM osrf/ros:${ROS_DISTRO}-desktop-full
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-virtualenv \
    git \
    wget \
    curl

# Install ROS 2 build tools and other utilities
RUN apt-get install -y \
    build-essential \
    cmake \
    python3-colcon-common-extensions \
    python3-rosdep \
    python3-vcstool \
    libasio-dev \
    ros-${ROS_DISTRO}-rmw-cyclonedds-cpp

# Create vscode user correctly
RUN useradd -m ubuntu || true \
    && echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Install UV (Universal Version Manager)
USER ubuntu 

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set up entrypoint
ENTRYPOINT ["/bin/bash", "-c", "exec bash"]
