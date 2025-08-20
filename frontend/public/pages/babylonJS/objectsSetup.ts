import * as BABYLON from 'babylonjs';

export function createBall(scene: BABYLON.Scene): BABYLON.Mesh {
    const ball = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: 1, segments: 16 }, scene);
    const ballMat = new BABYLON.StandardMaterial('ballMat', scene);
    ballMat.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.95);
    ballMat.specularColor = new BABYLON.Color3(1, 1, 1);
    ballMat.specularPower = 64;
    ballMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    ball.material = ballMat;
    return ball;
}

export function createPaddle(scene: BABYLON.Scene, index: number): BABYLON.Mesh {
    const paddle = BABYLON.MeshBuilder.CreateBox(`paddle${index}`, {
        width: 0.5,
        height: 1.6,
        depth: 0.25
    }, scene);
    
    const paddleMat = new BABYLON.StandardMaterial(`paddleMat${index}`, scene);
    paddleMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
    paddleMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    paddleMat.specularPower = 32;
    paddleMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.25);
    paddle.material = paddleMat;
    return paddle; 
}

export function createPaddles(scene: BABYLON.Scene): BABYLON.Mesh[] {
    const paddles: BABYLON.Mesh[] = [];
    paddles.push(createPaddle(scene, 0));
    paddles.push(createPaddle(scene, 1));
    return paddles;
}

export function createGameBounds(scene: BABYLON.Scene): void {
    const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
    wallMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    wallMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    wallMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);
    
    const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", { width: 0.2, height: 15, depth: 2 }, scene);
    leftWall.position.x = -10.1;
    leftWall.material = wallMaterial;

    const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", { width: 0.2, height: 15, depth: 2 }, scene);
    rightWall.position.x = 10.1;
    rightWall.material = wallMaterial;
    
    const topWall = BABYLON.MeshBuilder.CreateBox("topWall", { width: 20.4, height: 0.2, depth: 2}, scene);
    topWall.position.y = 7.6;
    topWall.material = wallMaterial;
    
    const bottomWall =BABYLON.MeshBuilder.CreateBox("bottomWall", { width: 20.4, height: 0.2, depth: 2}, scene);
    bottomWall.position.y = -7.6;
    bottomWall.material = wallMaterial;
}