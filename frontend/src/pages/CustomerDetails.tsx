import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCustomer, useUpdateCustomer, useCustomerNotes, 
  useAddCustomerNote, useCompanies, useLeads, useMeetings
} from "../hooks/useCRM";
import { 
  ArrowLeft, Building, Mail, Phone, Briefcase, 
  Tag, MessageSquare, Calendar, FolderHeart, Plus, 
  X, RefreshCw, AlertCircle, Edit, UserCheck
} from "lucide-react";

const editCustomerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().optional(),
  company_id: z.coerce.number().optional().nullable(),
  job_title: z.string().optional(),
  status: z.string().default("Active"),
});

type EditCustomerForm = z.infer<typeof editCustomerSchema>;

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customerId = parseInt(id || "");
  
  const [activeTab, setActiveTab] = useState<"notes" | "leads" | "meetings">("notes");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  const { data: customer, isLoading, refetch } = useCustomer(customerId);
  const { data: notes = [], isLoading: notesLoading } = useCustomerNotes(customerId);
  const { data: companiesData } = useCompanies("", 1, 100);
  
  const { data: allLeads = [] } = useLeads();
  const customerLeads = allLeads.filter(l => l.customer_id === customerId);

  const { data: allMeetings = [] } = useMeetings();
  const customerMeetings = allMeetings.filter(m => m.customer_id === customerId);

  const updateMut = useUpdateCustomer();
  const addNoteMut = useAddCustomerNote();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCustomerForm>({
    resolver: zodResolver(editCustomerSchema),
  });

  const handleEditClick = () => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
        company_id: customer.company_id || null,
        job_title: customer.job_title || "",
        status: customer.status,
      });
      setEditModalOpen(true);
    }
  };

  const onSubmit = async (data: EditCustomerForm) => {
    try {
      const payload = {
        ...data,
        id: customerId,
        email: data.email === "" ? undefined : data.email,
        company_id: data.company_id || undefined
      };
      await updateMut.mutateAsync(payload);
      setEditModalOpen(false);
      refetch();
    } catch (err) {}
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    await addNoteMut.mutateAsync({ customerId, content: newNoteContent });
    setNewNoteContent("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-slate-200 dark:bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-zinc-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200">Customer not found</h2>
        <Link to="/dashboard/customers" className="text-blue-600 hover:underline mt-2 inline-block text-xs font-semibold">
          Back to listing
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button 
        onClick={() => navigate("/dashboard/customers")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </button>

      {/* Profile Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-black text-xl border border-blue-200 dark:border-blue-800/30">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{customer.name}</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
              {customer.job_title || "No job title"} at {customer.company?.name || "Unassigned Company"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold self-center border ${
            customer.status === "Active" 
              ? "bg-green-50 text-green-700 border-green-200/50 dark:bg-green-950/20 dark:text-green-400" 
              : "bg-slate-100 text-slate-600 border-slate-200/50"
          }`}>
            {customer.status}
          </span>
          <button
            onClick={handleEditClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white transition-all shadow-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft space-y-6 self-start">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-slate-400">Contact Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <Mail className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">Email</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 truncate block">{customer.email || "—"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <Phone className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">Phone</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 block">{customer.phone || "—"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <Briefcase className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">Job Title</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 block">{customer.job_title || "—"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <Building className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">Company Name</span>
                {customer.company_id ? (
                  <Link 
                    to={`/dashboard/companies/${customer.company_id}`}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline block"
                  >
                    {customer.company?.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-500 block">Unassigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Activity / CRM History */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-soft overflow-hidden flex flex-col">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50">
            {[
              { id: "notes", name: "Notes & Timeline", icon: MessageSquare },
              { id: "leads", name: "Associated Deals", icon: FolderHeart },
              { id: "meetings", name: "Meetings Scheduled", icon: Calendar },
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    isSelected 
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900" 
                      : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab contents */}
          <div className="p-6 flex-1">
            {/* 1. NOTES TAB */}
            {activeTab === "notes" && (
              <div className="space-y-6">
                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    placeholder="Log a client interaction or write notes..."
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addNoteMut.isPending || !newNoteContent.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 font-bold text-xs flex items-center gap-1.5"
                    >
                      {addNoteMut.isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      Add Note
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-4">
                  {notesLoading ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
                      <div className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 dark:text-zinc-500">
                      No notes logged for this customer.
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="p-4 border border-slate-100 dark:border-zinc-800 rounded-2xl bg-slate-50/30">
                        <div className="flex justify-between items-baseline gap-2 mb-2">
                          <span className="text-[10px] font-bold text-slate-800 dark:text-zinc-200">
                            Logged by {note.user?.name || "Sales Executive"}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 2. LEADS TAB */}
            {activeTab === "leads" && (
              <div className="space-y-4">
                {customerLeads.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 dark:text-zinc-500 flex flex-col items-center gap-2">
                    <FolderHeart className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
                    <span>No leads associated with this customer contact.</span>
                    <Link to="/dashboard/leads" className="mt-2 text-blue-600 hover:underline font-bold text-xs">
                      Open pipeline
                    </Link>
                  </div>
                ) : (
                  customerLeads.map((lead) => (
                    <Link 
                      key={lead.id}
                      to="/dashboard/leads"
                      className="block p-4 border border-slate-100 dark:border-zinc-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all group"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {lead.name}
                        </h4>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(lead.value)}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center mt-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          lead.priority === "High" ? "bg-red-50 text-red-700" :
                          lead.priority === "Medium" ? "bg-yellow-50 text-yellow-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {lead.priority} Priority
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Stage: {lead.status}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* 3. MEETINGS TAB */}
            {activeTab === "meetings" && (
              <div className="space-y-4">
                {customerMeetings.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400 dark:text-zinc-500 flex flex-col items-center gap-2">
                    <Calendar className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
                    <span>No meetings scheduled.</span>
                  </div>
                ) : (
                  customerMeetings.map((meet) => (
                    <div key={meet.id} className="p-4 border border-slate-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{meet.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{meet.description || "No description"}</p>
                        <span className="text-[9px] text-slate-400 mt-1.5 block font-semibold">Assigned Rep: {meet.assigned_user?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                          {new Date(meet.time).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(meet.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Customer Profile</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Contact Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email Address</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.email && <span className="text-[10px] text-red-500 font-semibold">{errors.email.message}</span>}
              </div>

              {/* Phone & Job Title */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Phone</label>
                  <input
                    type="text"
                    {...register("phone")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Job Title</label>
                  <input
                    type="text"
                    {...register("job_title")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Company & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Assign Company</label>
                  <select
                    {...register("company_id")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="">No Company</option>
                    {companiesData?.items.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Status</label>
                  <select
                    {...register("status")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMut.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {updateMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
