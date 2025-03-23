import React, { useRef, useEffect } from "react";
import { useTheme } from "./theme-provider";
type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface GridOffset {
  x: number;
  y: number;
}

interface SquaresProps {
  direction?: "diagonal" | "up" | "right" | "down" | "left";
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
  enableGradient?: boolean;
  gradientColor?: CanvasStrokeStyle;
  gradientSize?: number;
}

const Squares: React.FC<SquaresProps> = ({
  direction = "right",
  speed = 1,
  squareSize = 40,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<GridOffset | null>(null);
  const { theme } = useTheme();
  
  const borderColor = theme === 'dark' ? '#333' : '#e0e0e0';
  const hoverFillColor = theme === 'dark' ? '#444' : '#f0f0f0';
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Option 1: Remove gradient entirely
const drawGrid = () => {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
  const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

  for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
    for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
      const squareX = x - (gridOffset.current.x % squareSize);
      const squareY = y - (gridOffset.current.y % squareSize);

      if (
        hoveredSquareRef.current &&
        Math.floor((x - startX) / squareSize) === hoveredSquareRef.current.x &&
        Math.floor((y - startY) / squareSize) === hoveredSquareRef.current.y
      ) {
        ctx.fillStyle = hoverFillColor;
        ctx.fillRect(squareX, squareY, squareSize, squareSize);
      }

      ctx.strokeStyle = borderColor;
      ctx.strokeRect(squareX, squareY, squareSize, squareSize);
    }
  }
  
  // Gradient removed entirely
};

// Option 2: Much smaller gradient
const drawGridWithSmallerGradient = () => {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
  const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

  for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
    for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
      const squareX = x - (gridOffset.current.x % squareSize);
      const squareY = y - (gridOffset.current.y % squareSize);

      if (
        hoveredSquareRef.current &&
        Math.floor((x - startX) / squareSize) === hoveredSquareRef.current.x &&
        Math.floor((y - startY) / squareSize) === hoveredSquareRef.current.y
      ) {
        ctx.fillStyle = hoverFillColor;
        ctx.fillRect(squareX, squareY, squareSize, squareSize);
      }

      ctx.strokeStyle = borderColor;
      ctx.strokeRect(squareX, squareY, squareSize, squareSize);
    }
  }
  
  // Significantly smaller gradient - only covers about 20% of the radius
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 10 // Much smaller radius - 1/10th of original
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(6, 6, 6, 0.4)"); // Less opacity too
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

// Option 3: Make gradient optional with a prop
const drawGridWithConfigurableGradient = () => {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
  const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

  for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
    for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
      const squareX = x - (gridOffset.current.x % squareSize);
      const squareY = y - (gridOffset.current.y % squareSize);

      if (
        hoveredSquareRef.current &&
        Math.floor((x - startX) / squareSize) === hoveredSquareRef.current.x &&
        Math.floor((y - startY) / squareSize) === hoveredSquareRef.current.y
      ) {
        ctx.fillStyle = hoverFillColor;
        ctx.fillRect(squareX, squareY, squareSize, squareSize);
      }

      ctx.strokeStyle = borderColor;
      ctx.strokeRect(squareX, squareY, squareSize, squareSize);
    }
  }
  
  // Only draw gradient if enableGradient prop is true
  if (enableGradient) {
    const gradientSize = gradientSize || 0.5; // Default to 50% of original size if not specified
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2 * gradientSize
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, gradientColor || "#060606");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case "right":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case "left":
          gridOffset.current.x =
            (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case "up":
          gridOffset.current.y =
            (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case "down":
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case "diagonal":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      const hoveredSquareX = Math.floor(
        (mouseX + gridOffset.current.x - startX) / squareSize
      );
      const hoveredSquareY = Math.floor(
        (mouseY + gridOffset.current.y - startY) / squareSize
      );

      if (
        !hoveredSquareRef.current ||
        hoveredSquareRef.current.x !== hoveredSquareX ||
        hoveredSquareRef.current.y !== hoveredSquareY
      ) {
        hoveredSquareRef.current = { x: hoveredSquareX, y: hoveredSquareY };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border-none block"
    ></canvas>
  );
};

export default Squares;
