// File: CodeRunnerModal.tsx

import React, { useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string, language: string) => void;
}

const mapLangToMonaco = (lang: string): string => {
  switch (lang.toUpperCase()) {
    case "PYTHON3":
      return "python";
    case "CPP14":
    case "CPP17":
      return "cpp";
    case "JAVA8":
    case "JAVA":
      return "java";
    case "JAVASCRIPT_NODE":
      return "javascript";
    case "TYPESCRIPT":
      return "typescript";
    default:
      return "plaintext";
  }
};

const CodeRunnerModal: React.FC<CodeRunnerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("PYTHON3");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Run Your Code</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </div>

        {/* Language Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Select Language:</label>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="PYTHON3">Python 3</option>
            <option value="CPP14">C++14</option>
            <option value="JAVA8">Java 8</option>
            <option value="JAVASCRIPT_NODE">JavaScript (Node)</option>
            <option value="TYPESCRIPT">TypeScript</option>
          </select>
        </div>

        {/* Monaco Editor */}
        <div>
          <Editor
            height="300px"
            language={mapLangToMonaco(language)}
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              wordWrap: "on",
            }}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(code, language)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Run Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeRunnerModal;
