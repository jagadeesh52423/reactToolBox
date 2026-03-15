'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ControlBar from './ControlBar';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';

/**
 * Base64Tool Component
 *
 * Main orchestrator component for the Base64 Encoder/Decoder tool.
 * Manages all state and delegates rendering to child components.
 */
export default function Base64Tool() {
    const searchParams = useSearchParams();
    const urlInput = searchParams.get('input');
    const urlMode = searchParams.get('mode');

    const [storedInput, setStoredInput] = useLocalStorage<string>('reactToolBox_base64_input', '');
    const [storedMode, setStoredMode] = useLocalStorage<'encode' | 'decode'>('reactToolBox_base64_mode', 'encode');

    const [input, setInputRaw] = useState<string>(urlInput || '');
    const [output, setOutput] = useState<string>('');
    const [mode, setModeRaw] = useState<'encode' | 'decode'>(
        urlMode === 'encode' || urlMode === 'decode' ? urlMode : 'encode'
    );

    // Restore from localStorage when no URL params are present (after hydration)
    useEffect(() => {
        if (!urlInput && storedInput) {
            setInputRaw(storedInput);
        }
        if (!urlMode && storedMode !== 'encode') {
            setModeRaw(storedMode);
        }
    }, [storedInput, storedMode, urlInput, urlMode]);

    // Wrap setters to also persist to localStorage
    const setInput = useCallback((value: string) => {
        setInputRaw(value);
        setStoredInput(value);
    }, [setStoredInput]);

    const setMode = useCallback((value: 'encode' | 'decode') => {
        setModeRaw(value);
        setStoredMode(value);
    }, [setStoredMode]);
    const [autoDetect, setAutoDetect] = useState<boolean>(urlInput ? false : true);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2000);
    }, []);

    const encodeText = useCallback((text: string): string => {
        return btoa(unescape(encodeURIComponent(text)));
    }, []);

    const decodeText = useCallback((text: string): string => {
        return decodeURIComponent(escape(atob(text)));
    }, []);

    const isValidBase64 = useCallback((text: string): boolean => {
        const trimmed = text.trim();
        if (trimmed.length === 0) return false;
        return /^[A-Za-z0-9+/=]+$/.test(trimmed);
    }, []);

    const processInput = useCallback((text: string, currentMode: 'encode' | 'decode') => {
        if (text.trim().length === 0) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            if (currentMode === 'encode') {
                setOutput(encodeText(text));
                setError(null);
            } else {
                setOutput(decodeText(text));
                setError(null);
            }
        } catch {
            setError(
                currentMode === 'decode'
                    ? 'Invalid Base64 input. The text could not be decoded.'
                    : 'Failed to encode the input text.'
            );
            setOutput('');
        }
    }, [encodeText, decodeText]);

    // Auto-detect mode and process input whenever input changes
    useEffect(() => {
        let detectedMode = mode;

        if (autoDetect && input.trim().length > 0) {
            if (isValidBase64(input.trim())) {
                try {
                    atob(input.trim());
                    detectedMode = 'decode';
                } catch {
                    detectedMode = 'encode';
                }
            } else {
                detectedMode = 'encode';
            }
            if (detectedMode !== mode) {
                setMode(detectedMode);
            }
        }

        processInput(input, detectedMode);
    }, [input, autoDetect, isValidBase64, processInput, mode]);

    // Reprocess when mode changes manually
    const handleModeChange = useCallback((newMode: 'encode' | 'decode') => {
        setAutoDetect(false);
        setMode(newMode);
        processInput(input, newMode);
    }, [input, processInput]);

    const handleInputChange = useCallback((value: string) => {
        setInput(value);
        setFileName(null);
    }, []);

    const handleFileUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data:...;base64, prefix
            const base64Content = result.split(',')[1] || '';
            setInput(base64Content);
            setFileName(file.name);
            setMode('decode');
            setAutoDetect(false);
            setOutput(base64Content);
            setError(null);
        };
        reader.onerror = () => {
            showToast('Failed to read file', 'error');
        };
        reader.readAsDataURL(file);
    }, [showToast]);

    const handleCopyOutput = useCallback(async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            showToast('Copied to clipboard', 'success');
        } catch {
            showToast('Failed to copy to clipboard', 'error');
        }
    }, [output, showToast]);

    const handleClear = useCallback(() => {
        setInput('');
        setOutput('');
        setError(null);
        setFileName(null);
        setMode('encode');
        setAutoDetect(true);
    }, []);

    return (
        <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Control Bar */}
            <ControlBar
                mode={mode}
                autoDetect={autoDetect}
                fileName={fileName}
                onModeChange={handleModeChange}
                onAutoDetectToggle={() => setAutoDetect((prev) => !prev)}
                onFileUpload={handleFileUpload}
                onClear={handleClear}
            />

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-hidden min-h-0">
                <div className="w-full h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        {/* Left Panel - Input */}
                        <InputPanel
                            input={input}
                            fileName={fileName}
                            mode={mode}
                            onInputChange={handleInputChange}
                        />

                        {/* Right Panel - Output */}
                        <OutputPanel
                            output={output}
                            error={error}
                            mode={mode}
                            onCopy={handleCopyOutput}
                        />
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <div
                    className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium z-50 transition-all ${
                        toast.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}
                    role="alert"
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
}
