import { useState } from 'react';
import { BookOpen, ExternalLink, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export interface BibReference {
  id: number;
  text: string;
  url?: string;
}

interface BibliographyDrawerProps {
  references: BibReference[];
  className?: string;
}

export function BibliographyDrawer({ references, className = '' }: BibliographyDrawerProps) {
  if (!references.length) return null;

  const handleDownload = () => {
    const text = references
      .map((r) => `[${r.id}] ${r.text}${r.url ? `\n    ${r.url}` : ''}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'referencias-cientificas.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex items-center gap-2 text-cream/40 text-xs hover:text-cream/70 transition-colors border border-gold/10 rounded-lg px-3 py-2">
            <BookOpen className="w-4 h-4" />
            Fuentes científicas ({references.length})
          </button>
        </SheetTrigger>
        <SheetContent className="bg-espresso border-l border-gold/20 text-cream w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-cream font-display text-lg">
              Referencias Científicas
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {references.map((ref) => (
              <div key={ref.id} className="flex gap-3">
                <span className="text-gold/60 text-xs font-mono shrink-0 mt-0.5">
                  [{ref.id}]
                </span>
                <div className="flex-1">
                  <p className="text-cream/70 text-sm leading-relaxed">{ref.text}</p>
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-gold/60 text-xs hover:text-gold mt-1 transition-colors"
                    >
                      Enlace <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleDownload}
            className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gold/10 border border-gold/30 text-cream/70 text-sm font-medium hover:bg-gold/20 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Descargar bibliografía
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
