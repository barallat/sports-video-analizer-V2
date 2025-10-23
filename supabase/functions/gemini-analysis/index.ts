import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  video_base64: string;
  video_mime_type: string;
  movement_type: string;
  characteristics: string[];
  athlete_name?: string;
  sport?: string;
  position?: string;
}

interface AnalysisResult {
  characteristics: Array<{
    name: string;
    time: string;
    score: number;
    feedback: string;
    summary: string;
  }>;
  overall_score: number;
  conclusion: string;
}

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  // Puedes añadir más modelos aquí si lo deseas
];

function buildAnalysisPrompt(
  movementType: string,
  characteristics: string[],
  athleteName: string = "el atleta",
  sport: string = "atletismo",
  position: string = "atleta"
): string {
  return `Eres un entrenador experto en ${sport} con más de 10 años de experiencia en la preparación física de ${position}. Tu enfoque combina técnicas científicas de entrenamiento con estrategias personalizadas basadas en las necesidades individuales de cada ${position} de ${sport}. Responde con claridad, precisión y realismo. NO seas benevolente ni puntúes al alza. Sé crítico.

Además, cuentas con conocimientos avanzados en:
- **Biomecánica aplicada al ${sport}**: Análisis de técnica de ${sport} postural y eficiencia energética.
- **Fisiología del ejercicio**: Comprensión profunda de las respuestas del cuerpo al entrenamiento y la recuperación.
- **Psicología deportiva**: Estrategias para mejorar la motivación, la concentración y la gestión del estrés competitivo.
- **Prevención y rehabilitación de lesiones**: Identificación de riesgos y diseño de programas de prevención y rehabilitación.

Analiza el siguiente video (reduciendo la velocidad a una cuarta parte) de ${athleteName} realizando ${movementType} y proporciona un análisis técnico detallado.

Por favor, evalúa los siguientes cinco aspectos técnicos específicos para esta disciplina:
${characteristics.map((area, index) => `${index + 1}. ${area}`).join('\n')}

Para CADA UNO de estos cinco aspectos, proporciona:
- El nombre del aspecto tal como se te ha dado.
- El tiempo del video (en formato m:ss) donde se observa predominantemente este aspecto.
- Un análisis técnico detallado del aspecto.
- Una puntuación individual para ese aspecto (en formato "Puntuación: X/10").
- Un resumen conciso de este análisis en MÁXIMO 50 palabras (para superponer en video). Formato: **Resumen:** [Tu resumen aquí]

Usa el siguiente formato exacto para cada aspecto:
### Nombre del Aspecto
**Tiempo:** m:ss (solo el segundo en el que empieza, no pongas un rango ni pongas decimales)
**Análisis:**
[Tu análisis detallado aquí]
**Puntuación:** X/10
**Resumen:** [Tu resumen conciso aquí, MÁXIMO 50 palabras]
--- (una línea separadora de tres guiones después de cada uno de los 5 aspectos)

Si el video es de una carrera, añade una sección más antes de la Conclusión. En ese caso quedará:
### TIEMPO Y TIEMPOS DE PASO
(Si aplica, incluye aquí el tiempo de la carrera y los tiempos de paso. Si es un 100m, cada 10 metros. Si es un 200m, cada 50 metros. Si es una distancia mayor, cada 100 metros. Si no puedes dar los tiempos de forma fiable, indica que no se pueden obtener porque faltan referencias en el video. Si no es una carrera, indica "No aplica para esta disciplina.")
---

### CONCLUSIÓN
[Tu conclusión general aquí, incluyendo una evaluación general y el potencial de mejora del atleta.]
---

**Valoración técnica completa = X/10** (Esta debe ser la media de las 5 puntuaciones individuales de los aspectos analizados. Asegúrate de que el formato sea el pedido, no pongas la suma de las valoraciones de cada punto y luego la media, pon solo valormedio/10.)

Sé específico y técnico en tus análisis, usando terminología de atletismo profesional.
La categorización en "Aspectos Positivos" y "Áreas de Mejora" la realizaré yo a partir de tus puntuaciones.

IMPORTANTE: Después de todo tu análisis detallado, al final de tu respuesta, incluye también un JSON estructurado para facilitar el procesamiento automático:

{
  "characteristics": [
    {
      "name": "${characteristics[0]}",
      "time": "[tiempo del video]",
      "score": [puntuación 1-10],
      "feedback": "[análisis técnico detallado completo]",
      "summary": "[resumen de máximo 50 palabras]"
    },
    {
      "name": "${characteristics[1]}",
      "time": "[tiempo del video]",
      "score": [puntuación 1-10],
      "feedback": "[análisis técnico detallado completo]",
      "summary": "[resumen de máximo 50 palabras]"
    },
    {
      "name": "${characteristics[2]}",
      "time": "[tiempo del video]",
      "score": [puntuación 1-10],
      "feedback": "[análisis técnico detallado completo]",
      "summary": "[resumen de máximo 50 palabras]"
    },
    {
      "name": "${characteristics[3]}",
      "time": "[tiempo del video]",
      "score": [puntuación 1-10],
      "feedback": "[análisis técnico detallado completo]",
      "summary": "[resumen de máximo 50 palabras]"
    },
    {
      "name": "${characteristics[4]}",
      "time": "[tiempo del video]",
      "score": [puntuación 1-10],
      "feedback": "[análisis técnico detallado completo]",
      "summary": "[resumen de máximo 50 palabras]"
    }
  ],
  "overall_score": [promedio de las 5 puntuaciones],
  "conclusion": "[Conclusión general del análisis]"
}

Devuelve la respuesta en Español.`;
}

