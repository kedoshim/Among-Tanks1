  import { Controller } from "./controller.js";
import KeyboardState from "../../../../libs/util/KeyboardState.js";
import { Tank } from "../tanks/tank.js";

import { getConfig } from "../../config.js";

/**
 * Represents the controller used by the player
 */
export class PlayerController extends Controller {
  /**
   * Creates an instance of PlayerController.
   *
   * @constructor
   * @param {Tank} target
   * @param {*} keyboardKeys
   * @param {{ up: number; down: number; left: number; right: number; shoot: number; }} [gamepadButtons=""]
   */
  constructor(target, keyboardKeys, gamepadButtons = "") {
    super(target);

    this.config = getConfig();
    const gamepadConfig = this.config.gamepadConfig;

    this._keys = keyboardKeys;
    this.isBot = false;

    if (gamepadButtons === "") {
      this._buttons = gamepadConfig.defaultGamepadButtons;
    } else {
      this._buttons = gamepadButtons;
    }
    this._directionalMovementEnabled = this.config.directionalMovementEnabled;
    this._deadzone = gamepadConfig.deadzone;
    this._stickMultiplier = gamepadConfig.stickMultiplier

  }

  set upKey(key) {
    if (!Array.isArray(key)) {
      this._keys.up = [key];
    } else {
      this._keys.up = key;
    }
  }
  
  set downKey(key) {
    if (!Array.isArray(key)) {
      this._keys.down = [key];
    } else {
      this._keys.down = key;
    }
  }
  
  set leftKey(key) {
    if (!Array.isArray(key)) {
      this._keys.left = [key];
    } else {
      this._keys.left = key;
    }
  }
  
  set rightKey(key) {
    if (!Array.isArray(key)) {
      this._keys.right = [key];
    } else {
      this._keys.right = key;
    }
  }

  set shootKey(keys) {
    if (!Array.isArray(keys)) {
      // shoot must be an array
      this._keys.shoot = [keys];
    } else {
      this._keys.shoot = keys;
    }
  }

  set upButton(button) {
    if (!Array.isArray(button)) {
      this._buttons.up = [button];
    } else {
      this._buttons.up = button;
    }
  }
  
  set downButton(button) {
    if (!Array.isArray(button)) {
      this._buttons.down = [button];
    } else {
      this._buttons.down = button;
    }
  }
  
  set leftButton(button) {
    if (!Array.isArray(button)) {
      this._buttons.left = [button];
    } else {
      this._buttons.left = button;
    }
  }
  
  set rightButton(button) {
    if (!Array.isArray(button)) {
      this._buttons.right = [button];
    } else {
      this._buttons.right = button;
    }
  }

  set shootButton(buttons) {
    if (!Array.isArray(buttons)) {
      // shoot must be an array
      this._buttons.shoot = [buttons];
    } else {
      this._buttons.shoot = buttons;
    }
  }

  // Getter for all keys
  get keys() {
    return this._keys;
  }

  // Getter for all buttons
  get buttons() {
    return this._buttons;
  }

  /**
   * Movement mode where the movement is based on the input direction
   * Called when "directionalMovement" is enabled in the config.json
   */
  _directionalMovement(keyboard, gamepad) {
    var moveX = 0;
    var moveZ = 0;

    if (this.isBot) {
      return;
    }
    // Check movement direction based on pressed keys
    if (keyboard.pressed(this._keys.up)) {
      moveZ--;
    }
    if (keyboard.pressed(this._keys.down)) {
      moveZ++;
    }
    if (keyboard.pressed(this._keys.left)) {
      moveX--;
    }
    if (keyboard.pressed(this._keys.right)) {
      moveX++;
    }

    this._keys.shoot.every((key, index) => {
      if (keyboard.down(key)) {
        this._target.shoot();
        return false;
      } else {
        return true;
      }
    });

    if (gamepad) {
      // console.log(gamepad);
      const gamepadButtons = gamepad.buttons;
      const gamepadAxes = gamepad.axes;
      // Check movement direction based on pressed keys
      if (gamepadButtons[this._buttons.up].value == 1) {
        moveZ--;
      }
      if (gamepadButtons[this._buttons.down].value > 0) {
        moveZ++;
      }
      if (gamepadButtons[this._buttons.left].value > 0) {
        moveX--;
      }
      if (gamepadButtons[this._buttons.right].value > 0) {
        moveX++;
      }

      if (gamepadButtons[this._buttons.shoot].value > 0) {
        this._target.shoot();
      }

      // Sticks

      if (gamepadAxes[1] > this._deadzone || gamepadAxes[1] < -this._deadzone)
        moveZ += gamepadAxes[1] * this._stickMultiplier;
      if (gamepadAxes[0] > this._deadzone || gamepadAxes[0] < -this._deadzone)
        moveX += gamepadAxes[0] * this._stickMultiplier;
    }

    this._target.moveDirectional(moveX, moveZ);
  }

  /**
   * Movement mode where the left and right inputs make the player rotate
   * Called when "directionalMovement" is disabled in the config.json
   */
  _rotatingMovement(keyboard, gamepad) {
    var rotation = 0;
    var movement = 0;

    if (this.isBot) {
      return;
    }
    // Check rotation direction based on pressed keys
    this._keys.up.forEach(key => {
      if (keyboard.pressed(key)) {
        movement++;
        this._target._inMovement = true;
        this._target._positiveMovement = true;
      }
    });

    this._keys.down.forEach(key => {
      if (keyboard.pressed(key)) {
        movement--;
        this._target._inMovement = true;
        this._target._positiveMovement = false;
      }
    });

    this._keys.left.forEach(key => {
      if (keyboard.pressed(key)) {
        rotation++;
      }
    });

    this._keys.right.forEach(key => {
      if (keyboard.pressed(key)) {
        rotation--;
      }
    });

    this._keys.shoot.every((key, index) => {
      if (keyboard.down(key)) {
        this._target.shoot();
        return false;
      } else {
        return true;
      }
    });


    if (gamepad) {
      const gamepadButtons = gamepad.buttons;
      const gamepadAxes = gamepad.axes;
      // Check movement direction based on pressed keys
      if (gamepadButtons[this._buttons.up].value == 1) {
        movement--;
      }
      if (gamepadButtons[this._buttons.down].value > 0) {
        movement++;
      }
      if (gamepadButtons[this._buttons.left].value > 0) {
        rotation--;
      }
      if (gamepadButtons[this._buttons.right].value > 0) {
        rotation++;
      }

      if (gamepadButtons[this._buttons.shoot].value > 0) {
        this._target.shoot();
      }

      // Sticks

      //left stick y axis
      if (gamepadAxes[1] > this._deadzone || gamepadAxes[1] < -this._deadzone) {
        movement -= gamepadAxes[1] * this._stickMultiplier;
      }
      //right stick x axis
      if (gamepadAxes[0] > this._deadzone || gamepadAxes[0] < -this._deadzone) {
        rotation -= gamepadAxes[0] * this._stickMultiplier;
      }
    }
    // makes so it always uses the directional movement mode if using the gamepad
    this._target.moveRotating(movement, rotation);
  }

  /** 
   * @async
   * @param {KeyboardState} keyboard The keyboard assigned to the player
   * @param {Gamepad} [gamepad=null] The gamepad assigned to the player
   */
  async control(input) {
    const keyboard = input.keyboard;
    const gamepad = input.gamepad;
    if (this.config.directionalMovementEnabled) {
      this._directionalMovement(keyboard, gamepad);
    } else {
      this._rotatingMovement(keyboard, gamepad);
    }
  }
}

