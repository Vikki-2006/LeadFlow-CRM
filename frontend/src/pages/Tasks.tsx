import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useTasks, useCreateTask, useUpdateTask, useDeleteTask, 
  useCustomers, useUsers, useLeads 
} from "../hooks/useCRM";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, CheckSquare, Square, Calendar, AlertTriangle, 
  Trash2, X, RefreshCw, ClipboardCheck, ArrowRight 
} from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(2, "Task title is required"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  assigned_user_id: z.coerce.number().min(1, "Assigned user is required"),
  customer_id: z.coerce.number().optional().nullable(),
  lead_id: z.coerce.number().optional().nullable(),
});

type TaskFormType = z.infer<typeof taskSchema>;

export const Tasks: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const [filterCompleted, setFilterCompleted] = useState<boolean | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: tasks = [], isLoading, refetch } = useTasks(filterCompleted);
  const { data: customersData } = useCustomers("", "Active", undefined, 1, 100);
  const { data: leads = [] } = useLeads();
  const { data: employees = [] } = useUsers();

  const createMut = useCreateTask();
  const updateMut = useUpdateTask();
  const deleteMut = useDeleteTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormType>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (data: TaskFormType) => {
    try {
      const payload = {
        ...data,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
        customer_id: data.customer_id || undefined,
        lead_id: data.lead_id || undefined,
      };
      await createMut.mutateAsync(payload as any);
      setCreateModalOpen(false);
      reset();
    } catch (err) {}
  };

  const handleToggleCompleted = async (task: any) => {
    await updateMut.mutateAsync({
      id: task.id,
      is_completed: !task.is_completed
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this task?")) {
      await deleteMut.mutateAsync(id);
    }
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date() && !filterCompleted;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tasks</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Organize and monitor client interactions.</p>
        </div>
        <button
          onClick={() => {
            reset({
              assigned_user_id: currentUser?.id,
              priority: "Medium",
            });
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1.5 rounded-2xl shadow-soft flex gap-1 self-start w-fit">
        {[
          { id: undefined, name: "All Tasks" },
          { id: false, name: "Pending" },
          { id: true, name: "Completed" },
        ].map((tab, i) => {
          const isSelected = filterCompleted === tab.id;
          return (
            <button
              key={i}
              onClick={() => setFilterCompleted(tab.id as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected 
                  ? "bg-slate-900 dark:bg-zinc-800 text-white" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-soft divide-y divide-slate-100 dark:divide-zinc-800">
        {isLoading ? (
          [1, 2].map(i => (
            <div key={i} className="p-4 flex gap-3 animate-pulse">
              <div className="w-5 h-5 rounded bg-slate-100 dark:bg-zinc-800" />
              <div className="flex-1 space-y-2 mt-0.5">
                <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-1/3" />
                <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:text-zinc-500 flex flex-col items-center justify-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
            <span>No tasks found in this category.</span>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`p-4 flex items-start gap-4 transition-all hover:bg-slate-50/40 dark:hover:bg-zinc-800/10 ${task.is_completed ? "opacity-60" : ""}`}
            >
              <button 
                onClick={() => handleToggleCompleted(task)}
                className="text-slate-400 hover:text-blue-600 transition-colors shrink-0 mt-0.5"
              >
                {task.is_completed ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className={`text-xs font-bold text-slate-900 dark:text-white ${task.is_completed ? "line-through text-slate-400 dark:text-zinc-500" : ""}`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                    {task.description}
                  </p>
                )}

                {/* Badges footer */}
                <div className="flex flex-wrap gap-2.5 items-center pt-1.5 text-[10px]">
                  <span className={`font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-[8px] ${
                    task.priority === "High" ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400" :
                    task.priority === "Medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" :
                    "bg-slate-50 text-slate-600 border border-slate-200/50"
                  }`}>
                    {task.priority} Priority
                  </span>
                  
                  {task.due_date && (
                    <span className={`inline-flex items-center gap-1 font-bold ${
                      isOverdue(task.due_date) ? "text-red-600" : "text-slate-400 dark:text-zinc-500"
                    }`}>
                      <Calendar className="w-3.5 h-3.5" />
                      Due {new Date(task.due_date).toLocaleDateString()}
                      {isOverdue(task.due_date) && <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />}
                    </span>
                  )}

                  {task.customer && (
                    <span className="text-slate-400 dark:text-zinc-500 font-semibold">
                      Client: <span className="text-slate-600 dark:text-zinc-300">{task.customer.name}</span>
                    </span>
                  )}

                  {task.assigned_user && (
                    <span className="text-slate-400 dark:text-zinc-500 font-semibold">
                      Assigned to: <span className="text-slate-600 dark:text-zinc-300">{task.assigned_user.name}</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(task.id)}
                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 shrink-0 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 md:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal - Create Task */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Task</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Task Title</label>
                <input
                  type="text"
                  placeholder="Send pricing document breakdown"
                  {...register("title")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.title && <span className="text-[10px] text-red-500 font-semibold">{errors.title.message}</span>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Task Description</label>
                <textarea
                  placeholder="List out details or points to address..."
                  rows={2}
                  {...register("description")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
              </div>

              {/* Due Date & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Due Date</label>
                  <input
                    type="date"
                    {...register("due_date")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Priority</label>
                  <select
                    {...register("priority")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Customer Link & Employee Assign */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Link Customer Contact</label>
                  <select
                    {...register("customer_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold"
                  >
                    <option value="">Choose contact...</option>
                    {customersData?.items?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Assign Employee</label>
                  <select
                    {...register("assigned_user_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold cursor-pointer"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lead Link */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Link Deal Opportunity (Optional)</label>
                <select
                  {...register("lead_id")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold"
                >
                  <option value="">Choose opportunity...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
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
                  {createMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
