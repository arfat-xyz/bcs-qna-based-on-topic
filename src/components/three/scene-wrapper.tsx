import React, { useState, useEffect, ReactNode } from 'react';

interface SceneWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  minHeight?: string;
}

/**
 * Checks whether WebGL is supported in the current environment.
 */
function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function SceneWrapper({
  children,
  fallback,
  className = '',
  minHeight = '280px',
}: SceneWrapperProps) {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    setHasWebGL(isWebGLSupported());
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!hasWebGL || hasError || prefersReducedMotion) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-neutral-900/60 dark:to-indigo-950/40 border border-neutral-200/60 dark:border-neutral-800/60 ${className}`}
        style={{ minHeight }}
      >
        <div className="text-center p-6 space-y-2">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Interactive Learning Geometry
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} onError={() => setHasError(true)}>
      {children}
    </div>
  );
}
