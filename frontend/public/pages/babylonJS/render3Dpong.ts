import * as BABYLON from 'babylonjs';
import { createEngine, createScene, setupCamera, setupLighting, startRenderLoop } from './sceneSetup';
import { createBall, createPaddles, createGameBounds } from './objectsSetup';
import { drawGame } from './draw3DGame';

interface Position {
    x: number;
    y: number;
}

interface PongPlayerState {
    id: string;
    name: string;
    paddle: Position;
    paddleDimensions: {
        width: number;
        height: number;
    };
    score: number;
}

interface PongState {
    playersState: PongPlayerState[];
    ball: Position;
    ballSize: number;
    gameStatus: string;
}

export class PongRenderer3D {
    private engine: BABYLON.Engine | null = null;
    private scene: BABYLON.Scene | null = null;
    private canvas!: HTMLCanvasElement;
    private ball: BABYLON.Mesh | null = null;
    private paddles: BABYLON.Mesh[] = [];
    private canvasWidth!: number;
    private canvasHeight!: number;
    private initialized: boolean = false;

    constructor(canvasId: string, canvasWidth: number, canvasHeight: number) {
        const canvasElement = document.getElementById(canvasId);
        if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement))
            return ;
            //console.error(`Canvas with id "${canvasId}" not found`);
        this.canvas = canvasElement;

        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        if (canvasWidth && canvasHeight)
            //(`Canvas dimensions set to: ${canvasWidth}x${canvasHeight}`);
        this.initializeBabylon();
    }

    private initializeBabylon(): void {
        this.engine = createEngine(this.canvas);
        if (!this.engine)
            //("Engine Error");
        
        this.scene = createScene(this.engine);
        if (!this.scene)
            //("Scene Error");
        
        setupCamera(this.scene);
        setupLighting(this.scene);
        this.createGameObjects();
        createGameBounds(this.scene);
        this.createGroundPlane();
        startRenderLoop(this.engine, this.scene);
        
        this.initialized = true;
    }

    private createGameObjects(): void {
        if (!this.scene) return;
        this.ball = createBall(this.scene);
        this.paddles = createPaddles(this.scene);
    }

    private createGroundPlane(): void {
        if (!this.scene) return;
        
        const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 25, height: 20, subdivisions: 1 }, this.scene);
        
        ground.position.y = -9;
        ground.position.z = 2;
        
        const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.03, 0.03, 0.06);
        groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.material = groundMat;
    }

    public drawGame(state: PongState): void {
        if (!this.initialized || !this.ball || !this.scene)
            return;
        drawGame(state, this.ball, this.paddles, this.canvasWidth, this.canvasHeight);
    }

    public dispose(): void {
        if (this.engine)
        {
            this.engine.stopRenderLoop();
            if (this.scene)
                this.scene.dispose();
            this.engine.dispose();
        }
        this.initialized = false;
    }
}