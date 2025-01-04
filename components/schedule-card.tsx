"use client";

import React from "react";
import { Clock, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScheduleCardProps {
  title: string;
  time: string;
  repeatDays?: string[];
  date?: string;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ title, time, repeatDays, date }) => {
  return (
    <Card className="border border-blue-500 bg-blue-50 text-blue-600 rounded-md">
      <CardHeader className="p-1">
        <CardTitle className="text-xs font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-xs p-1">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{time}</span>
        </div>
        {date && (
          <div className="flex items-center gap-1">
            <CalendarDays size={12} />
            <span>{date}</span>
          </div>
        )}
        {repeatDays && repeatDays.length > 0 && (
          <div className="flex items-center gap-1">
            <span>Repeats:</span>
            <span>{repeatDays.join(", ")}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ScheduleCard };
