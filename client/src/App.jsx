import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Loader2, ShieldAlert, Cpu } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import MessageForm from './components/MessageForm';
import ResultsPreview from './components/ResultsPreview';

const API_BASE_URL = 'http://localhost:5000/api/stego';

function App() {
  const [mode, setMode] = useState('encode'); // 'encode', 'decode', 'compress'
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [quality, setQuality] = useState(50);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const resetState = () => {
    setImageFile(null);
    setMessage('');
    setPassword('');
    setResults(null);
    setError('');
    document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleProcess = async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }
    if (mode === 'encode' && !message) {
      setError('Please enter a secret message to encode.');
      return;
    }
    if (mode === 'compress' && !message) {
      setError('Please enter a secret message so we can test recovery after compression.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    if (password) formData.append('password', password);

    if (mode === 'encode' || mode === 'compress') {
      formData.append('message', message);
    }

    if (mode === 'compress') {
      formData.append('quality', quality);
    }

    try {
      const endpoint = mode === 'encode' ? '/encode' : (mode === 'decode' ? '/decode' : '/compress');
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
      if (response.data.success) {
        // Scroll to results smoothly
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-brand-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-12">
        {/* Header */}
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center space-x-2 mb-4 bg-brand-500/10 px-4 py-1.5 rounded-full border border-brand-500/20 text-brand-400 text-sm font-semibold tracking-wide">
            <ShieldAlert size={16} />
            <span>AI-Powered Security Engine</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-brand-500 to-blue-500 mb-4 tracking-tight">
            Robust Steganography
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Securely embed, encrypt, and extract hidden messages within images using advanced LSB techniques and AES-256 encryption.
          </p>
        </header>

        {/* Main Interface Block */}
        {!results ? (
          <main className="glass-panel p-6 md:p-8 animate-in zoom-in-95 fade-in duration-500">
            {/* Mode Selector */}
            <div className="flex p-1 bg-dark-900 rounded-lg mb-8 border border-dark-700">
              {['encode', 'decode', 'compress'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium capitalize transition-all duration-200 flex items-center justify-center gap-2
                    ${mode === m
                      ? 'bg-dark-800 text-brand-400 shadow shadow-black/20 border border-dark-600'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/50'}`}
                >
                  {m === 'encode' ? <EyeOff size={18} /> : (m === 'decode' ? <Eye size={18} /> : <Cpu size={18} />)}
                  {m === 'compress' ? 'Test Robustness' : m}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              {/* Image Upload Area */}
              <ImageUpload imageFile={imageFile} setImageFile={setImageFile} onClear={() => setImageFile(null)} />

              {/* Form Input Area */}
              {(mode === 'encode' || mode === 'decode' || mode === 'compress') && (
                <MessageForm
                  mode={mode === 'compress' ? 'encode' : mode} // Compress form behaves like encode form
                  message={message}
                  setMessage={setMessage}
                  password={password}
                  setPassword={setPassword}
                />
              )}

              {/* Quality Slider for compress mode */}
              {mode === 'compress' && (
                <div className="pt-4 border-t border-dark-700/50">
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
                    <span>JPEG Compression Quality</span>
                    <span className="text-blue-400 font-mono bg-blue-400/10 px-2 py-0.5 rounded">{quality}%</span>
                  </label>
                  <input
                    type="range"
                    min="10" max="100"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full accent-blue-500 bg-dark-700 rounded-lg appearance-none h-2 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Lower quality destroys more data. Test the limits of LSB steganography!
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <ShieldAlert size={18} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleProcess}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold tracking-wide text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus:ring-4 focus:ring-brand-500/30 transition-all shadow-lg shadow-brand-500/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'encode' && "Embed Message into Image"}
                    {mode === 'decode' && "Extract Hidden Message"}
                    {mode === 'compress' && "Run Robustness Simulation"}
                  </>
                )}
              </button>
            </div>
          </main>
        ) : (
          <ResultsPreview results={results} onReset={resetState} />
        )}
      </div>
    </div>
  );
}

export default App;
