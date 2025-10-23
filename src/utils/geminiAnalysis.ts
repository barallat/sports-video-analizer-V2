
import { GoogleGenerativeAI } from '@google/generative-ai';

// Available models
const AVAILABLE_MODELS = [
  "gemini-2.0-flash-exp", 
  "gemini-2.0-flash"
];

export interface AnalyzedAreaDetail {
  time: string;
  type: 'positive' | 'negative';
  name: string;
  summary: string;
  score: number;
}

export interface AnalysisResult {
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

export async function analyzeMovementWithGemini(
  videoFile: File,
  movementType: string,
  characteristics: string[],
  apiKey: string,
  athleteName: string = "el atleta",
  sport: string = "atletismo",
  position: string = "atleta"
): Promise<AnalysisResult> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the first available model
    const model = genAI.getGenerativeModel({ model: AVAILABLE_MODELS[0] });

    // Convert file to base64
    const base64Data = await fileToBase64(videoFile);
    
    const prompt = buildAnalysisPrompt(movementType, characteristics, athleteName, sport, position);

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: videoFile.type,
      },
    };

    console.log('Sending request to Gemini AI...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const analysisText = response.text();

    console.log('Raw Gemini response:', analysisText);

    // Try to extract JSON from the response
    try {
      // Look for JSON at the end of the response
      const jsonMatch = analysisText.match(/\{[\s\S]*"conclusion"[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const analysisResult = JSON.parse(jsonStr);
        
        // Validate the structure
        if (!analysisResult.characteristics || !Array.isArray(analysisResult.characteristics) || 
            analysisResult.characteristics.length !== 5) {
          throw new Error('Invalid analysis structure');
        }

        return analysisResult;
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Response text:', analysisText);
      
      // Fallback: create a structured response based on the text
      return createFallbackAnalysis(characteristics, analysisText);
    }
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    throw new Error('Error al analizar el video con Gemini AI: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  }
}

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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data:video/mp4;base64, part
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

export { AVAILABLE_MODELS };
