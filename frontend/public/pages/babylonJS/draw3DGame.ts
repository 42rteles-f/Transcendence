import * as BABYLON from 'babylonjs';

interface Position {
    x: number;
    y: number;
}

interface PongPlayerState {
    id: string;
    name: string;
    paddle: Position;
    paddleDimensions: { width: number; height: number;};
    score: number;
}

interface PongState {
    playersState: PongPlayerState[];
    ball: Position;
    ballSize: number;
    gameStatus: string;
}

function canvasToWorld( 
    x: number, y: number,
	canvasWidth: number, canvasHeight: number,
	worldWidth = 20, worldHeight = 15
): { worldX: number; worldY: number }
{
	const worldX = (x / canvasWidth) * worldWidth - worldWidth / 2;
	const worldY = worldHeight / 2 - (y / canvasHeight) * worldHeight;

	return { worldX, worldY };
}

export function updatePaddlePosition(
	paddle: BABYLON.Mesh,
	x: number, y: number,
	width: number, height: number,
	canvasWidth: number, canvasHeight: number
): void
{
	const { worldX, worldY } = canvasToWorld(x + width / 2, y + height / 2, canvasWidth, canvasHeight);

	paddle.position.set(worldX, worldY, 0);
	paddle.scaling.x = (width / canvasWidth) * 20 * 1.3;
	paddle.scaling.y = (height / canvasHeight) * 15 * 0.7;
	paddle.scaling.z = 0.5;
}

export function updateBallPosition(
	ball: BABYLON.Mesh,
	x: number, y: number,
	size: number,
	canvasWidth: number, canvasHeight: number
): void
{
	const { worldX, worldY } = canvasToWorld(x, y, canvasWidth, canvasHeight);

	ball.position.set(worldX, worldY, 0);
	const ballScale = (size / canvasWidth) * 20 * 2;
	ball.scaling.set(ballScale, ballScale, ballScale);

	ball.rotation.x += 0.05;
	ball.rotation.y += 0.03;
}

export function drawGame(
	state: PongState,
	ball: BABYLON.Mesh, paddles: BABYLON.Mesh[],
	canvasWidth: number, canvasHeight: number
): void
{
	state.playersState.forEach((player, index) => {
		if (paddles[index]) {
			updatePaddlePosition(
				paddles[index],
				player.paddle.x, player.paddle.y,
				player.paddleDimensions.width, player.paddleDimensions.height,
				canvasWidth, canvasHeight
			);
		}
	});

	updateBallPosition(
		ball,
		state.ball.x, state.ball.y,
		state.ballSize,
		canvasWidth, canvasHeight
	);
}
