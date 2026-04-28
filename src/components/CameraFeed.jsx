import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { VideoOff } from "lucide-react";
import "./CameraFeed.css";

const getYoutubeEmbedUrl = (url) => {
  try {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get("v");
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/live/")) {
      videoId = url.split("live/")[1]?.split("?")[0];
    }
    
    if (videoId) {
      // Reverted to official YouTube embed. Third-party proxies are too unstable.
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`;
    }
  } catch (error) {
    console.error("Failed to parse YouTube URL:", error);
  }
  return null;
};

const FallbackFeed = () => (
  <div className="feed-fallback">
    <div className="noise-overlay-fallback"></div>
    <div className="fallback-content">
      <VideoOff size={32} className="fallback-icon" />
      <span>Live feed unavailable</span>
      <span className="no-signal">NO SIGNAL</span>
    </div>
  </div>
);

const CameraFeed = ({ url, isExpanded }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);
    let hls;

    if (!url) {
      setError(true);
      setLoading(false);
      return;
    }

    const isMp4 = url.toLowerCase().endsWith(".mp4");
    const isM3u8 = url.toLowerCase().endsWith(".m3u8");
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");

    if (isYoutube) {
      setLoading(false);
      return; // Handled via iframe
    }

    if (videoRef.current && !isYoutube) {
      const video = videoRef.current;

      const handleCanPlay = () => setLoading(false);
      const handleError = () => {
        setError(true);
        setLoading(false);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      if (isM3u8 && Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 10,
          maxMaxBufferLength: 20
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setError(true);
          }
        });
      } else if (isMp4 || video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support (Safari for HLS, or direct MP4)
        video.src = url;
      } else {
        setError(true);
      }

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        if (hls) hls.destroy();
      };
    }
  }, [url]);

  if (!url || error) {
    return <FallbackFeed />;
  }

  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");

  if (isYoutube) {
    const embedUrl = getYoutubeEmbedUrl(url);
    if (!embedUrl) return <FallbackFeed />;
    
    return (
      <div className="feed-container">
        {loading && <div className="feed-skeleton pulse"></div>}
        <iframe
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="feed-iframe"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
        ></iframe>
        {/* Overlay to prevent interaction unless expanded */}
        {!isExpanded && <div className="iframe-overlay"></div>}
      </div>
    );
  }

  return (
    <div className="feed-container">
      {loading && <div className="feed-skeleton pulse"></div>}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`feed-video ${loading ? "hidden" : ""}`}
        controls={isExpanded}
      />
    </div>
  );
};

export default CameraFeed;
