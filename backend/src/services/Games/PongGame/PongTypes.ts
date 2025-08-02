import Paddle from "./PongPaddle";

export const PADDLE_WIDTH = 10;
export const PADDLE_HEIGHT = 100;
export const BALL_SIZE = 10;
export const BALL_SPEED = 3;
export const PADDLE_SPEED = 5;
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const LEFT = 0;
export const RIGHT = 1;
export const MAX_SCORE = 11;

export interface Position {
    x: number;
    y: number;
}

export interface PongPlayer {
    id: string;
    name: string;
    paddle: Paddle;
    score: number;
	online: boolean;
}

export interface PongPlayerState {
    id: string;
    name: string;
    paddle: Position;
	paddleDimensions: {
		width: number;
		height: number;
	};
    score: number;
}

export interface Collidable {
    x: number;
    y: number;
    width: number;
    height: number;

    onCollision(target: Collidable): Boolean;
}

export interface PongLimits {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface PongState {
    playersState: PongPlayerState[];
    ball: Position;
	ballSize: number;
    gameStatus: string;
}
