// src/components/YouTubePlayer.tsx
import { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  muted?: boolean;
  width?: string;
  height?: string;
}

export default function YouTubePlayer({
  videoId,
  autoplay = false,
  muted = false,
  width = '100%',
  height = '100%',
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const params = new URLSearchParams({
      enablejsapi: '1',
      origin: window.location.origin,
      autoplay: autoplay ? '1' : '0',
      mute: muted ? '1' : '0',
      rel: '0',
      modestbranding: '1',
    });

    iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?${params}`;
  }, [videoId, autoplay, muted]);

  return (
    <div style={{ position: 'relative', width, height, paddingBottom: '56.25%', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 0,
          borderRadius: '16px',
        }}
        title={`YouTube video player - ${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}