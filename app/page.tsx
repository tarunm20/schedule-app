import WeeklyCalendar from "@/components/weekly-calendar";

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Scheduled Suites</h1>
      <WeeklyCalendar />
    </div>
  );
}
