import { Button } from "@/components/ui/button";
import { Paintbrush, Eraser, Undo, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  tool: "brush" | "eraser";
  onToolChange: (tool: "brush" | "eraser") => void;
  onUndo: () => void;
  onClear: () => void;
}

export const Toolbar = ({ tool, onToolChange, onUndo, onClear }: ToolbarProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-toolbar-bg rounded-lg border border-border">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted-foreground">Tools</span>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "justify-start gap-2 transition-all",
              tool === "brush" && "bg-toolbar-active text-primary-foreground"
            )}
            onClick={() => onToolChange("brush")}
          >
            <Paintbrush className="h-5 w-5" />
            Brush
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "justify-start gap-2 transition-all",
              tool === "eraser" && "bg-toolbar-active text-primary-foreground"
            )}
            onClick={() => onToolChange("eraser")}
          >
            <Eraser className="h-5 w-5" />
            Eraser
          </Button>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <span className="text-sm font-medium text-muted-foreground">Actions</span>
        <div className="flex flex-col gap-2 mt-2">
          <Button
            variant="ghost"
            size="lg"
            className="justify-start gap-2"
            onClick={onUndo}
          >
            <Undo className="h-5 w-5" />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="justify-start gap-2 text-destructive hover:text-destructive"
            onClick={onClear}
          >
            <Trash2 className="h-5 w-5" />
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
};
