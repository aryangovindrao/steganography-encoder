import React from 'react';
import { Download, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const ResultsPreview = ({ results, onReset }) => {
    if (!results) return null;

    return (
        <div className="space-y-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Encode Results view */}
            {results.encodedImage && (
                <div className="glass-panel p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                        <CheckCircle2 className="text-brand-400" /> Encoding Successful
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Original Preview */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-400 text-center">Original Image</p>
                            <div className="bg-dark-900 rounded-lg p-2 border border-dark-700 aspect-video flex items-center justify-center overflow-hidden">
                                <img src={results.originalImage} alt="Original" className="max-h-full max-w-full object-contain" />
                            </div>
                        </div>

                        {/* Encoded Preview */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <p className="font-medium text-slate-400">Encoded Image</p>
                                <span className="text-brand-400 bg-brand-400/10 px-2 py-1 rounded text-xs font-semibold">
                                    PSNR: {results.psnr} dB
                                </span>
                            </div>
                            <div className="bg-dark-900 rounded-lg p-2 border border-brand-500/50 shadow-[0_0_15px_rgba(20,184,166,0.1)] aspect-video flex items-center justify-center overflow-hidden relative group">
                                <img src={results.encodedImage} alt="Encoded" className="max-h-full max-w-full object-contain" />

                                {/* Hover Overlay Download */}
                                <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a
                                        href={results.encodedImage}
                                        download="encoded-stego-image.png"
                                        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/20"
                                    >
                                        <Download size={18} /> Download Image
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metrics block */}
                    <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-300">Quality Analytics</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Peak Signal-to-Noise Ratio (PSNR) measures visual quality loss.
                                {parseFloat(results.psnr) > 40 ? " >40 dB is excellent, generally imperceptible to the human eye." : " Lower values mean more visible distortion."}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Decode Results view */}
            {results.message && (
                <div className="glass-panel p-6 space-y-4 border-l-4 border-l-brand-500">
                    <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                        <CheckCircle2 className="text-brand-400" /> Decoding Successful
                    </h3>
                    <div className="bg-dark-900 p-4 rounded-xl border border-dark-700">
                        <p className="text-sm font-medium text-slate-400 mb-2">Recovered Secret Message:</p>
                        <p className="text-slate-200 font-mono whitespace-pre-wrap break-words">{results.message}</p>
                    </div>
                </div>
            )}

            {/* Compress Simulation view */}
            {results.compressedImage && (
                <div className="glass-panel p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                        <RefreshCw className="text-blue-400" /> Compression Robustness Test
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <p className="font-medium text-slate-400">JPEG Compressed Image</p>
                                <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs font-semibold">
                                    PSNR: {results.psnr} dB
                                </span>
                            </div>
                            <div className="bg-dark-900 rounded-lg p-2 border border-dark-700 aspect-video flex items-center justify-center overflow-hidden">
                                <img src={results.compressedImage} alt="Compressed" className="max-h-full max-w-full object-contain" />
                            </div>
                        </div>

                        <div className="flex flex-col justify-center space-y-4">
                            <div className={`p-4 rounded-xl border ${results.decodedSuccess ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <h4 className="flex items-center gap-2 text-sm font-semibold mb-2 text-slate-200">
                                    {results.decodedSuccess ? <CheckCircle2 className="text-green-400 shrink-0" /> : <AlertCircle className="text-red-400 shrink-0" />}
                                    Recovery Test: {results.decodedSuccess ? 'Passed' : 'Failed'}
                                </h4>
                                <p className="text-slate-300 text-sm mb-2">
                                    Attempted to decode the message from the compressed JPEG image.
                                </p>
                                <div className="bg-dark-900 p-3 rounded-lg border border-dark-700/50">
                                    <p className="text-xs text-slate-400 mb-1">Recovered Data:</p>
                                    <p className="font-mono text-sm text-slate-200 truncate">{results.recoveredMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Try Again Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={onReset}
                    className="px-6 py-2 rounded-lg font-medium border border-dark-600 text-slate-300 hover:bg-dark-800 transition-colors"
                >
                    Start New Task
                </button>
            </div>
        </div>
    );
};

export default ResultsPreview;
