'use client';

import React, { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

import { ScheduleCard } from "@/components/schedule-card";
import { createClient } from "@supabase/supabase-js";

// Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchSchedules = async () => {
  const { data, error } = await supabase
    .from("schedules")
    .select("test_suite_name, start_date_time, repeat_days");

  if (error) {
    console.error("Error fetching schedules:", error);
    return [];
  }

  return data.map((item: any) => {
    try {
      const date = new Date(item.start_date_time);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const pstFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "2-digit",
        minute: "2-digit",
      });

      const pstTime = pstFormatter.format(date);

      // Return formatted schedule
      return {
        title: item.test_suite_name,
        time: pstTime,
        date: formattedDate,
        repeatDays: item.repeat_days || [],
      };
    } catch (err) {
      console.error("Error parsing schedule:", err);
      return {
        title: item.test_suite_name,
        time: "Invalid Time",
        date: "Invalid Date",
        repeatDays: [],
      };
    }
  });
};

export function AppSidebar() {
  const [schedules, setSchedules] = useState<
    { title: string; time: string; date: string; repeatDays: string[] }[]
  >([]);

  useEffect(() => {
    const loadSchedules = async () => {
      const fetchedSchedules = await fetchSchedules();
      setSchedules(fetchedSchedules);
    };
    loadSchedules();
  }, []);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Schedules</SidebarGroupLabel>
          <SidebarGroupContent>
            {schedules.map((schedule, index) => (
              <ScheduleCard
                key={index}
                title={schedule.title}
                time={schedule.time}
                date={schedule.date}
                repeatDays={schedule.repeatDays}
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
