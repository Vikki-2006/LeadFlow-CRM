import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useLeads, useCreateLead, useUpdateLead, useDeleteLead, 
  useCustomers, useCompanies, useUsers, useLeadNotes, useAddLeadNote 
} from "../hooks/useCRM";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, DollarSign, Calendar, AlertCircle, X, 
  RefreshCw, MoreHorizontal, ArrowRight, Clipboard, Trash2,
  MessageSquare
} from "lucide-react";

const leadSchema = z.object({
  name: z.string().min(2, "Opportunity name is required"),
  value: z.coerce.number().min(0, "Value must be positive"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  status: z.enum(["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"]).default("New"),
  expected_closing_date: z.string().optional(),
  customer_id: z.coerce.number().optional().nullable(),
  company_id: z.coerce.number().optional().nullable(),
  assigned_employee_id: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
});

type LeadForm = z.infer<typeof leadSchema>;

const PIPELINE_STAGES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"] as const;

export const Leads: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  const { data: leads = [], refetch } = useLeads();
  const { data: customersData } = useCustomers("", "Active", undefined, 1, 100);
  const { data: companiesData } = useCompanies("", 1, 100);
  const { data: employees = [] } = useUsers(); // Admin gets list of users

  const createMut = useCreateLead();
  const updateMut = useUpdateLead();
  const deleteMut = useDeleteLead();
  
  // Fetch notes for selected lead
  const { data: leadNotes = [], refetch: refetchNotes } = useLeadNotes(selectedLeadId || undefined);
  const addNoteMut = useAddLeadNote();

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadForm) => {
    try {
      const payload = {
        ...data,
        expected_closing_date: data.expected_closing_date ? new Date(data.expected_closing_date).toISOString() : undefined,
        customer_id: data.customer_id || undefined,
        company_id: data.company_id || undefined,
        assigned_employee_id: data.assigned_employee_id || undefined
      };
      await createMut.mutateAsync(payload);
      setCreateModalOpen(false);
      reset();
    } catch (err) {}
  };

  const handleStageMove = async (leadId: number, nextStage: string) => {
    await updateMut.mutateAsync({ id: leadId, status: nextStage as any });
  };

  const handleDelete = async (leadId: number) => {
    if (confirm("Are you sure you want to delete this sales lead? This cannot be undone.")) {
      await deleteMut.mutateAsync(leadId);
      setDetailModalOpen(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !selectedLeadId) return;
    await addNoteMut.mutateAsync({ leadId: selectedLeadId, content: newNoteContent });
    setNewNoteContent("");
    refetchNotes();
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Lead Pipeline</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Track and progress business opportunities.</p>
        </div>
        <button
          onClick={() => { reset(); setCreateModalOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {/* Board Layout */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter(l => l.status === stage);
          const stageValueSum = stageLeads.reduce((acc, curr) => acc + curr.value, 0);
          
          return (
            <div 
              key={stage} 
              className="w-72 bg-slate-100/70 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-zinc-800 shrink-0 flex flex-col max-h-[75vh]"
            >
              {/* Stage Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">{stage}</span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 text-[10px] text-slate-500 flex items-center justify-center font-bold">
                    {stageLeads.length}
                  </span>
                </div>
                <span className="text-[10px] font-black text-slate-500">{formatMoney(stageValueSum)}</span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 -mr-2">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => { setSelectedLeadId(lead.id); setDetailModalOpen(true); }}
                    className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-4 rounded-xl shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-900/55 transition-all cursor-pointer space-y-3 relative group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                        {lead.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        {lead.customer?.name || "No contact"}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <span className="text-[11px] font-black text-slate-900 dark:text-white">{formatMoney(lead.value)}</span>
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full ${
                        lead.priority === "High" ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400" :
                        lead.priority === "Medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {lead.priority}
                      </span>
                    </div>

                    {/* Quick Move Selector (to bypass drag and drop complexity on touch screens) */}
                    <div onClick={e => e.stopPropagation()} className="pt-2 flex justify-between items-center">
                      <span className="text-[9px] text-slate-400 font-semibold">Move:</span>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStageMove(lead.id, e.target.value)}
                        className="text-[9px] bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-slate-700 dark:text-zinc-300 focus:outline-none"
                      >
                        {PIPELINE_STAGES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-slate-200/60 dark:border-zinc-800/80 rounded-xl text-center text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    No leads in stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal - Create Lead */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Deal Opportunity</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Deal Opportunity Name</label>
                <input
                  type="text"
                  placeholder="Enterprise License Upgrade"
                  {...register("name")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
              </div>

              {/* Value & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Estimated Value ($)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    {...register("value")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  {errors.value && <span className="text-[10px] text-red-500 font-semibold">{errors.value.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Priority</label>
                  <select
                    {...register("priority")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Customer & Company mapping */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Link Customer Contact</label>
                  <select
                    {...register("customer_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="">Choose contact...</option>
                    {customersData?.items?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Link Company Account</label>
                  <select
                    {...register("company_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="">Choose company...</option>
                    {companiesData?.items?.map((co: any) => (
                      <option key={co.id} value={co.id}>{co.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Close Date & Employee Assign */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Expected Closing Date</label>
                  <input
                    type="date"
                    {...register("expected_closing_date")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Assign Rep</label>
                  <select
                    {...register("assigned_employee_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
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
                  {createMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Lead Detail View & Log Notes */}
      {detailModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{selectedLead.name}</h3>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                  Link: {selectedLead.customer?.name} / {selectedLead.company?.name || "No Company"}
                </span>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-850">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Opportunity Value</span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 block">{formatMoney(selectedLead.value)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Closing Date</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 mt-0.5 block">
                  {selectedLead.expected_closing_date ? new Date(selectedLead.expected_closing_date).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-[10px] text-slate-400 block font-medium">Assigned Rep</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 block">
                  {selectedLead.assigned_employee?.name || "Unassigned"}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-[10px] text-slate-400 block font-medium">Current Status</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStageMove(selectedLead.id, e.target.value)}
                  className="mt-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-2 py-0.5 font-bold"
                >
                  {PIPELINE_STAGES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes Section for Lead */}
            <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <MessageSquare className="w-4.5 h-4.5 text-slate-400" />
                Interactions and Notes ({leadNotes.length})
              </h4>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2 shrink-0">
                <textarea
                  placeholder="Type an update regarding this opportunity..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  rows={2}
                />
                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={!newNoteContent.trim() || addNoteMut.isPending}
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-slate-800 rounded-lg text-xs font-bold"
                  >
                    Post Note
                  </button>
                </div>
              </form>

              {/* Notes Stream */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {leadNotes.length === 0 ? (
                  <p className="text-center text-[10px] text-slate-400 py-6">No updates logged.</p>
                ) : (
                  leadNotes.map(n => (
                    <div key={n.id} className="p-3 border border-slate-100 dark:border-zinc-800 bg-slate-50/20 rounded-xl leading-normal">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[9px] font-bold text-slate-800 dark:text-zinc-200">{n.user?.name}</span>
                        <span className="text-[8px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Admin Delete and close */}
            <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 flex justify-between items-center">
              {currentUser?.role === "Admin" ? (
                <button
                  onClick={() => handleDelete(selectedLead.id)}
                  className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  Delete Opportunity
                </button>
              ) : <div />}
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
