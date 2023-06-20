[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/E5ATIiJe)
# Group assignment 03 - Final AR/VR Application

## Explanation

### How to use
1. Visit the [GitHub Pages link](https://hfu-dm-ecg.github.io/group-assignment-3-final-team-spass/) to this repository using a device capable of running AR based web applications. If no device is available, one can be emulated using the [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje/related?hl=de) for Google Chrome.
2. Press the "Enter XR" button at the top of the page.
3. You can now see floating islands and an airship som floating islands and some rings in front of you.
4. on the bottom righht is a joystick UI you can use to steer the airship. On the bottom of the screen is a timer and a counter showing how many of the rings you have passed.
5. Flying through the first ring starts the timer. flying through all of them stops the timer.

### Controls
You can control the airship using the joystick on the screen.

### Additional Information
The models are based on the first assignment, but the animations for the airship have been removed, as the user now controls its flight path. The islands still float up and down. The Ring-Models have been added as checkpoints. The joystick is created using the [nipplejs package, version 0.10.1](https://yoannmoi.net/nipplejs/) and implemented in two new functions in the island.js file. To create the overlay displaying the joystick and the timer and counter, the optional feature "dom-overlay" has been enabled in the ARButton.js file. The checkpoints are checking if the center of the airship is inside the hitbox of the checkpoint. Only checkpoints in a defined radius around the airship are checking for collision. The checkpoints trigger the counter and timer. The application has been tested on different phones and the aforementioned WebXR API Emulator (v0.3.3).
