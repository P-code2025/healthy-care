import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  memo,
} from 'react';

export interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  muted?: boolean;
  width?: string;
  height?: string;
  onStateChange?: (state: number) => void;
}

export interface YouTubePlayerRef {
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  (
    {
      videoId,
      autoplay = false,
      muted = false,
      width = '100%',
      height = '100%',
      onStateChange,
    },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number, allowSeekAhead = true) => {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [seconds, allowSeekAhead],
          }),
          '*'
        );
      },
      playVideo: () => {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo' }),
          '*'
        );
      },
      pauseVideo: () => {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo' }),
          '*'
        );
      },
    }));

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange' && onStateChange) {
            onStateChange(data.info);
          }
        } catch {
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onStateChange]);

    if (!videoId || videoId.length !== 11) {
      return (
        <div
          style={{
            width,
            height,
            background: '#000',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          Video unavailable
        </div>
      );
    }

    const params = new URLSearchParams({
      enablejsapi: '1',
      origin: window.location.origin,
      autoplay: autoplay ? '1' : '0',
      mute: muted ? '1' : '0',
      rel: '0',
      modestbranding: '1',
      iv_load_policy: '3',
      controls: '1',
      fs: '1',
    });

    const src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;

    return (
      <div
        style={{
          position: 'relative',
          width,
          height,
          paddingBottom: '56.25%',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title={`YouTube - ${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
          loading="lazy"
        />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

export default memo(YouTubePlayer);