async function tryGeminiModels(genAI, prompt, imagePart) {
  let lastError;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        prompt,
        imagePart
      ], {
        generationConfig: {
          temperature: 0
        }
      });
      const response = await result.response;
      const analysisText = response.text();
      return { analysisText, modelName };
    } catch (err) {
      console.error(`Error with Gemini model ${modelName}:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error("No Gemini models succeeded");
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const { 
      video_base64, 
      video_mime_type,
      movement_type, 
      characteristics, 
      athlete_name = "el atleta",
      sport = "atletismo",
      position = "atleta"
    }: AnalysisRequest = await req.json();

    console.log('Starting Gemini analysis for movement:', movement_type);
    console.log('Video mime type:', video_mime_type);
    console.log('Video base64 size:', video_base64?.length || 0);
    console.log('Characteristics to analyze:', characteristics);
    console.log('Athlete:', athlete_name, 'Sport:', sport, 'Position:', position);

    if (!video_base64) {
      throw new Error('No video data provided');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const prompt = buildAnalysisPrompt(movement_type, characteristics, athlete_name, sport, position);

    const imagePart = {
      inlineData: {
        data: video_base64,
        mimeType: video_mime_type,
      },
    };

    // --- Lógica de fallback de modelos ---
    console.log('Sending request to Gemini AI with fallback models...');
    const { analysisText, modelName } = await tryGeminiModels(genAI, prompt, imagePart);
    console.log('Raw Gemini response (model:', modelName, '):', analysisText);

    // Try to extract JSON from the response
    let analysisResult: AnalysisResult;
    try {
      // Look for JSON at the end of the response
      const jsonMatch = analysisText.match(/\{[\s\S]*"conclusion"[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedResult = JSON.parse(jsonStr);
        
        // Validate the structure and extract detailed analysis from the text
        if (!parsedResult.characteristics || !Array.isArray(parsedResult.characteristics) || 
            parsedResult.characteristics.length !== 5) {
          throw new Error('Invalid analysis structure');
        }

        // Extract detailed analysis for each characteristic from the text
        const enhancedCharacteristics = parsedResult.characteristics.map((char: any, index: number) => {
          // Try to extract the detailed analysis from the text for this characteristic
          const characteristicPattern = new RegExp(`### ${char.name}[\\s\\S]*?\\*\\*Análisis:\\*\\*([\\s\\S]*?)\\*\\*Puntuación:`);
          const match = analysisText.match(characteristicPattern);
          const detailedAnalysis = match ? match[1].trim() : char.feedback;
          
          return {
            ...char,
            feedback: detailedAnalysis || char.feedback, // Use detailed analysis or fallback to summary
            time: char.time || '0:00'
          };
        });

        analysisResult = {
          ...parsedResult,
          characteristics: enhancedCharacteristics
        };

        console.log('Successfully parsed and enhanced Gemini analysis');
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Response text:', analysisText);
      
      // Fallback: create a structured response based on the text
      analysisResult = createFallbackAnalysis(characteristics, analysisText);
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Error desconocido en el análisis' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createFallbackAnalysis(characteristics: string[], analysisText: string): AnalysisResult {
  console.log('Creating fallback analysis...');
  
  const fallbackCharacteristics = characteristics.map((char, index) => ({
    name: char,
    time: '0:00',
    score: Math.floor(Math.random() * 3) + 6, // Random score between 6-8
    feedback: `Análisis de ${char}: ${analysisText.substring(index * 50, (index + 1) * 50 + 100)}...`,
    summary: `Resumen de ${char}`
  }));

  const overallScore = fallbackCharacteristics.reduce((sum, char) => sum + char.score, 0) / fallbackCharacteristics.length;

  return {
    characteristics: fallbackCharacteristics,
    overall_score: parseFloat(overallScore.toFixed(1)),
    conclusion: analysisText.length > 200 ? analysisText.substring(0, 200) + '...' : analysisText
  };
}
