import React from 'react';
import { LegalDocument, LegalSection } from '@/services/legalService';

interface LegalContentProps {
  document: LegalDocument;
}

const LegalContent: React.FC<LegalContentProps> = ({ document }) => {
  const renderList = (list: Array<string | { label: string; value?: string }>) => {
    return (
      <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
        {list.map((item, index) => {
          if (typeof item === 'string') {
            return <li key={index}>{item}</li>;
          } else {
            return (
              <li key={index}>
                <strong>{item.label}</strong>
                {item.value && ` ${item.value}`}
              </li>
            );
          }
        })}
      </ul>
    );
  };

  const renderSection = (section: LegalSection) => {
    return (
      <div key={section.id}>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">{section.title}</h2>
        
        {section.content && (
          <p className="text-gray-700">{section.content}</p>
        )}
        
        {section.list && (
          <div className="mt-2">
            {renderList(section.list)}
          </div>
        )}
        
        {section.additionalContent && (
          <div className="mt-2">
            {section.additionalContent.map((content, index) => (
              <p key={index} className="text-gray-700">
                {content}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <p className="text-gray-600 mb-8">Última actualización: {document.lastUpdated}</p>
      
      <section className="space-y-6">
        {document.sections.map(renderSection)}
      </section>
    </div>
  );
};

export default LegalContent;
