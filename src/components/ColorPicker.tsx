import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const COLORS = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FF8800", // Orange
  "#8800FF", // Purple
  "#FFFFFF", // White
];

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-toolbar-bg rounded-lg border border-border">
      <span className="text-sm font-medium text-muted-foreground">Color</span>
      <div className="grid grid-cols-5 gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "w-10 h-10 rounded-md border-2 transition-all hover:scale-110",
              color === c ? "border-primary ring-2 ring-primary" : "border-border"
            )}
            style={{ backgroundColor: c }}
            aria-label={`Select ${c} color`}
          />
        ))}
      </div>
    </div>
  );
};
