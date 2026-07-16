import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCompany, useUpdateCompany, useCustomers, useUpdateCustomer 
} from "../hooks/useCRM";
import { 
  ArrowLeft, Globe, Phone, MapPin, Building2, 
  Users, Edit, Plus, X, RefreshCw, Eye
} from "lucide-react";

const editCompanySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  industry: z.string().optional(),
  website: z.string().url("Invalid URL").or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type EditCompanyForm = z.infer<typeof editCompanySchema>;

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const companyId = parseInt(id || "");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const { data: company, isLoading, refetch } = useCompany(companyId);
  const { data: companyCustomers, isLoading: contactsLoading, refetch: refetchContacts } = useCustomers("", "", companyId, 1, 100);
  const { data: allCustomers } = useCustomers("", "Active", undefined, 1, 100);
  
  const updateCompanyMut = useUpdateCompany();
  const updateCustomerMut = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCompanyForm>({
    resolver: zodResolver(editCompanySchema),
  });

  const handleEditClick = () => {
    if (company) {
      reset({
        name: company.name,
        industry: company.industry || "",
        website: company.website || "",
        phone: company.phone || "",
        address: company.address || "",
      });
      setEditModalOpen(true);
    }
  };

  const onEditSubmit = async (data: EditCompanyForm) => {
    try {
      await updateCompanyMut.mutateAsync({
        ...data,
        id: companyId,
        website: data.website === "" ? undefined : data.website
      });
      setEditModalOpen(false);
      refetch();
    } catch (err) {}
  };

  const handleAssignCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    try {
      await updateCustomerMut.mutateAsync({
        id: parseInt(selectedCustomerId),
        company_id: companyId
      });
      setSelectedCustomerId("");
      setAssignModalOpen(false);
      refetchContacts();
    } catch (err) {}
  };

  // Filter customers not already at this company
  const assignableCustomers = allCustomers?.items.filter(
    c => c.company_id !== companyId
  ) || [];

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

  if (!company) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200">Company not found</h2>
        <Link to="/dashboard/companies" className="text-blue-600 hover:underline mt-2 inline-block text-xs font-semibold">
          Back to listing
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button 
        onClick={() => navigate("/dashboard/companies")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 font-black text-xl border border-purple-100 dark:border-purple-800/30">
            {company.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{company.name}</h1>
            <span className="inline-block bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/60 rounded px-2 py-0.5 text-[9px] font-bold mt-1.5 uppercase tracking-wider">
              {company.industry || "General Business"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Assign Customer
          </button>
          <button
            onClick={handleEditClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info details */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-soft space-y-6 self-start">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-slate-400">Company Profile</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <Globe className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">Website</span>
                {company.website ? (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                  >
                    {company.website.replace("https://", "").replace("http://", "")}
                  </a>
                ) : (
                  <span className="font-semibold text-slate-500 block">—</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <Phone className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">Office Phone</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 block">{company.phone || "—"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <MapPin className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">Headquarters</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300 block">{company.address || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts list table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-soft p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Associated Contacts ({companyCustomers?.total || 0})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Job Title</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {contactsLoading ? (
                  [1, 2].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3"><div className="h-3.5 bg-slate-100 dark:bg-zinc-800 rounded w-24" /></td>
                      <td className="py-3"><div className="h-3.5 bg-slate-100 dark:bg-zinc-800 rounded w-20" /></td>
                      <td className="py-3"><div className="h-3.5 bg-slate-100 dark:bg-zinc-800 rounded w-28" /></td>
                      <td className="py-3"><div className="h-3.5 bg-slate-100 dark:bg-zinc-800 rounded w-16" /></td>
                      <td className="py-3 text-right"><div className="h-5 bg-slate-100 dark:bg-zinc-800 rounded w-10 ml-auto" /></td>
                    </tr>
                  ))
                ) : !companyCustomers || companyCustomers.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-zinc-500 font-medium">
                      No customer contacts mapped to this company. Click "Assign Customer" to link profiles.
                    </td>
                  </tr>
                ) : (
                  companyCustomers.items.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/10">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{cust.name}</td>
                      <td className="py-3 text-slate-500 dark:text-zinc-400 font-medium">{cust.job_title || "—"}</td>
                      <td className="py-3 text-slate-500 dark:text-zinc-400 font-medium">{cust.email || "—"}</td>
                      <td className="py-3 text-slate-500 dark:text-zinc-400 font-medium">{cust.phone || "—"}</td>
                      <td className="py-3 text-right">
                        <Link 
                          to={`/dashboard/customers/${cust.id}`}
                          className="inline-flex p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Company Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Company details</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Company Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
              </div>

              {/* Industry & Website */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Industry</label>
                  <input
                    type="text"
                    {...register("industry")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Website URL</label>
                  <input
                    type="text"
                    {...register("website")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  {errors.website && <span className="text-[10px] text-red-500 font-semibold">{errors.website.message}</span>}
                </div>
              </div>

              {/* Phone & Address */}
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
                  <label className="text-xs font-semibold text-slate-500">Office Location</label>
                  <input
                    type="text"
                    {...register("address")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
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
                  disabled={updateCompanyMut.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {updateCompanyMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Customer Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAssignModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden z-10 p-6 space-y-5 transform transition-all animate-in fade-in zoom-in-95 duration-255">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Link Client to Company</h3>
              <button onClick={() => setAssignModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAssignCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Choose Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="">Select a contact...</option>
                  {assignableCustomers.map(cust => (
                    <option key={cust.id} value={cust.id}>{cust.name} ({cust.job_title || "No Title"})</option>
                  ))}
                </select>
                {assignableCustomers.length === 0 && (
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">No other unlinked customers.</span>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateCustomerMut.isPending || !selectedCustomerId}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {updateCustomerMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Link Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
