import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SentimentTrendGraph from "./SentimentTrendGraph";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  FileDown,
  LogOut,
  User,
  BarChart3,
  Moon,
  Sun,
  Filter,
  Circle,
  LucideArrowDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import SentimentFeed from "@/components/SentimentFeed";
import SentimentOverview from "@/components/SentimentOverview";
import TopTopics from "@/components/TopTopics";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [liveMode, setLiveMode] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const isMobile = useIsMobile();
  const [newsItems, setNewsItems] = useState([]);

  function simplifyTrendingNews(data) {
    return data.map(topic => {
      return {
        title: topic.news[0].title,
        source: topic.news[0].source,
        time: new Date(topic.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        summary: topic.summary,
        bias: topic.bias_level,
        mood: topic.mood,
        news: topic.news.length > 0 ? [topic.news[0]] : [],
        newsUrl: topic.news[0].url,
        sentiment: topic.sentiment
      };
    });
  }
  const isGoogleNewsArray = (data) => {
    return Array.isArray(data) && data.length && Array.isArray(data[0]?.news);
  };

  const formatTrendNewsItem = (newsItem, pubDate) => ({
    title: newsItem.title,
    source: newsItem.source,
    time: new Date(pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    snippet: newsItem.summary || '',
    sentiment: newsItem?.sentiment?.toLowerCase() || 'neutral',
    bias: newsItem?.bias_level === 'Low' ? '10/100' : '30/100',
    emotion: newsItem?.mood || 'Neutral',
    verified: true,
    newItem: true,
    newsUrl: newsItem.url,
  });

  const formatSingleNewsItem = (data) => ({
    title: data.title,
    source: new URL(data.newsUrl).hostname,
    time: new Date(data.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    snippet: data.summary || data.description,
    sentiment: data.sentiment?.toLowerCase() || 'neutral',
    bias: data.bias_level === 'Low' ? '10/100' : '30/100',
    emotion: data.mood || 'Neutral',
    verified: true,
    newItem: true,
    newsUrl: data.newsUrl,
  });

  // Usage
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("http://localhost:8080/news/breaking");
        const data = await res.json();

        if (!data) {
          console.log("No data");
          return;
        }

        // Handle different data formats as before
        if (isGoogleNewsArray(data)) {
          // const formatTrendNews = formatTrendNewsItem(data);
          const formatted = simplifyTrendingNews(data);
          setNewsItems(formatted);
        } else if (Array.isArray(data.news)) {
          const formatted = data.news.map((item) =>
            formatTrendNewsItem(item, data.pubDate,)
          );
          setNewsItems(formatted);
        } else {
          const formatted = formatSingleNewsItem(data);
          setNewsItems([formatted]);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <div className="w-full max-w-screen-full mx-auto px-24">
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center">
            <div className="text-xl font-bold flex items-center">
              <BarChart3 className="text-fluvio mr-2" />
              <span className="gradient-text mr-1">Emo</span>
              <span>Scope</span>
            </div>
            <div className="ml-6 flex space-x-1"></div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`h-8 px-3 flex items-center gap-1.5 rounded-full ${liveMode
                ? "bg-monad/20 text-monad border-monad/30"
                : "bg-white/5"
                } `}
              onClick={() => setLiveMode(!liveMode)}
            >
              <Circle
                className={`h-2 w-2 ${liveMode ? "text-red-500 fill-red-500" : ""
                  }`}
              />
              <span>Live</span>
            </Button>

            <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>
              <Button className="btn-primary w-full rounded-md">
                Chat Yourself
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4">
          <div className="flex mb-4 justify-between">
            <div className="flex space-x-2">
              {["All Topics", "AI", "Politics", "Finance", "Health"].map(
                (topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTopic(topic)}
                    className={`rounded border-white/10 ${selectedTopic === topic
                      ? "bg-gradient-to-r from-fluvio to-monad text-white border-0"
                      : "bg-navy text-gray-300 hover:bg-white/5"
                      }`}
                  >
                    {topic}
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-150px)]">
            <div className="lg:w-3/5 flex flex-col">
              <ScrollArea className="h-full rounded-lg border border-white/10">
                <SentimentFeed mockData={newsItems} />
              </ScrollArea>
            </div>
            <div className="lg:w-2/5 flex flex-col gap-4">
              <ScrollArea className="h-full rounded-lg border border-white/10">
                <div className="bg-navy rounded-lg p-4">
                  <SentimentTrendGraph data={newsItems} />
                </div>
                <div className="bg-navy rounded-lg p-4 mt-4">
                  <SentimentOverview mockData={newsItems} />
                </div>
                <div className="bg-navy rounded-lg p-4 mt-4">
                  <TopTopics />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
