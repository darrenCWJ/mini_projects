import { Card } from "./ui/card";
import { TicketCheck, TicketX, Clock, TrendingUp } from "lucide-react";

interface Metric {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

interface MetricsCardsProps {
  metrics: Metric[];
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
              <p className="text-2xl font-semibold mb-2">{metric.value}</p>
              <p className={`text-xs ${getChangeColor(metric.changeType)} break-words`}>
                {metric.change}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg ml-2 flex-shrink-0">
              {metric.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
