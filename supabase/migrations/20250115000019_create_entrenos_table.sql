-- Create entrenos table for team training sessions
CREATE TABLE IF NOT EXISTS public.entrenos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    equipo_id UUID NOT NULL REFERENCES public.equipos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar TEXT NOT NULL,
    entrada TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure unique training per team per day
    UNIQUE(equipo_id, fecha)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entrenos_equipo_id ON public.entrenos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_entrenos_user_id ON public.entrenos(user_id);
CREATE INDEX IF NOT EXISTS idx_entrenos_fecha ON public.entrenos(fecha);

-- Enable RLS
ALTER TABLE public.entrenos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see entrenos from their own teams
CREATE POLICY "Users can view entrenos from their teams" ON public.entrenos
    FOR SELECT USING (
        equipo_id IN (
            SELECT id FROM public.equipos 
            WHERE usuario_id = (
                SELECT id FROM public.usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Users can insert entrenos for their teams
CREATE POLICY "Users can insert entrenos for their teams" ON public.entrenos
    FOR INSERT WITH CHECK (
        equipo_id IN (
            SELECT id FROM public.equipos 
            WHERE usuario_id = (
                SELECT id FROM public.usuarios 
                WHERE auth_user_id = auth.uid()
            )
        ) AND
        user_id = (
            SELECT id FROM public.usuarios 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Users can update entrenos for their teams
CREATE POLICY "Users can update entrenos for their teams" ON public.entrenos
    FOR UPDATE USING (
        equipo_id IN (
            SELECT id FROM public.equipos 
            WHERE usuario_id = (
                SELECT id FROM public.usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Users can delete entrenos for their teams
CREATE POLICY "Users can delete entrenos for their teams" ON public.entrenos
    FOR DELETE USING (
        equipo_id IN (
            SELECT id FROM public.equipos 
            WHERE usuario_id = (
                SELECT id FROM public.usuarios 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_entrenos_updated_at
    BEFORE UPDATE ON public.entrenos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
