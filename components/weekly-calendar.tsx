'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleCard } from '@/components/schedule-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addDays, startOfWeek, endOfWeek, format, isWithinInterval, isSameDay, isAfter } from 'date-fns';
import { ScheduleForm } from '@/components/schedule-form';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Schedule {
  title: string;
  start_time: Date;
  repeat_days: string[];
}

const fetchSchedules = async (): Promise<Schedule[]> => {
  const { data, error } = await supabase
    .from('schedules')
    .select('test_suite_name, start_date_time, repeat_days');

  if (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }

  return data.map((item: any) => {
    try {
      const date = new Date(item.start_date_time);
      const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      return {
        title: item.test_suite_name,
        start_time: pstDate,
        repeat_days: item.repeat_days || [],
      };
    } catch (err) {
      console.error('Error parsing schedule:', err);
      return {
        title: item.test_suite_name,
        start_time: new Date('Invalid Time'),
        repeat_days: [],
      };
    }
  });
};

const WeeklyCalendar = () => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i % 12 || 12}:00 ${i < 12 ? 'AM' : 'PM'}`);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const loadSchedules = async () => {
      const fetchedSchedules = await fetchSchedules();
      setSchedules(fetchedSchedules);
    };
    loadSchedules();
  }, []);

  const startOfCurrentWeek = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const endOfCurrentWeek = endOfWeek(currentWeek, { weekStartsOn: 0 });

  const changeWeek = (direction: number) => {
    setCurrentWeek(addDays(currentWeek, direction * 7));
  };

  const getSchedulesForSlot = (dayIndex: number, hour: number) => {
    return schedules.filter((schedule) => {
      const pstDate = new Date(schedule.start_time);
      const currentDate = addDays(startOfCurrentWeek, dayIndex);

      const isSameDayOrAfter = isSameDay(pstDate, currentDate) || isAfter(currentDate, pstDate);
      const isRepeatDay = schedule.repeat_days.includes(daysOfWeek[dayIndex]);
      const isCorrectTime = pstDate.getHours() === hour;

      return (
        (isSameDay(pstDate, currentDate) || (isSameDayOrAfter && isRepeatDay)) &&
        isCorrectTime
      );
    });
  };

  const handleOpenDialog = (slotSchedules: Schedule[]) => {
    setSelectedSchedules(slotSchedules);
    setIsDialogOpen(true);
  };

  return (
    <Tabs defaultValue="calendar" className="w-full h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <ScheduleForm />
          <div className="flex items-center border rounded-md px-3 py-1 gap-2">
            <button onClick={() => changeWeek(-1)}>
              <ChevronLeft size={16} />
            </button>
            <span className="text-lg font-semibold">
              Week of {format(startOfCurrentWeek, 'MM/dd/yy')}
            </span>
            <button onClick={() => changeWeek(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <TabsList className="flex gap-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List size={16} />
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar size={16} />
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="calendar">
        <div className="border rounded-lg shadow-sm overflow-x-auto min-w-[1200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Time</TableHead>
                {daysOfWeek.map((day, index) => (
                  <TableHead key={index} className="text-center">
                    <span className="font-semibold text-lg mr-1">
                      {format(addDays(startOfCurrentWeek, index), 'd')}
                    </span>{' '}
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hours.map((hour, hourIndex) => (
                <TableRow key={hourIndex}>
                  <TableCell className="text-sm text-gray-500 text-center">{hour}</TableCell>
                  {daysOfWeek.map((_, dayIndex) => {
                    const slotSchedules = getSchedulesForSlot(dayIndex, hourIndex);
                    return (
                      <TableCell key={dayIndex} className="h-16 relative border p-1">
                        {slotSchedules.length > 1 ? (
                          <Button onClick={() => handleOpenDialog(slotSchedules)} className="text-xs">
                            {slotSchedules.length} Schedules
                          </Button>
                        ) : slotSchedules.length === 1 ? (
                          <ScheduleCard title={slotSchedules[0].title} time={slotSchedules[0].start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                        ) : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedules</DialogTitle>
          </DialogHeader>
          {selectedSchedules.map((schedule, index) => (
            <ScheduleCard key={index} title={schedule.title} time={schedule.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          ))}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default WeeklyCalendar;
