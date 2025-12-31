/**
 * RijPlanner - Rijschool Management Software
 * © 2026 Robert Rocha / ROBERTDEV.NL
 * AI Progress Chart Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';
import { AIInsights } from '@/types';
import { cn } from '@/lib/utils';

interface AIProgressChartProps {
  insights: AIInsights | null;
  className?: string;
}

const chartConfig = {
  score: {
    label: 'Voortgang',
    color: 'hsl(var(--primary))',
  },
};

export function AIProgressChart({ insights, className }: AIProgressChartProps) {
  if (!insights) {
    return null;
  }

  const score = insights.overall_score;
  
  const getScoreColor = () => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--primary))';
    if (score >= 40) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Uitstekend';
    if (score >= 60) return 'Goed';
    if (score >= 40) return 'Gemiddeld';
    return 'Verbetering nodig';
  };

  const data = [
    {
      name: 'Voortgang',
      value: score,
      fill: getScoreColor(),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Voortgang Score
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <RadialBarChart
              innerRadius="60%"
              outerRadius="90%"
              data={data}
              startAngle={180}
              endAngle={0}
              cx="50%"
              cy="80%"
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: 'hsl(var(--muted))' }}
                dataKey="value"
                cornerRadius={10}
                fill={getScoreColor()}
              />
              <text
                x="50%"
                y="70%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground"
              >
                <tspan
                  x="50%"
                  dy="-0.5em"
                  className="text-4xl font-bold"
                  fill={getScoreColor()}
                >
                  {score}
                </tspan>
                <tspan
                  x="50%"
                  dy="1.5em"
                  className="text-sm fill-muted-foreground"
                >
                  {getScoreLabel()}
                </tspan>
              </text>
            </RadialBarChart>
          </ChartContainer>

          {/* Progress milestones */}
          <div className="flex justify-between mt-4 px-4">
            <div className="text-center">
              <div className={cn(
                "w-3 h-3 rounded-full mx-auto mb-1",
                score >= 0 ? "bg-destructive" : "bg-muted"
              )} />
              <span className="text-xs text-muted-foreground">0</span>
            </div>
            <div className="text-center">
              <div className={cn(
                "w-3 h-3 rounded-full mx-auto mb-1",
                score >= 40 ? "bg-warning" : "bg-muted"
              )} />
              <span className="text-xs text-muted-foreground">40</span>
            </div>
            <div className="text-center">
              <div className={cn(
                "w-3 h-3 rounded-full mx-auto mb-1",
                score >= 60 ? "bg-primary" : "bg-muted"
              )} />
              <span className="text-xs text-muted-foreground">60</span>
            </div>
            <div className="text-center">
              <div className={cn(
                "w-3 h-3 rounded-full mx-auto mb-1",
                score >= 80 ? "bg-success" : "bg-muted"
              )} />
              <span className="text-xs text-muted-foreground">80</span>
            </div>
            <div className="text-center">
              <div className={cn(
                "w-3 h-3 rounded-full mx-auto mb-1",
                score === 100 ? "bg-success" : "bg-muted"
              )} />
              <span className="text-xs text-muted-foreground">100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
