interface YouTubeVideoProps {
  url: string;
  title?: string;
  className?: string;
}

export function YouTubeVideo({ url, title, className = "" }: YouTubeVideoProps) {
  // Extract YouTube video ID from various URL formats
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = extractVideoId(url);

  if (!videoId) {
    return (
      <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
        Invalid YouTube URL: {url}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title || "YouTube Video"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        data-testid={`youtube-video-${videoId}`}
      />
    </div>
  );
}

export function parseContentWithVideos(content: any): any {
  if (typeof content === 'string') {
    // Simple text with YouTube URLs
    const youtubeUrlPattern = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+)/g;
    return content.replace(youtubeUrlPattern, (url: string) => {
      return `[YOUTUBE_VIDEO:${url}]`;
    });
  }
  
  if (Array.isArray(content)) {
    return content.map(parseContentWithVideos);
  }
  
  if (content && typeof content === 'object') {
    const parsed = {};
    for (const [key, value] of Object.entries(content)) {
      parsed[key] = parseContentWithVideos(value);
    }
    return parsed;
  }
  
  return content;
}

export function renderContentWithVideos(content: any): JSX.Element[] {
  if (typeof content === 'string') {
    const parts = content.split(/(\[YOUTUBE_VIDEO:https?:\/\/[^\]]+\])/);
    return parts.map((part, index) => {
      if (part.startsWith('[YOUTUBE_VIDEO:') && part.endsWith(']')) {
        const url = part.slice(15, -1); // Remove [YOUTUBE_VIDEO: and ]
        return <YouTubeVideo key={index} url={url} className="my-4" />;
      }
      return <p key={index} className="mb-4">{part}</p>;
    });
  }
  
  if (Array.isArray(content)) {
    return content.flatMap((item, index) => 
      renderContentWithVideos(item).map(element => 
        <div key={`${index}-${element.key}`}>{element}</div>
      )
    );
  }
  
  return [<div key="default" className="mb-4">{JSON.stringify(content)}</div>];
}