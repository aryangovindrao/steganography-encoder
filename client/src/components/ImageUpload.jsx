import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

const ImageUpload = ({ imageFile, setImageFile, onClear }) => {
    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setImageFile(acceptedFiles[0]);
        }
    }, [setImageFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg', '.jpg'],
        },
        maxFiles: 1
    });

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-slate-300 mb-2">Source Image</label>

            {!imageFile ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center min-h-[200px]
            ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-dark-600 hover:border-brand-400 hover:bg-dark-700/50'}`}
                >
                    <input {...getInputProps()} />
                    <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mb-4 text-brand-400">
                        <UploadCloud size={28} />
                    </div>
                    <p className="text-slate-200 font-medium mb-1">
                        {isDragActive ? "Drop image here..." : "Drag & drop your image here"}
                    </p>
                    <p className="text-slate-400 text-sm">PNG, JPG up to 10MB</p>
                </div>
            ) : (
                <div className="border border-dark-600 rounded-xl p-4 bg-dark-800 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded bg-dark-700 flex items-center justify-center text-brand-400 shrink-0">
                            <ImageIcon size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-slate-200 font-medium truncate whitespace-nowrap">{imageFile.name}</p>
                            <p className="text-slate-400 text-xs">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Remove image"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
