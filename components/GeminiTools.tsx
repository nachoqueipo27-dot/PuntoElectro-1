import React, { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { Sparkles, Image as ImageIcon, Loader2, Wand2 } from 'lucide-react';

// ------------------- IMAGE GENERATOR -------------------

export const AIStudio: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
    
    // Gen State
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [size, setSize] = useState('1K');
    const [genImage, setGenImage] = useState<string | null>(null);
    const [genLoading, setGenLoading] = useState(false);

    // Edit State
    const [editPrompt, setEditPrompt] = useState('');
    const [editImage, setEditImage] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setGenLoading(true);
        try {
            const result = await GeminiService.generateConceptImage(prompt, aspectRatio, size);
            setGenImage(result);
        } catch (e) {
            alert("Error al generar imagen");
        } finally {
            setGenLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setOriginalImage(base64);
                setEditImage(null); // Reset previous edit
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = async () => {
        if (!originalImage || !editPrompt) return;
        setEditLoading(true);
        try {
            const result = await GeminiService.editImage(originalImage, editPrompt);
            setEditImage(result);
        } catch (e) {
            alert("Error al editar imagen");
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Sparkles className="text-purple-600" /> IA Design Studio
            </h1>
            <p className="text-slate-500 mb-8">Diseña espacios o edita tus fotos para visualizar proyectos eléctricos.</p>

            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setActiveTab('generate')}
                    className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'generate' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
                >
                    Generar Espacio
                </button>
                <button 
                    onClick={() => setActiveTab('edit')}
                    className={`px-6 py-2 rounded-full font-medium transition ${activeTab === 'edit' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
                >
                    Editar Foto
                </button>
            </div>

            {activeTab === 'generate' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Descripción del Proyecto</label>
                            <textarea 
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 h-32 resize-none"
                                placeholder="Ej: Un living moderno con tiras LED en el techo y lámparas colgantes industriales..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Formato</label>
                                    <select 
                                        className="w-full border p-2 rounded text-sm"
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value)}
                                    >
                                        <option value="1:1">Cuadrado (1:1)</option>
                                        <option value="16:9">Panorámico (16:9)</option>
                                        <option value="4:3">Estándar (4:3)</option>
                                        <option value="9:16">Historia (9:16)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Calidad</label>
                                    <select 
                                        className="w-full border p-2 rounded text-sm"
                                        value={size}
                                        onChange={(e) => setSize(e.target.value)}
                                    >
                                        <option value="1K">Estándar (1K)</option>
                                        <option value="2K">Alta (2K)</option>
                                        <option value="4K">Ultra (4K)</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={genLoading || !prompt}
                                className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {genLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                Generar Visualización
                            </button>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-2 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center min-h-[400px] overflow-hidden relative">
                        {genImage ? (
                            <img src={genImage} alt="Generated" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center text-slate-400">
                                <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                                <p>La imagen generada aparecerá aquí</p>
                            </div>
                        )}
                        {genLoading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <Loader2 size={48} className="text-purple-600 animate-spin mb-4" />
                                <p className="text-purple-800 font-medium">Renderizando diseño con Gemini 3 Pro...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'edit' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Original / Upload */}
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <h3 className="font-bold mb-4">1. Sube tu foto</h3>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 rounded-lg h-64 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition relative overflow-hidden"
                            >
                                {originalImage ? (
                                    <img src={originalImage} className="w-full h-full object-contain" alt="Original" />
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <Plus className="mx-auto mb-2" />
                                        <span className="text-sm">Click para subir foto</span>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </div>
                        </div>

                        {originalImage && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-bold mb-2">2. ¿Qué quieres cambiar?</h3>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Agrega una lámpara de pie moderna a la derecha..."
                                        className="flex-1 border p-2 rounded-lg text-sm"
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleEdit}
                                        disabled={editLoading || !editPrompt}
                                        className="bg-blue-600 text-white px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {editLoading ? <Loader2 className="animate-spin" /> : 'Editar'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Result */}
                    <div className="bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center h-[500px] overflow-hidden relative">
                         {editImage ? (
                            <img src={editImage} alt="Edited" className="w-full h-full object-contain" />
                         ) : (
                             <div className="text-slate-400 text-center">
                                 <Wand2 size={48} className="mx-auto mb-4 opacity-50" />
                                 <p>El resultado aparecerá aquí</p>
                             </div>
                         )}
                         {editLoading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                                <p className="text-blue-800 font-medium">Editando con Gemini Flash Image...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for UI
const Plus = ({className}: {className?: string}) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);