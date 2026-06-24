import { useState, useRef, type DragEvent } from 'react';
import { UploadCloud, FileText, X, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/Primitives';

/** Reads a File into a base64 string (without the data: prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function FileUpload({
  onReady,
}: {
  onReady: (base64: string, fileName: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (f: File | undefined) => {
    setError('');
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setError('File is too large (max 4 MB).');
      return;
    }
    setFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  };

  const proceed = async () => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      onReady(base64, file.name);
    } catch {
      setError('Failed to process the file. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold gold-gradient text-glow">Upload Your Kundli</h1>
        <p className="mt-2 text-sm text-slate-400">
          Drop your birth-chart PDF below. Claude reads the PDF directly — no manual data entry.
        </p>
      </div>

      <GlassCard glow>
        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-all ${
              dragging ? 'border-gold bg-gold/5' : 'border-white/15 hover:border-gold/40'
            }`}
          >
            <UploadCloud size={44} className="mb-4 text-gold" />
            <p className="text-slate-200">
              <span className="text-gold">Click to browse</span> or drag & drop
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF only • up to 4 MB</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => accept(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-4">
            <div className="flex items-center gap-3">
              <FileText className="text-gold" />
              <div>
                <p className="text-sm text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="text-slate-400 hover:text-rose-400">
              <X size={20} />
            </button>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

        <button onClick={proceed} disabled={!file} className="btn-gold mt-5 inline-flex w-full items-center justify-center gap-2">
          Continue to Checkout <ArrowRight size={18} />
        </button>
      </GlassCard>
    </div>
  );
}
