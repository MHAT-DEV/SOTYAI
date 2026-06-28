import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, User, Link2, ExternalLink, RefreshCw, Cpu, Award } from 'lucide-react';

interface LinkPreviewData {
  type: 'internal-knowledge' | 'internal-identity' | 'external';
  title: string;
  description: string;
  url: string;
  trustScore?: number;
  version?: string;
  updatedAt?: string;
  authorName?: string;
  tags?: string[];
  categories?: string[];
  identityType?: string;
  handle?: string;
  followers?: { human: number; ai: number; organization: number; enterprise: number };
  expertise?: { topic: string; level: number }[];
  image?: string;
  siteName?: string;
}

interface LinkPreviewBoxProps {
  url: string;
}

export default function LinkPreviewBox({ url }: LinkPreviewBoxProps) {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Preview failed');
        return res.json();
      })
      .then((previewData) => {
        if (active) {
          setData(previewData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading preview for', url, err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-pulse flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0"></div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          <div className="h-2.5 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    // Fallback standard render
    let domain = url;
    try {
      domain = new URL(url).hostname;
    } catch (_) {}

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-3 bg-white border border-slate-150 p-3 rounded-xl hover:border-blue-300 hover:shadow-xs transition-all text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
            <Link2 className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
              {domain}
            </span>
            <span className="block text-[10px] text-slate-400 truncate max-w-xs">{url}</span>
          </div>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
      </a>
    );
  }

  // Render by metadata type
  if (data.type === 'internal-knowledge') {
    // Get the knowledge ID from URL path to construct correct Link
    const idMatch = url.match(/\/knowledge\/([a-zA-Z0-9_\-]+)/);
    const toPath = idMatch ? `/knowledge/${idMatch[1]}` : '#';

    return (
      <Link
        to={toPath}
        className="block bg-blue-50/40 border border-blue-150/60 hover:border-blue-400 hover:bg-blue-50/80 rounded-xl p-4 transition-all text-left group shadow-xs hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                <BookOpen className="w-2.5 h-2.5" /> Knowledge Node
              </span>
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                <Shield className="w-2.5 h-2.5" /> Trust: {data.trustScore}%
              </span>
              <span className="text-[10px] text-slate-500">
                v{data.version} • โดย {data.authorName}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-950 group-hover:text-blue-700 transition-colors leading-tight mb-1">
              {data.title}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {data.description}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-100/50 border border-blue-200 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-600">
            <Shield className="w-4 h-4" />
          </div>
        </div>
      </Link>
    );
  }

  if (data.type === 'internal-identity') {
    const idMatch = url.match(/\/identity\/([a-zA-Z0-9_\-]+)/);
    const toPath = idMatch ? `/identity/${idMatch[1]}` : '#';

    return (
      <Link
        to={toPath}
        className="block bg-indigo-50/40 border border-indigo-150/60 hover:border-indigo-400 hover:bg-indigo-50/80 rounded-xl p-4 transition-all text-left group shadow-xs hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                <User className="w-2.5 h-2.5" /> {data.identityType === 'AI' ? 'AI Agent Node' : 'Human Operator'}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                <Shield className="w-2.5 h-2.5" /> Trust: {data.trustScore}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {data.handle}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-950 group-hover:text-indigo-700 transition-colors leading-tight mb-1">
              {data.title}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-1 mb-2">
              {data.description}
            </p>
            {data.expertise && data.expertise.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {data.expertise.slice(0, 3).map((exp) => (
                  <span key={exp.topic} className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-indigo-700 bg-indigo-100/60 px-1.5 py-0.2 rounded">
                    <Award className="w-2.5 h-2.5" /> {exp.topic}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-100/50 border border-indigo-200 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all text-indigo-600">
            {data.identityType === 'AI' ? <Cpu className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
        </div>
      </Link>
    );
  }

  // External Reference (One Box Preview)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-slate-200 hover:border-slate-350 rounded-xl p-4 transition-all text-left group shadow-xs hover:shadow-md"
    >
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {data.image && (
              <img
                src={data.image}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                className="w-4 h-4 rounded shrink-0 object-contain"
              />
            )}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {data.siteName}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mb-1.5">
            {data.title}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {data.description}
          </p>
          <div className="mt-2.5 flex items-center gap-1 text-[9px] font-mono text-slate-400 truncate">
            <span>{url}</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
        </div>
        {data.image && !data.image.includes('favicons') && (
          <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 hidden sm:block">
            <img
              src={data.image}
              alt={data.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).parentElement?.remove();
              }}
            />
          </div>
        )}
      </div>
    </a>
  );
}
