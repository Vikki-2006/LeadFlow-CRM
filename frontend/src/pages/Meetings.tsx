import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useMeetings, useCreateMeeting, useDeleteMeeting, useCustomers, useUsers 
} from "../hooks/useCRM";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Calendar, Clock, Video, User, 
  Trash2, X, RefreshCw, AlertCircle 
} from "lucide-react";

const meetingSchema = z.object({
  title: z.string().min(2, "Meeting subject is required"),
  description: z.string().optional(),
  time: z.string().min(1, "Date and time are required"),
  customer_id: z.coerce.number().min(1, "Customer contact is required"),
  assigned_user_id: z.coerce.number().min(1, "Assigned user is required"),
  notes: z.string().optional(),
});

type MeetingFormType = z.infer<typeof meetingSchema>;

export const Meetings: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: meetings = [], isLoading, refetch } = useMeetings();
  const { data: customersData } = useCustomers("", "Active", undefined, 1, 100);
  const { data: employees = [] } = useUsers();

  const createMut = useCreateMeeting();
  const deleteMut = useDeleteMeeting();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeetingFormType>({
    resolver: zodResolver(meetingSchema),
  });

  const onSubmit = async (data: MeetingFormType) => {
    try {
      const payload = {
        ...data,
        time: new Date(data.time).toISOString()
      };
      await createMut.mutateAsync(payload);
      setCreateModalOpen(false);
      reset();
    } catch (err) {}
  };

  const handleCancelMeeting = async (id: number) => {
    if (confirm("Are you sure you want to cancel this meeting? This will notify participants.")) {
      await deleteMut.mutateAsync(id);
    }
  };

  // Group meetings into: Upcoming vs Past
  const now = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.time) >= now).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const pastMeetings = meetings.filter(m => new Date(m.time) < now).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Meetings</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Schedule syncs, kickoff calls, and quarterly audits.</p>
        </div>
        <button
          onClick={() => {
            reset({
              assigned_user_id: currentUser?.id,
            });
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Upcoming Meetings */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Upcoming Calendar ({upcomingMeetings.length})</h2>
          
          {isLoading ? (
            <div className="h-32 bg-slate-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ) : upcomingMeetings.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-12 text-center text-xs text-slate-400 dark:text-zinc-500 rounded-2xl flex flex-col items-center justify-center gap-2">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
              <span>No upcoming meetings scheduled.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meet) => {
                const date = new Date(meet.time);
                return (
                  <div 
                    key={meet.id} 
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-100 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl flex flex-col items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/30">
                        <span className="text-[10px] font-bold uppercase leading-none">{date.toLocaleDateString("en-US", { month: "short" })}</span>
                        <span className="text-base font-black leading-none mt-1">{date.getDate()}</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-650 transition-colors">
                          {meet.title}
                        </h4>
                        {meet.description && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                            {meet.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-semibold pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            With {meet.customer?.name || "Client"}
                          </span>
                          <span className="text-slate-500">
                            Assigned Rep: {meet.assigned_user?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancelMeeting(meet.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 dark:border-red-900/40 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] font-bold transition-all shrink-0 self-start sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Past Meetings History */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Past Interactions ({pastMeetings.length})</h2>
          
          {isLoading ? (
            <div className="h-44 bg-slate-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ) : pastMeetings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              No historical records.
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-soft divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
              {pastMeetings.map((meet) => {
                const date = new Date(meet.time);
                return (
                  <div key={meet.id} className="p-4 space-y-1 hover:bg-slate-50/20">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-300 leading-tight">{meet.title}</h4>
                    <p className="text-[10px] text-slate-400">With {meet.customer?.name} on {date.toLocaleDateString()}</p>
                    {meet.notes && (
                      <div className="mt-2 text-[10px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-slate-100/50 leading-relaxed italic">
                        "{meet.notes}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Schedule Meeting */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Meeting</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Meeting Subject / Title</label>
                <input
                  type="text"
                  placeholder="Contract review sync"
                  {...register("title")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.title && <span className="text-[10px] text-red-500 font-semibold">{errors.title.message}</span>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Agenda / Description</label>
                <textarea
                  placeholder="Sync on delivery terms and pricing sheets..."
                  rows={2}
                  {...register("description")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
              </div>

              {/* Date/Time and Customer mapping */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Date & Time</label>
                  <input
                    type="datetime-local"
                    {...register("time")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none text-slate-900 dark:text-zinc-100 cursor-pointer"
                  />
                  {errors.time && <span className="text-[10px] text-red-500 font-semibold">{errors.time.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Link Customer Contact</label>
                  <select
                    {...register("customer_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="">Choose contact...</option>
                    {customersData?.items?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.customer_id && <span className="text-[10px] text-red-500 font-semibold">{errors.customer_id.message}</span>}
                </div>
              </div>

              {/* Employee Assign & Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Host (Employee)</label>
                  <select
                    {...register("assigned_user_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold cursor-pointer"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Additional Notes</label>
                  <input
                    type="text"
                    placeholder="Prepare slides beforehand"
                    {...register("notes")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {createMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Book Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
