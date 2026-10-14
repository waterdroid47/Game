// Logical game resolution (portrait 9:16). Phaser scales it to fit any phone.
export const W = 360;
export const H = 640;

export const PLAYER_Y = 560; // lowest (starting) position of the player
export const MOVE_TOP = 330; // the player can move up to here
export const MEMBRANE_Y = 592;
export const SPRITE_SCALE = 3;

export const FONT = '"Courier New", Courier, monospace';

const params = new URLSearchParams(location.search);
// ?debug      – all levels unlocked, lots of currency, wave skip button
// ?autoplay   – a simple bot plays the game (used for automated testing / balancing)
// ?speed=N    – run the game N times faster (testing only)
export const DEBUG = params.has('debug');
export const AUTOPLAY = params.has('autoplay');
export const SPEED = Math.max(0.25, Number(params.get('speed')) || 1);
export const START_LEVEL = Number(params.get('level')) || 0;
