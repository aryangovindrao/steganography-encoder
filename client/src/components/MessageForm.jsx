import React from 'react';
import { Lock, FileText, KeyRound } from 'lucide-react';

const MessageForm = ({ message, setMessage, password, setPassword, mode }) => {
    return (
        <div className="space-y-4 w-full">
            {/* Message Input - Only for Encode mode */}
            {mode === 'encode' && (
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-brand-400" />
                        Secret Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter the secret message you want to hide in the image..."
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none h-32"
                    />
                </div>
            )}

            {/* Password Input - For both Encode and Decode modes */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <KeyRound size={16} className="text-amber-400" />
                    Encryption Password <span className="text-slate-500 font-normal text-xs">(Optional for AES-256)</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={16} className="text-slate-500" />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === 'encode' ? "Secure with a password..." : "Enter password to decode..."}
                        className="w-full bg-dark-700/50 border border-dark-600 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                </div>
                {mode === 'encode' && password && (
                    <p className="mt-2 text-xs text-amber-500 flex items-center gap-1">
                        Your message will be encrypted with AES-256 before being embedded.
                    </p>
                )}
            </div>
        </div>
    );
};

export default MessageForm;
