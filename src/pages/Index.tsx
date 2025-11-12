import { useState, useEffect } from "react";
import { Canvas } from "@/components/Canvas";
import { Toolbar } from "@/components/Toolbar";
import { ColorPicker } from "@/components/ColorPicker";
import { StrokeWidthSelector } from "@/components/StrokeWidthSelector";
import { UserList } from "@/components/UserList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [userId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);

  const handleClear = async () => {
    const { error } = await supabase.from("drawing_paths").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Error clearing canvas:", error);
      toast.error("Failed to clear canvas");
      return;
    }

    toast.success("Canvas cleared");
  };

  const handleUndo = async () => {
    const { data, error } = await supabase
      .from("drawing_paths")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error undoing:", error);
      toast.error("Nothing to undo");
      return;
    }

    if (data) {
      const { error: deleteError } = await supabase
        .from("drawing_paths")
        .delete()
        .eq("id", data.id);

      if (deleteError) {
        console.error("Error deleting path:", deleteError);
        toast.error("Failed to undo");
        return;
      }

      toast.success("Undo successful");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-screen-2xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Collaborative Drawing Canvas
          </h1>
          <p className="text-muted-foreground">
            Draw together in real-time with multiple users
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          <aside className="flex flex-col gap-4">
            <Toolbar
              tool={tool}
              onToolChange={setTool}
              onUndo={handleUndo}
              onClear={handleClear}
            />
            <ColorPicker color={color} onChange={setColor} />
            <StrokeWidthSelector strokeWidth={strokeWidth} onChange={setStrokeWidth} />
            <UserList currentUserId={userId} />
          </aside>

          <main className="min-h-[600px] lg:min-h-[800px]">
            <Canvas
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              onClear={handleClear}
              onUndo={handleUndo}
              userId={userId}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
