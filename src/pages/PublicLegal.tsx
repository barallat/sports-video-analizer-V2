import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { legalService, LegalDocumentType, LegalDocument } from "@/services/legalService";
import LegalContent from "@/components/LegalContent";
import LoadingSpinner from "@/components/LoadingSpinner";

const PublicLegal = () => {
  console.log("PublicLegal component is rendering");
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("terms");
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["terms", "privacy", "cookies"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        const documentType = activeTab as LegalDocumentType;
        const doc = await legalService.getLegalContent(documentType);
        setDocument(doc);
      } catch (err) {
        console.error("Error cargando documento legal:", err);
        setError("Error al cargar el documento legal");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }

    if (!document) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No se encontró el documento</p>
        </div>
      );
    }

    return <LegalContent document={document} />;
  };

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-primary hover:text-accent mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
        
        <article className="bg-white rounded-lg shadow-lg p-8">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange("terms")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "terms"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Términos y Condiciones
              </button>
              <button
                onClick={() => handleTabChange("privacy")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "privacy"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Política de Privacidad
              </button>
              <button
                onClick={() => handleTabChange("cookies")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "cookies"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Política de Cookies
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderContent()}
          </div>
        </article>
      </div>
    </PublicLayout>
  );
};

export default PublicLegal;
