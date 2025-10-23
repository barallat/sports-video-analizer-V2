// Tipos para documentos legales
export type LegalDocumentType = "terms" | "privacy" | "cookies" | "legal";

// Tipos para la estructura de documentos legales
export interface LegalSection {
  id: string;
  title: string;
  content?: string;
  list?: Array<string | { label: string; value?: string }>;
  additionalContent?: string[];
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

// Función para reemplazar variables en el contenido legal
export function processLegalContent(content: string): string {
  return content
    .replace(/\{\{APP_NAME\}\}/g, "Sports Analyzer")
    .replace(/\{\{COMPANY_NAME\}\}/g, "META UBIQUITY S.L.");
}

// Función para procesar un objeto de contenido legal recursivamente
export function processLegalObject(obj: any): any {
  if (typeof obj === "string") {
    return processLegalContent(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(processLegalObject);
  }

  if (obj && typeof obj === "object") {
    const processed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = processLegalObject(value);
    }
    return processed;
  }

  return obj;
}

// Función para obtener el contenido legal procesado
export async function getLegalContent(type: LegalDocumentType) {
  try {
    let content;

    // Usar fetch para cargar los archivos JSON desde public
    switch (type) {
      case "terms":
        const termsResponse = await fetch("/data/legal/terms.json");
        content = await termsResponse.json();
        break;
      case "privacy":
        const privacyResponse = await fetch("/data/legal/privacy.json");
        content = await privacyResponse.json();
        break;
      case "cookies":
        const cookiesResponse = await fetch("/data/legal/cookies.json");
        content = await cookiesResponse.json();
        break;
      default:
        throw new Error(`Tipo de contenido legal no soportado: ${type}`);
    }

    return processLegalObject(content);
  } catch (error) {
    console.error(`Error cargando documento legal ${type}:`, error);
    // Retornar un documento de error
    return {
      title: "Error",
      lastUpdated: new Date().toLocaleDateString(),
      sections: [
        {
          id: "error",
          title: "Error al cargar el documento",
          content: `No se pudo cargar el documento ${type}. Por favor, inténtalo de nuevo más tarde.`,
        },
      ],
    };
  }
}

// Servicio legal principal
export const legalService = {
  getLegalContent,
  processLegalContent,
  processLegalObject,
};
