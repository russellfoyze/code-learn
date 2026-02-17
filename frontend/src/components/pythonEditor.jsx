import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const PythonEditor = () => {
  const [code, setCode] = useState(`# Welcome to Python!
# Let's start with a simple 'Hello, World!' program

def greet(name):
    return f"Hello, {name}!"

result = greet("World")
print(result)

# Your turn: Create a function that adds two numbers
def add_numbers(a, b):
    # Write your code here
    pass`);
  
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const pyodideRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Pyodide
  useEffect(() => {
    const loadPyodide = async () => {
      try {
        // Dynamically import Pyodide from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.async = true;
        
        script.onload = async () => {
          try {
            // @ts-ignore
            window.loadPyodide({
              indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
            }).then((pyodide) => {
              pyodideRef.current = pyodide;
              setIsLoading(false);
            });
          } catch (error) {
            console.error('Error initializing Pyodide:', error);
            setIsLoading(false);
            toast.error('Failed to load Python interpreter');
          }
        };
        
        script.onerror = () => {
          setIsLoading(false);
          toast.error('Failed to load Python interpreter. Please check your internet connection.');
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Pyodide:', error);
        setIsLoading(false);
        toast.error('Failed to load Python interpreter');
      }
    };

    loadPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodideRef.current) {
      toast.error('Python interpreter is still loading. Please wait...');
      return;
    }

    setIsRunning(true);
    setOutput('');
    setActiveTab('output');

    try {
      // Set up stdout capture
      pyodideRef.current.runPython(`
import sys
from io import StringIO
_stdout = StringIO()
sys.stdout = _stdout
      `);

      // Run the user code
      try {
        pyodideRef.current.runPython(code);
        
        // Get the output
        const outputText = pyodideRef.current.runPython('_stdout.getvalue()');
        setOutput(outputText || 'Code executed successfully! No output.');
      } catch (error) {
        // If there's an error, try to get any output first
        let errorOutput = '';
        try {
          errorOutput = pyodideRef.current.runPython('_stdout.getvalue()') || '';
        } catch (e) {
          // Ignore if we can't get stdout
        }
        
        // Format the error message
        const errorMessage = error.message || String(error);
        const traceback = error.toString();
        setOutput(errorOutput + (errorOutput ? '\n' : '') + `Error: ${errorMessage}` + (traceback.includes('Traceback') ? '\n' + traceback : ''));
      }
    } catch (error) {
      setOutput(`Error: ${error.message || String(error)}`);
      toast.error('Error executing code');
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode(`# Welcome to Python!
# Let's start with a simple 'Hello, World!' program

def greet(name):
    return f"Hello, {name}!"

result = greet("World")
print(result)

# Your turn: Create a function that adds two numbers
def add_numbers(a, b):
    # Write your code here
    pass`);
    setOutput('');
    setActiveTab('editor');
    toast.success('Code reset to default');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const clearOutput = () => {
    setOutput('');
    setActiveTab('editor');
  };

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Try Our Interactive Editor
          </h2>
          <p className="text-gray-600 text-lg">
            Write, run, and debug Python code right in your browser. No setup required!
          </p>
        </div>

        {/* Editor Container */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
          {/* Window Controls and Header */}
          <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
            {/* Window Controls */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-sm font-medium text-gray-700">Python Playground</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Copy Code"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={resetCode}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Reset Code"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={runCode}
                disabled={isRunning || isLoading}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'editor'
                  ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'output'
                  ? 'bg-white text-gray-900 border-b-2 border-gray-900'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Output
            </button>
          </div>

          {/* Editor/Output Content */}
          <div className="min-h-[400px]">
            {activeTab === 'editor' ? (
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[400px] p-4 font-mono text-sm border-none outline-none resize-none bg-white text-gray-800"
                  placeholder="Write your Python code here..."
                  spellCheck={false}
                />
                {isLoading && (
                  <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs">
                    Loading Python interpreter...
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 h-[400px] overflow-y-auto bg-gray-50">
                {output ? (
                  <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
                    {output}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>No output yet. Run your code to see results here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonEditor;

