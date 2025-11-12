-- Create tables for collaborative drawing

-- Drawing paths table to store all drawing strokes
CREATE TABLE public.drawing_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  path_data JSONB NOT NULL,
  color TEXT NOT NULL,
  stroke_width INTEGER NOT NULL,
  tool TEXT NOT NULL DEFAULT 'brush',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Operations table for undo/redo functionality
CREATE TABLE public.drawing_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL,
  path_id UUID REFERENCES public.drawing_paths(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.drawing_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawing_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow everyone to read and write (public canvas)
CREATE POLICY "Allow all to read drawing_paths"
  ON public.drawing_paths
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert drawing_paths"
  ON public.drawing_paths
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to delete drawing_paths"
  ON public.drawing_paths
  FOR DELETE
  USING (true);

CREATE POLICY "Allow all to read operations"
  ON public.drawing_operations
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert operations"
  ON public.drawing_operations
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawing_paths;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drawing_operations;

-- Create indexes for better performance
CREATE INDEX idx_drawing_paths_created_at ON public.drawing_paths(created_at);
CREATE INDEX idx_drawing_operations_created_at ON public.drawing_operations(created_at);