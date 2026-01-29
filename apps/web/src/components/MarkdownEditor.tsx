"use client";

import React, { useCallback, useState } from "react";
import ReactMde from "react-mde";
import ReactMarkdown from "react-markdown";
import "react-mde/lib/styles/css/react-mde-all.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Start typing in markdown...",
  readOnly = false
}: MarkdownEditorProps) {
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">(readOnly ? "preview" : "write");

  const generateMarkdownPreview = useCallback(
    (markdown: string) => Promise.resolve(<ReactMarkdown>{markdown}</ReactMarkdown>),
    []
  );

  // Force preview mode when readOnly is true
  React.useEffect(() => {
    if (readOnly && selectedTab === "write") {
      setSelectedTab("preview");
    }
  }, [readOnly]);

  return (
    <div className="markdown-editor-container">
      <ReactMde
        value={value}
        onChange={onChange}
        selectedTab={selectedTab}
        onTabChange={readOnly ? undefined : setSelectedTab}
        generateMarkdownPreview={generateMarkdownPreview}
        minEditorHeight={250}
        heightUnits="px"
        readOnly={readOnly}
        classes={{
          reactMde: `border rounded-md overflow-hidden ${readOnly ? "read-only" : ""}`,
          toolbar: `border-b bg-gray-50 ${readOnly ? "hidden" : ""}`,
          preview: "p-4 bg-white"
        }}
      />
      <style jsx global>{`
        .mde-header {
          border-bottom: 1px solid #e2e8f0;
        }
        .mde-header .mde-tabs button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          color: #4a5568;
        }
        .mde-header .mde-tabs button.selected {
          color: #3182ce;
          border-bottom: 2px solid #3182ce;
        }
        .mde-textarea-wrapper textarea.mde-text {
          font-family: "SF Mono", "Segoe UI Mono", "Roboto Mono", monospace;
          font-size: 0.9rem;
          padding: 1rem;
          min-height: 250px;
          outline: none;
        }
        .mde-textarea-wrapper textarea.mde-text::placeholder {
          color: #a0aec0;
          opacity: 0.8;
        }
        .mde-preview .mde-preview-content {
          padding: 1rem;
        }
        .mde-preview .mde-preview-content h1,
        .mde-preview .mde-preview-content h2,
        .mde-preview .mde-preview-content h3,
        .mde-preview .mde-preview-content h4,
        .mde-preview .mde-preview-content h5,
        .mde-preview .mde-preview-content h6 {
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          line-height: 1.25;
        }
        .mde-preview .mde-preview-content h1 {
          font-size: 2em;
        }
        .mde-preview .mde-preview-content h2 {
          font-size: 1.5em;
        }
        .mde-preview .mde-preview-content p,
        .mde-preview .mde-preview-content ul,
        .mde-preview .mde-preview-content ol {
          margin-bottom: 1rem;
        }
        .mde-preview .mde-preview-content code {
          background-color: #f1f5f9;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: "SF Mono", "Segoe UI Mono", "Roboto Mono", monospace;
          font-size: 0.9em;
        }
        .mde-preview .mde-preview-content pre {
          background-color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .mde-preview .mde-preview-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .read-only .mde-textarea-wrapper textarea.mde-text {
          background-color: #f9fafb;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
