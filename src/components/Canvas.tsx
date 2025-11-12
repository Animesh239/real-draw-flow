import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
  tool: string;
  userId: string;
}

interface CanvasProps {
  tool: "brush" | "eraser";
  color: string;
  strokeWidth: number;
  onClear: () => void;
  onUndo: () => void;
  userId: string;
}

export const Canvas = ({ tool, color, strokeWidth, onClear, onUndo, userId }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const context = canvas.getContext("2d");
    if (context) {
      context.lineCap = "round";
      context.lineJoin = "round";
      contextRef.current = context;
      redrawCanvas();
    }
  }, []);

  // Load existing paths from database
  useEffect(() => {
    loadPaths();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("drawing-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "drawing_paths",
        },
        (payload) => {
          const newPath = payload.new as any;
          if (newPath.user_id !== userId) {
            const path: DrawingPath = {
              id: newPath.id,
              points: newPath.path_data,
              color: newPath.color,
              strokeWidth: newPath.stroke_width,
              tool: newPath.tool,
              userId: newPath.user_id,
            };
            setPaths((prev) => [...prev, path]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "drawing_paths",
        },
        (payload) => {
          setPaths((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Redraw canvas when paths change
  useEffect(() => {
    redrawCanvas();
  }, [paths]);

  const loadPaths = async () => {
    const { data, error } = await supabase
      .from("drawing_paths")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading paths:", error);
      toast.error("Failed to load drawing");
      return;
    }

    if (data) {
      const loadedPaths = data.map((item: any) => ({
        id: item.id,
        points: item.path_data,
        color: item.color,
        strokeWidth: item.stroke_width,
        tool: item.tool,
        userId: item.user_id,
      }));
      setPaths(loadedPaths);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      if (path.points.length < 2) return;

      context.beginPath();
      context.strokeStyle = path.tool === "eraser" ? "#ffffff" : path.color;
      context.lineWidth = path.strokeWidth;
      context.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        context.lineTo(path.points[i].x, path.points[i].y);
      }

      context.stroke();
    });
  };

  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(event);
    setIsDrawing(true);
    setCurrentPath([coords]);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const coords = getCoordinates(event);
    const newPath = [...currentPath, coords];
    setCurrentPath(newPath);

    const context = contextRef.current;
    if (!context) return;

    context.beginPath();
    context.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    context.lineWidth = strokeWidth;

    if (currentPath.length > 0) {
      const lastPoint = currentPath[currentPath.length - 1];
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(coords.x, coords.y);
      context.stroke();
    }
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length < 2) {
      setCurrentPath([]);
      return;
    }

    // Save path to database
    const { data, error } = await supabase
      .from("drawing_paths")
      .insert({
        user_id: userId,
        path_data: currentPath as any,
        color: color,
        stroke_width: strokeWidth,
        tool: tool,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Error saving path:", error);
      toast.error("Failed to save drawing");
      return;
    }

    if (data) {
      const newPath: DrawingPath = {
        id: data.id,
        points: currentPath,
        color: color,
        strokeWidth: strokeWidth,
        tool: tool,
        userId: userId,
      };
      setPaths((prev) => [...prev, newPath]);
    }

    setCurrentPath([]);
  };

  return (
    <div className="flex-1 bg-canvas-bg rounded-lg shadow-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
};
