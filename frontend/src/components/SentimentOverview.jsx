import { TrendingUp , Minus , TrendingDown} from "lucide-react";

const SentimentOverview = ({ mockData }) => {
  console.log("Inside sentiment overview ", mockData)
  // Calculate sentiment counts
  const total = mockData.length;

  const sentimentCount = {
    Positive: 0,
    Neutral: 0,
    Negative: 0,
  };

  mockData.forEach((item) => {
    if (sentimentCount[item.sentiment] !== undefined) {
      sentimentCount[item.sentiment]++;
    }
  });

  const sentimentData = [
    {
      type: 'Positive',
      percentage: total ? Math.round((sentimentCount.Positive / total) * 100) : 0,
      color: 'bg-monad',
      icon: TrendingUp,
      textColor: 'text-monad',
    },
    {
      type: 'Neutral',
      percentage: total ? Math.round((sentimentCount.Neutral / total) * 100) : 0,
      color: 'bg-gray-400',
      icon: Minus,
      textColor: 'text-gray-400',
    },
    {
      type: 'Negative',
      percentage: total ? Math.round((sentimentCount.Negative / total) * 100) : 0,
      color: 'bg-red-400',
      icon: TrendingDown,
      textColor: 'text-red-400',
    },
  ];

  return (
      <div>
        <h2 className="text-xl font-medium m-6 mt-8">Sentiment Overview</h2>

        <div className="space-y-4 ml-6">
          {sentimentData.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.textColor}`} />
                    <span>{item.type}</span>
                  </div>
                  <span className="font-mono">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                      className={`h-full ${item.color} transition-all duration-500 ease-out`}
                      style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default SentimentOverview;
