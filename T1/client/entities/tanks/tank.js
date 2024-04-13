import * as THREE from "../../public/three/build/three.module.js";
// import { Object3D } from "../../../../build/three.module.js";

/**
 * General class that represents any tank model
 */
export class Tank {
  /**
   * Creates an instance of Tank.
   *
   * @constructor
   * @param {string} tankColor
   * @param {string} amogColor
   * @param {number} [moveSpeed=1]
   * @param {number} [rotationSpeed=0.15]
   */
  constructor(tankColor, amogColor, moveSpeed = 1, rotationSpeed = 0.15) {
    this._tankColor = tankColor;
    this._amogColor = amogColor;
    this._moveSpeed = moveSpeed;
    this._rotationSpeed = rotationSpeed / 2;
    this._animationRotationSpeed = rotationSpeed;

    this._model = null;

    this._lastValidTargetAngle = 0;

    this.x = null;
    this.z = null;
    this.rotation = null;
  }

  // Getters
  /**
   * Description placeholder
   */
  get tankColor() {
    return this._tankColor;
  }

  /**
   * Description placeholder
   */
  get amogColor() {
    return this._amogColor;
  }

  /**
   * Description placeholder
   */
  get moveSpeed() {
    return this._moveSpeed;
  }

  /**
   * Description placeholder
   */
  get rotationSpeed() {
    return this._rotationSpeed;
  }

  /**
   * Description placeholder
   */
  get model() {
    return this._model;
  }

  /**
   * Sets the last movement direction angle selected by
   * the player
   */
  get lastValidTargetAngle() {
    return this._lastValidTargetAngle;
  }

  /**
   * Gets the tank's x position.
   *
   * @returns {number} The tank's x position.
   */
  get x() {
    return this._x;
  }

  /**
   * Gets the tank's z position.
   *
   * @returns {number} The tank's z position.
   */
  get z() {
    return this._z;
  }

  /**
   * Gets the tank's rotation.
   *
   * @returns {number} The tank's rotation.
   */
  get rotation() {
    return this._rotation;
  }

  // Setters
  /**
   * @type {String}
   */
  set tankColor(color) {
    this._tankColor = color;
  }

  /**
   * @type {*}
   */
  set amogColor(color) {
    this._amogColor = color;
  }

  /**
   * @type {number}
   */
  set moveSpeed(speed) {
    this._moveSpeed = speed;
  }

  /**
   * @type {number}
   */
  set rotationSpeed(speed) {
    this._rotationSpeed = speed;
  }

  /**
   * @type {Object3D}
   */
  set model(model) {
    this._model = model;
  }

  /**
   * Sets the last movement direction angle selected by
   * the player
   *
   * @type {number}
   */
  set lastValidTargetAngle(angle) {
    this._lastValidTargetAngle = angle;
  }

  /**
   * Sets the tank's x position.
   *
   * @param {number} x The x position to set.
   */
  set x(x) {
    this._x = x;
  }

  /**
   * Sets the tank's z position.
   *
   * @param {number} z The z position to set.
   */
  set z(z) {
    this._z = z;
  }

  /**
   * Sets the tank's rotation.
   *
   * @param {number} rotation The rotation to set.
   */
  set rotation(rotation) {
    this._rotation = rotation;
  }

  /**
   * Moves the tank following the directionalMovement mode
   *
   * @param {number} moveX The amount and direction of movement in the X axis [-1,1]
   * @param {number} moveZ The amount and direction of movement in the X axis [-1,1]
   */
  moveDirectional(moveX, moveZ) {
    // if (moveX !== 0 || moveZ !== 0) console.log("moving ["+moveX+","+moveZ+"]");

    // Calculate diagonal movement direction
    let moveMagnitude = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveMagnitude > 0) {
      moveX /= moveMagnitude;
      moveZ /= moveMagnitude;
    }

    // If there's movement input, calculate the target angle
    let targetAngle = null;
    if (moveX !== 0 || moveZ !== 0) {
      targetAngle = Math.atan2(moveZ, moveX);
      targetAngle += Math.PI / 2; // Adjust rotation since lookAt is rotated 90 degrees
    }

    // If there's no movement input, use the last valid target angle
    // Makes it so the rotation animation only stops at the last inputed direction
    if (targetAngle === null) {
      targetAngle = this.lastValidTargetAngle;
    } else {
      // Update last valid target angle
      this.lastValidTargetAngle = targetAngle;
    }

    // Calculate the difference between current rotation and target angle
    let rotationDifference = targetAngle - this.model.rotation.y;
    // Wrap the difference into range [-π, π]
    rotationDifference =
      THREE.MathUtils.euclideanModulo(
        rotationDifference + Math.PI,
        2 * Math.PI
      ) - Math.PI;

    // Smoothly rotate this.model towards the target angle
    this.model.rotation.y += rotationDifference * this._animationRotationSpeed;

    // Move this.model
    this.model.position.x += this._moveSpeed * moveX;
    this.model.position.z += this._moveSpeed * moveZ;
  }

  /**
   * Moves the tank following the rotationalMovement mode
   *
   * @param {number} forwardForce Varies from -1 (moves backwards) to 1 (moves frontwards)
   * @param {number} rotationDirection Varies from -1 (left) to 1 (right)
   */
  moveRotating(forwardForce, rotationDirection) {
    if (Math.abs(forwardForce) > 1) {
      forwardForce = forwardForce >= 0 ? 1 : -1;
    }
    if (Math.abs(rotationDirection) > 1) {
      rotationDirection = rotationDirection >= 0 ? 1 : -1;
    }

    this.model.translateZ(forwardForce * this._moveSpeed);

    this.model.rotateY(this._rotationSpeed * rotationDirection);

    this._lastValidTargetAngle = this._model.rotation.y;
  }

  /**
   * Makes the tank shoot
   */
  shoot() {
    // console.log("shoot");
    //shooting logic
  }
}
