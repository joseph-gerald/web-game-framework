import { useEffect, useRef } from "react";

interface Props {
    setPersistentEventProcessor: (_: any) => void;
    persistentEventProcessor: any;
}

export const BoxDemo: React.FC<Props> = ({ setPersistentEventProcessor, persistentEventProcessor }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameId = useRef<NodeJS.Timeout | null>(null);
    const gameLoopId = useRef<number | null>(null);
    const game: any = useRef({});
    const lastGame: any = useRef({});
    const momemtums: any = useRef({});

    let angle = 0;

    const keys: { [key: string]: any } = useRef({
        W: false,
        S: false,
        A: false,
        D: false
    });

    const handleKeyDown = (event: any) => {
        keys.current[event.key.toUpperCase()] = true;
    };

    const handleKeyUp = (event: any) => {
        keys.current[event.key.toUpperCase()] = false;
    }

    const gameLoop = () => {
        const { W, S, A, D } = keys.current;

        const motion = [0, 0];

        if (W) motion[1] += 1;
        if (S) motion[1] -= 1;

        if (A) motion[0] -= 1;
        if (D) motion[0] += 1;

        console.log(game.current.players);

        if (motion[0] != 0 || motion[1] != 0) {
            persistentEventProcessor.appendQueue({
                target: "demo.box.move",
                data: {
                    motion
                }
            });
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        gameLoopId.current = setInterval(() => {
            gameLoop()
        }, 1000 / 10);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, []);

    const drawAnimatedCircle = (context: CanvasRenderingContext2D) => {
        //console.log(persistentEventProcessor.state);
        context.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
        context.save();

        if (lastGame.current.players && game.current.players) {
            for (const player of lastGame.current.players) {
                const currentPlayer = game.current.players.find((p: any) => p.session_id === player.session_id);
                
                if (!player.momentum) {
                    player.motion = [player.x - currentPlayer.x, player.y - currentPlayer.y]
                    player.momentum = [player.motion[0] / Math.abs(player.motion[0]),player.motion[1] /  Math.abs(player.motion[1])];

                    player.momentum = player.momentum.map((x: number) => isNaN(x) ? 0 : x);

                    if (player.momentum[0] != 0 || player.momentum[1] != 0) {
                        momemtums.current[player.session_id] = player.momentum;
                    }
                }

                const momentum = momemtums.current[player.session_id];

                if (momentum) {
                    player.momentum = momentum;
                }
                
                console.log(player.x, currentPlayer.x, momemtums.current[player.session_id])

                player.x -= player.momentum[0] * .125;
                player.y -= player.momentum[1] * .125;

                context.fillStyle = 'red';
                context.fillRect(player.x * 5, player.y * 5, 50, 50);
    
                context.fillStyle = 'white';
                context.font = '20px Arial';
                context.fillText(player.username, player.x * 5 - context.measureText(player.username).width / 8, player.y * 5 + 32);
            }
        }

        context.restore();
        animationFrameId.current = requestAnimationFrame(() => drawAnimatedCircle(context));
    };

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            // Cancel the previous animation frame if it exists
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }

            // Call the draw function here
            drawAnimatedCircle(context);
            if (lastGame != game.current) lastGame.current = structuredClone(game.current);
            game.current = persistentEventProcessor.state.box_game;
        }
    }, [persistentEventProcessor]);

    return (
        <>
            <div className="w-full flex flex-col gap-5 items-center justify-center">
                <canvas ref={canvasRef} width={1400} height={600} />
            </div>
        </>
    )
}

export const BoxDemoHandler = (event: any, eventProcessor: any) => {
    const timestamp = new Date().toTimeString().slice(0, 5);
}
