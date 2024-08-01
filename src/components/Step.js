import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

const Step = ({ stepNumber, currentStep, versions = [""], currentVersionIndex, onVersionChange, onGenerate }) => {
  const [wordCount, setWordCount] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState("");
  const [semanticKeywords, setSemanticKeywords] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (versions[currentVersionIndex]) {
      const versionData = versions[currentVersionIndex];
      setWordCount(versionData.wordCount || "");
      setPrimaryKeyword(versionData.primaryKeyword || "");
      setSecondaryKeywords(versionData.secondaryKeywords || "");
      setSemanticKeywords(versionData.semanticKeywords || "");
    }
  }, [currentVersionIndex, versions]);

  if (stepNumber !== currentStep) return null;

  const handleGenerateClick = async () => {
    setLoading(true);
    const inputValues = {
      wordCount,
      primaryKeyword,
      secondaryKeywords,
      semanticKeywords
    };
    await onGenerate(inputValues);
    setLoading(false);
  };

  return (
    <div className="step active">
      <div className="content">
        {versions && (
          <div className="large-text-area-container" style={{ position: 'relative' }}>
            <textarea className="large-text-area" value={versions[currentVersionIndex]?.response || ""} readOnly />
            {loading && <Spinner />}
            <div className="version-indicator">
              <span>Version</span>
              <div>
                <button onClick={() => onVersionChange('prev')} disabled={loading || currentVersionIndex === 0}>&lt;</button>
                <span>{currentVersionIndex + 1} / {versions.length}</span>
                <button onClick={() => onVersionChange('next')} disabled={loading || currentVersionIndex === versions.length - 1}>&gt;</button>
              </div>
            </div>
          </div>
        )}
        {stepNumber === 1 && (
          <>
            <div className="inputs">
              <input type="number" placeholder="Word Count" value={wordCount} onChange={(e) => setWordCount(e.target.value)} />
              <input type="text" placeholder="Primary Keyword" value={primaryKeyword} onChange={(e) => setPrimaryKeyword(e.target.value)} />
            </div>
            <div className="keywords">
              <textarea placeholder="Secondary Keywords" value={secondaryKeywords} onChange={(e) => setSecondaryKeywords(e.target.value)}></textarea>
              <textarea placeholder="Semantically Related Keywords" value={semanticKeywords} onChange={(e) => setSemanticKeywords(e.target.value)}></textarea>
            </div>
            <button onClick={handleGenerateClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Generate Outline</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Step;
