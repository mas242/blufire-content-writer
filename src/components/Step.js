import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

const Step = ({ stepNumber, currentStep, versions = [""], currentVersionIndex, onVersionChange, onGenerate, onNextSection, onProofread, step1Responses, step2Versions, step1Inputs, setStep1Inputs }) => {
  const [selectedStep1Version, setSelectedStep1Version] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (versions[currentVersionIndex]) {
      const versionData = versions[currentVersionIndex];
      if (stepNumber === 1) {
        setStep1Inputs({
          wordCount: versionData.wordCount || "",
          primaryKeyword: versionData.primaryKeyword || "",
          secondaryKeywords: versionData.secondaryKeywords || "",
          semanticKeywords: versionData.semanticKeywords || ""
        });
      }
    }
  }, [currentVersionIndex, versions, stepNumber, setStep1Inputs]);

  if (stepNumber !== currentStep) return null;

  const handleGenerateClick = async () => {
    setLoading(true);
    const message = `
      Word count: ${step1Inputs.wordCount}+ words | Primary keyword: ${step1Inputs.primaryKeyword} | Secondary keywords: ${step1Inputs.secondaryKeywords} | Semantically related keywords: ${step1Inputs.semanticKeywords}
    `;
    const inputValues = {
      message,
      step: stepNumber,
      wordCount: step1Inputs.wordCount,
      primaryKeyword: step1Inputs.primaryKeyword,
      secondaryKeywords: step1Inputs.secondaryKeywords,
      semanticKeywords: step1Inputs.semanticKeywords
    };
    await onGenerate(inputValues);
    setLoading(false);
  };

  const handleStartClick = async () => {
    setLoading(true);
    const step1Version = step1Responses[selectedStep1Version];
    const message = `
      Here is a content outline. Split the sections into SEPARATE RESPONSES to ensure the appropriate word count is met for every section. Content Outline:
      ${step1Version.response}
      Keywords Integration: The primary keywords will appear in the introduction and in several subheadings. Secondary keywords will be weaved throughout the outline's sections naturally, ensuring relevance to the content. Semantically related keywords will be used to enrich the content and improve search visibility.
      wordCount: ${step1Version.wordCount}
      primaryKeyword: ${step1Version.primaryKeyword}
      secondaryKeywords: ${step1Version.secondaryKeywords}
      semanticKeywords: ${step1Version.semanticKeywords}
    `;
    const inputValues = {
      message,
      step: 2
    };
    await onGenerate(inputValues);
    setLoading(false);
  };

  const handleNextSectionClick = async () => {
    setLoading(true);
    await onNextSection(2);
    setLoading(false);
  };

  const handleGenerateFullArticleClick = async () => {
    setLoading(true);
    const step1Version = step1Responses[selectedStep1Version];
    const message = `
      Here is a content outline. Content Outline:
      ${step1Version.response}
      Keywords Integration: The primary keywords will appear in the introduction and in several subheadings. Secondary keywords will be weaved throughout the outline's sections naturally, ensuring relevance to the content. Semantically related keywords will be used to enrich the content and improve search visibility.
      wordCount: ${step1Inputs.wordCount}
      primaryKeyword: ${step1Inputs.primaryKeyword}
      secondaryKeywords: ${step1Inputs.secondaryKeywords}
      semanticKeywords: ${step1Inputs.semanticKeywords}
    `;
    const inputValues = {
      message,
      step: 2
    };
    await onGenerate(inputValues);
    setLoading(false);
  };

  const handleProofreadClick = async () => {
    setLoading(true);
    await onProofread();
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
              <input type="number" placeholder="Word Count" value={step1Inputs.wordCount} onChange={(e) => setStep1Inputs({ ...step1Inputs, wordCount: e.target.value })} />
              <input type="text" placeholder="Primary Keyword" value={step1Inputs.primaryKeyword} onChange={(e) => setStep1Inputs({ ...step1Inputs, primaryKeyword: e.target.value })} />
            </div>
            <div className="keywords">
              <textarea placeholder="Secondary Keywords" value={step1Inputs.secondaryKeywords} onChange={(e) => setStep1Inputs({ ...step1Inputs, secondaryKeywords: e.target.value })}></textarea>
              <textarea placeholder="Semantically Related Keywords" value={step1Inputs.semanticKeywords} onChange={(e) => setStep1Inputs({ ...step1Inputs, semanticKeywords: e.target.value })}></textarea>
            </div>
            <button onClick={handleGenerateClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Generate Outline</button>
          </>
        )}
        {stepNumber === 2 && (
          <>
            <div className="controls">
              <select onChange={(e) => setSelectedStep1Version(e.target.value)}>
                {step1Responses.map((response, index) => (
                  <option key={index} value={index}>
                    Version {index + 1}
                  </option>
                ))}
              </select>
              <button onClick={handleStartClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Start</button>
              <button onClick={handleNextSectionClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Next Section</button>
            </div>
            <button onClick={handleGenerateFullArticleClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Generate Full Article</button>
            <button onClick={handleProofreadClick} disabled={loading} className={loading ? 'disabled-button' : ''}>Proofread</button>
          </>
        )}
        {stepNumber === 3 && (
          <>
            <div className="step2-version">
              <span>Proofreading Based off Step 2 Version: {versions[currentVersionIndex]?.step2VersionIndex + 1}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Step;
