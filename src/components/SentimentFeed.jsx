import React, { useEffect, useState } from 'react';
import { ExternalLink, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SentimentFeed = ({ liveMode }) => {
  const [newsItems, setNewsItems] = useState([]);

  // Establish SSE connection
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8080');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
    
        // Detect if it's Google Trends-style
        if (Array.isArray(data.news)) {
          const formattedItems = data.news.map((newsItem) => ({
            title: newsItem.title,
            source: newsItem.source || new URL(newsItem.url).hostname,
            time: new Date(data.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            snippet: data.groqAnalysis?.summary || '', // summary is used as snippet
            sentiment: data.groqAnalysis?.sentiment?.toLowerCase() || 'neutral',
            bias: data.groqAnalysis?.bias_level === 'Low' ? '10/100' : '30/100',
            emotion: data.groqAnalysis?.mood || 'Neutral',
            verified: true,
            newItem: true,
            newsUrl: newsItem.url,
          }));
    
          setNewsItems((prevItems) => [...formattedItems, ...prevItems]);
        } else {
          // Original structure fallback
          const formattedItem = {
            title: data.title,
            source: new URL(data.newsUrl).hostname,
            time: new Date(data.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            snippet: data.description,
            sentiment: data.groqAnalysis?.sentiment?.toLowerCase() || 'neutral',
            bias: data.groqAnalysis?.bias_level === 'Low' ? '10/100' : '30/100',
            emotion: data.groqAnalysis?.mood || 'Neutral',
            verified: true,
            newItem: true,
            newsUrl: data.newsUrl,
          };
    
          setNewsItems((prevItems) => [formattedItem, ...prevItems]);
        }
      } catch (err) {
        console.error('Invalid SSE data:', err);
      }
    };
    
    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'text-monad';
      case 'negative':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSentimentBg = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-monad/10 border-monad/50 border-1';
      case 'negative':
        return 'bg-red-700/20 border-red-500/50';
      default:
        return 'bg-gray-500/10 border-gray-500/50';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setNewsItems((items) =>
        items.map((item) => ({ ...item, newItem: false }))
      );
    }, 6000);
  
    return () => clearTimeout(timer);
  }, [newsItems]);
  

  return (
    <div className="space-y-4">
      {newsItems.map((item, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${getSentimentBg(item.sentiment)} ${
            item.newItem && liveMode ? 'animate-fade-in' : ''
          }`}
        >
          <div className="flex justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{item.time}</span>
              <span>•</span>
              <span>{item.source}</span>
            </div>
            {item.newItem && (
              <Badge className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-xl shadow-[0_0_35px_rgba(255,0,0,0.6)]">
                NEW
              </Badge>
            )}
          </div>
          
          <h3 className="text-lg font-medium mb-2">{item.title}</h3>
          <p className="text-sm text-gray-300 mb-3">{item.snippet}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`font-medium ${getSentimentColor(item.sentiment)}`}>
                {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
              </span>

              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/10">
                <span>😮</span>
                <span className="text-xs">{item.emotion}</span>
              </div>

              <div className="text-xs text-gray-400">
                Bias: {item.bias}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {item.verified && (
                <Badge variant="outline" className="border-fluvio/30 text-fluvio text-xs bg-fluvio/10 p-2">
                  Verified
                </Badge>
              )}
              
              <a
                href={item.newsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs flex items-center">
                  View Full
                  <ExternalLink className=" h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      ))}

      <div className="p-4">
        <Button variant="ghost" className="w-full flex items-center justify-center gap-2 text-gray-400">
          <span>Load more</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SentimentFeed;
