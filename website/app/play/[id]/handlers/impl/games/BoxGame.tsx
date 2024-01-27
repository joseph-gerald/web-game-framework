import { useEffect, useRef } from "react";

interface Props {
    setPersistentEventProcessor: (_: any) => void;
    persistentEventProcessor: any;
}

export const BoxDemo: React.FC<Props> = ({ setPersistentEventProcessor, persistentEventProcessor }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    let angle = 0;

    const drawCircle = (context: CanvasRenderingContext2D) => {
        context.beginPath();
        context.arc(50, 50, 50, 0, Math.PI * 2, true);
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = '#003300';
        context.stroke();
    };

    const drawAnimatedCircle = (context: CanvasRenderingContext2D ) => {
        context.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
        context.save();
        context.translate(50, 50);
        context.rotate(angle);
        drawCircle(context);
        context.restore();
        angle += 0.01;
        requestAnimationFrame(() => drawAnimatedCircle(context));
    };

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            // Call the draw function here
            drawAnimatedCircle(context);
        }
    }, []);

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
