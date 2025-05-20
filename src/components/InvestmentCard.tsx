import { Card, CardContent } from "@/components/ui/card";
import { Building, Shield, Split, CircleHelp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Investment } from "@/hooks/useInvestments";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface InvestmentCardProps {
  investment: Investment;
}

export const InvestmentCard = ({ investment }: InvestmentCardProps) => {
  const icon = investment.product_title.includes("Institutional") ? Building : Shield;
  const Icon = icon;
  const [showPerformanceBreakdown, setShowPerformanceBreakdown] = useState(false);

  // Calculate total performance
  const totalPerformance = useMemo(() => {
    return investment.fixed_interest_rate + investment.profit_share_rate;
  }, [investment.fixed_interest_rate, investment.profit_share_rate]);

  // Generate dynamic performance data based on the investment's performance percentage
  const performanceData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    
    // Use the last 8 months (or less if we don't have 8 months of history)
    const startMonth = currentMonth >= 7 ? currentMonth - 7 : currentMonth + 5;
    
    // Base value for calculations
    const baseValue = 100;
    const monthlyData = [];
    
    // Calculate monthly growth factor based on annual performance
    const monthlyGrowthFactor = Math.pow(1 + totalPerformance / 100, 1/12) - 1;
    
    // Generate data for each month with some randomness for natural variation
    let currentValue = baseValue;
    for (let i = 0; i < 8; i++) {
      const monthIndex = (startMonth + i) % 12;
      
      // Add some randomness to monthly performance (±20% of the monthly growth)
      const randomFactor = 1 + (Math.random() * 0.4 - 0.2);
      const monthlyChange = currentValue * monthlyGrowthFactor * randomFactor;
      
      // Ensure we don't go below zero for negative performances
      currentValue = Math.max(currentValue + monthlyChange, currentValue * 0.95);
      
      monthlyData.push({
        month: months[monthIndex],
        value: parseFloat(currentValue.toFixed(2))
      });
    }
    
    return monthlyData;
  }, [totalPerformance]);

  return (
    <div className="space-y-3">
      <Card className="bg-white rounded-xl p-4 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Icon className="text-fi-gold h-5 w-5 mr-3" />
              <div>
                <p>{investment.product_title}</p>
                <p className="text-sm text-neutral-600">Fi Investments</p>
              </div>
            </div>
            <div className="flex items-center">
              <p className={totalPerformance >= 0 ? "text-green-600" : "text-red-600"}>
                {totalPerformance >= 0 ? "+" : ""}{totalPerformance.toFixed(1)}%
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="ml-2 text-neutral-500 hover:text-neutral-700">
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Rendite-Aufschlüsselung</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Fixzins:</span>
                      <span className="font-medium text-fi-blue">
                        {investment.fixed_interest_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Gewinnbeteiligung:</span>
                      <span className="font-medium text-fi-gold">
                        {investment.profit_share_rate.toFixed(1)}%
                      </span>
                    </div>
                    <hr className="my-1" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Gesamtrendite:</span>
                      <span className={`font-medium ${totalPerformance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {totalPerformance.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      Die Gesamtrendite setzt sich aus dem garantierten Fixzins und der
                      variablen Gewinnbeteiligung zusammen.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-neutral-600">{investment.shares} Anteil{investment.shares !== 1 ? 'e' : ''}</p>
            <p>€{investment.amount.toLocaleString('de-DE')}</p>
          </div>

          {showPerformanceBreakdown && (
            <div className="mt-2 pt-2 border-t border-neutral-100">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Split className="h-3 w-3 mr-1 text-fi-blue" />
                  <span className="text-xs text-neutral-600">Fixzins:</span>
                </div>
                <span className="text-xs font-medium">{investment.fixed_interest_rate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Split className="h-3 w-3 mr-1 text-fi-gold" />
                  <span className="text-xs text-neutral-600">Gewinnbeteiligung:</span>
                </div>
                <span className="text-xs font-medium">{investment.profit_share_rate.toFixed(1)}%</span>
              </div>
            </div>
          )}

          <button 
            className="text-xs text-neutral-500 mt-2 hover:text-neutral-700 w-full text-center"
            onClick={() => setShowPerformanceBreakdown(!showPerformanceBreakdown)}
          >
            {showPerformanceBreakdown ? 'Details ausblenden' : 'Rendite-Details anzeigen'}
          </button>
        </CardContent>
      </Card>
      
      <Card className="bg-white rounded-xl p-4 shadow-sm">
        <CardContent className="p-0">
          <div className="h-32 rounded-lg">
            <ChartContainer config={{}} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id={`color${investment.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B1904B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#B1904B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10 }}
                    domain={['dataMin - 5', 'dataMax + 5']}
                    hide
                  />
                  <Tooltip 
                    formatter={(value: number) => [`€${(investment.amount * value / 100).toFixed(2)}`, 'Wert']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#B1904B" 
                    fillOpacity={1}
                    fill={`url(#color${investment.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
