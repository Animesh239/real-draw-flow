import { Slider } from "@/components/ui/slider";

interface StrokeWidthSelectorProps {
  strokeWidth: number;
  onChange: (width: number) => void;
}

export const StrokeWidthSelector = ({ strokeWidth, onChange }: StrokeWidthSelectorProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-toolbar-bg rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Stroke Width</span>
        <span className="text-sm font-bold text-foreground">{strokeWidth}px</span>
      </div>
      <Slider
        value={[strokeWidth]}
        onValueChange={(value) => onChange(value[0])}
        min={1}
        max={50}
        step={1}
        className="w-full"
      />
      <div className="flex items-center justify-center h-16 bg-canvas-bg rounded-md">
        <div
          className="rounded-full bg-foreground"
          style={{
            width: `${strokeWidth}px`,
            height: `${strokeWidth}px`,
          }}
        />
      </div>
    </div>
  );
};
