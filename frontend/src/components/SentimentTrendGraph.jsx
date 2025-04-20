import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Info } from "lucide-react";

// Color map for sentiments
const sentimentColors = {
  Positive: "#10b981", // Green
  Neutral: "#9ca3af", // Gray
  Negative: "#ef4444", // Red
};

// Format time for X-axis
// const formatTime = (date) =>
//    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SentimentTrendGraph = ({ data }) => {
  console.log("inside sentiment trend graph ", data)
  const [activeSentiment, setActiveSentiment] = useState(null);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const trends = data.map((entry) => {
      const time = entry.pubDate;
      const sentiment = entry?.sentiment;

      return {
        time,
        Positive: sentiment === "Positive" ? 1 : 0,
        Neutral: sentiment === "Neutral" ? 1 : 0,
        Negative: sentiment === "Negative" ? 1 : 0,
      };
    });

    // Group data by time
    const aggregated = {};
    trends.forEach((entry) => {
      if (!aggregated[entry.time]) {
        aggregated[entry.time] = {
          time: entry.time,
          Positive: 0,
          Neutral: 0,
          Negative: 0,
        };
      }

      aggregated[entry.time].Positive += entry.Positive;
      aggregated[entry.time].Neutral += entry.Neutral;
      aggregated[entry.time].Negative += entry.Negative;
    });

    setGraphData(Object.values(aggregated));
  }, [data]);

  const handleSentimentClick = (sentiment) => {
    setActiveSentiment((prev) => (prev === sentiment ? null : sentiment));
  };

  return (
    <Card className="h-full ml-4 w-[450px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Sentiment Trend Graph</CardTitle>
          <div className="flex items-center text-muted-foreground text-sm">
            <Info size={14} className="mr-1" />
            Last 24h
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(sentimentColors).map(([sentiment, color]) => (
            <Badge
              key={sentiment}
              variant={activeSentiment === sentiment ? "default" : "outline"}
              style={{
                backgroundColor:
                  activeSentiment === sentiment ? color : "transparent",
                borderColor: color,
                padding: "6px 12px",
                marginTop: "6px",
                color: activeSentiment === sentiment ? "white" : undefined,
              }}
              className="cursor-pointer"
              onClick={() => handleSentimentClick(sentiment)}
            >
              {sentiment}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-1 pt-4 h-[300px] mb-6">
        <ChartContainer
          config={Object.fromEntries(
            Object.entries(sentimentColors).map(([sentiment, color]) => [
              sentiment,
              { color },
            ])
          )}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={graphData}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12, fill: "#ffffff" }}
                tickMargin={10}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#ffffff" }}
                tickMargin={10}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value, name) => [value, name]}
                  />
                }
              />
              {Object.entries(sentimentColors).map(
                ([sentiment, color]) =>
                  (!activeSentiment || activeSentiment === sentiment) && (
                    <Line
                      key={sentiment}
                      type="monotone"
                      dataKey={sentiment}
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  )
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SentimentTrendGraph;
