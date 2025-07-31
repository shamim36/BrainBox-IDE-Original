import React, { useState } from "react";
import { toast } from "react-toastify";

const CLIENT_SECRET = "780a21237dd1333e5509ad236559e5532a1e5e9f";
const API_URL = "https://api.hackerearth.com/v4/partner/code-evaluation/submissions/";

const supportedLanguages = [
  { label: "Python 3", value: "PYTHON3" },
  { label: "Java 8", value: "JAVA8" },
  { label: "C++14", value: "CPP14" },
  { label: "JavaScript (Node.js)", value: "JAVASCRIPT_NODE" },
  { label: "TypeScript", value: "TYPESCRIPT" },
  { label: "PHP", value: "PHP" },
  // Add more as needed from the list you provided
];

const CodeRunnerPage: React.FC = () => {
  const [source, setSource] = useState("");
  const [language, setLanguage] = useState("PYTHON3");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [compileStatus, setCompileStatus] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Run code: POST request to HackerEarth API
  const runCode = async () => {
    if (!source.trim()) {
      toast.error("Please enter source code to run.", { position: "top-center" });
      return;
    }

    setLoading(true);
    setOutput(null);
    setCompileStatus(null);
    setRunStatus(null);

    try {
      const payload = {
        lang: language,
        source,
        input,
        time_limit: 5,
        memory_limit: 262144,
        context: JSON.stringify({ user: "currentUserId" }), // Optional context info
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "client-secret": CLIENT_SECRET,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResp = await response.json();
        throw new Error(errorResp.message || "Failed to send code for evaluation");
      }

      const data = await response.json();

      if (data.request_status.code === "REQUEST_QUEUED" || data.request_status.code === "REQUEST_INITIATED") {
        toast.info("Your code has been queued for evaluation. Checking results...", { position: "top-center" });

        // Poll for result with the given status_update_url
        await pollForResult(data.status_update_url);
      } else {
        toast.error("Unexpected response status: " + data.request_status.message, { position: "top-center" });
      }
    } catch (error: any) {
      toast.error(error.message || "Error running code", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  // Poll API to get status and results
  const pollForResult = async (statusUrl: string, retries = 15, delay = 2000): Promise<void> => {
    if (retries <= 0) {
      toast.error("Timed out waiting for code evaluation result.", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch(statusUrl, {
        headers: {
          "client-secret": CLIENT_SECRET,
        },
      });

      if (!response.ok) {
        const errorResp = await response.json();
        throw new Error(errorResp.message || "Failed to fetch status");
      }

      const data = await response.json();

      const statusCode = data.request_status.code;

      if (statusCode === "CODE_COMPILED") {
        setCompileStatus("Compilation successful");
        setRunStatus(null);
        // Continue polling for execution result
        setTimeout(() => pollForResult(statusUrl, retries - 1, delay), delay);
      } else if (statusCode === "REQUEST_COMPLETED") {
        setCompileStatus(data.result.compile_status);

        const runStatusData = data.result.run_status;
        setRunStatus(runStatusData.status);

        if (runStatusData.stderr) {
          setOutput(`Error: ${runStatusData.stderr}`);
        } else if (runStatusData.output) {
          setOutput(runStatusData.output);
        } else {
          setOutput("No output returned.");
        }
      } else if (statusCode === "REQUEST_FAILED") {
        toast.error("Code evaluation failed: " + (data.message || "Unknown error"), { position: "top-center" });
      } else {
        // Not ready yet, retry after delay
        setTimeout(() => pollForResult(statusUrl, retries - 1, delay), delay);
      }
    } catch (error: any) {
      toast.error(error.message || "Error polling for status", { position: "top-center" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Code Runner</h1>

      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        <label className="block">
          <span className="text-gray-300 mb-1 block">Select Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-md bg-gray-800 p-2 text-white"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-gray-300 mb-1 block">Source Code</span>
          <textarea
            rows={12}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Write your source code here..."
            className="w-full rounded-md bg-gray-800 p-3 font-mono text-sm resize-none text-white"
          />
        </label>

        <label className="block">
          <span className="text-gray-300 mb-1 block">Input (optional)</span>
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Input for the program..."
            className="w-full rounded-md bg-gray-800 p-3 font-mono text-sm resize-none text-white"
          />
        </label>

        <button
          onClick={runCode}
          disabled={loading}
          className={`py-2 px-4 rounded-md font-semibold transition-colors ${
            loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Running..." : "Run Code"}
        </button>

        {compileStatus && <p className="mt-4 text-yellow-400">Compilation Status: {compileStatus}</p>}
        {runStatus && <p className="mt-1 text-green-400">Run Status: {runStatus}</p>}

        {output !== null && (
          <div className="mt-4 p-4 bg-gray-800 rounded-md whitespace-pre-wrap font-mono text-sm">
            <strong>Output:</strong>
            <pre>{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeRunnerPage;
