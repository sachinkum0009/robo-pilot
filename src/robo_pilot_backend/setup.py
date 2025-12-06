from setuptools import find_packages, setup

package_name = 'robo_pilot_backend'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    # Expose the top-level manage.py as a module so ROS2 can wrap it
    py_modules=['manage'],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Sachin Kumar',
    maintainer_email='sachinkumar.ar97@gmail.com',
    description='TODO: Package description',
    license='MIT',
    extras_require={
        'test': [
            'pytest',
        ],
    },
    entry_points={
        'console_scripts': [
            'manage = manage:main',
        ],
    },
)
