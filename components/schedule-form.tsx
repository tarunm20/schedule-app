'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const ScheduleForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testSuite, setTestSuite] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false); // State to handle saving process

  const handleDaySelect = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    setIsSaving(true); // Start saving state

    try {
      // Insert data into Supabase
      const { error } = await supabase.from("schedules").insert([
        {
          test_suite_name: testSuite,
          start_date_time: dateTime,
          repeat_days: days, // Store days as JSON array
        },
      ]);

      if (error) {
        console.error("Error inserting schedule:", error);
        alert("Failed to save schedule.");
      } else {
        alert("Schedule saved successfully!");
        setIsOpen(false); // Close the dialog after saving
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false); // End saving state
    }
  };

  return (
    <div>

      <Button onClick={() => setIsOpen(true)} variant="default" className="flex items-center gap-2 bg-[#0435DD] font-bold">
        <Plus size={16} />
        Schedule Test
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Detail</DialogTitle>
          </DialogHeader>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Test Suite</label>
            <Input
              value={testSuite}
              onChange={(e) => setTestSuite(e.target.value)}
              placeholder="Enter Test Suite"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Start Date and Time</label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Run Weekly on Every</label>
            <div className="flex space-x-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Button
                  key={day}
                  variant={days.includes(day) ? "default" : "outline"}
                  onClick={() => handleDaySelect(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-lg border-red-500 text-red-500 font-bold"
              disabled={isSaving} // Disable button while saving
            >
              <XCircle size={16} className="mr-2" /> Cancel Schedule
            </Button>
            <Button
              onClick={handleSave}
              className="w-full rounded-lg bg-[#0435DD] font-bold"
              disabled={isSaving} // Disable button while saving
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
