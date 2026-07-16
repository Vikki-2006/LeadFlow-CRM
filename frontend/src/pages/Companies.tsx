import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCompanies, useCreateCompany, useDeleteCompany } from "../hooks/useCRM";
import { useAuth } from "../context/AuthContext";
import { 
  Building2, Plus, Globe, Phone, MapPin, Search, 
  Trash2, Eye, X, RefreshCw, ChevronLeft, ChevronRight 
} from "lucide-react";

const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  industry: z.string().optional(),
  website: z.string().url("Invalid URL").or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CompanyFormType = z.infer<typeof companySchema>;

export const Companies: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: companiesData, isLoading } = useCompanies(search, page, 8);
  const createMut = useCreateCompany();
  const deleteMut = useDeleteCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormType>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyFormType) => {
    try {
      const payload = {
        ...data,
        website: data.website === "" ? undefined : data.website
      };
      await createMut.mutateAsync(payload);
      reset();
      setModalOpen(false);
    } catch (err) {}
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will unassign all customers associated with it.`)) {
      await deleteMut.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Companies</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Manage client organizations and business units.</p>
        </div>
        <button
          onClick={() => { reset(); setModalOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-soft flex gap-4">
        <div className="relative flex items-center w-full max-w-sm">
          <Search className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-500 absolute left-3" />
          <input
            type="text"
            placeholder="Search by company name, industry..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Grid of Companies */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
      ) : !companiesData || companiesData.items.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-zinc-500 font-medium text-sm bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          No companies registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companiesData.items.map((comp) => (
            <div 
              key={comp.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-soft flex flex-col justify-between hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/40 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {user?.role === "Admin" && (
                    <button
                      onClick={() => handleDelete(comp.id, comp.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-600 transition-colors">
                    <Link to={`/dashboard/companies/${comp.id}`}>{comp.name}</Link>
                  </h3>
                  <span className="inline-block bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-700/60 rounded px-2 py-0.5 text-[9px] font-bold mt-1.5 uppercase tracking-wider">
                    {comp.industry || "General Business"}
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                  {comp.website && (
                    <a 
                      href={comp.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-1.5 hover:text-blue-600 hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {comp.website.replace("https://", "").replace("http://", "")}
                    </a>
                  )}
                  {comp.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {comp.phone}
                    </div>
                  )}
                  {comp.address && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5" />
                      {comp.address}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                <Link
                  to={`/dashboard/companies/${comp.id}`}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  View Profile <Eye className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {companiesData && companiesData.pages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-soft">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Page {page} of {companiesData.pages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= companiesData.pages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal - Add Company */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register New Company</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
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
                    placeholder="SaaS / Healthcare"
                    {...register("industry")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://acme.com"
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
                    placeholder="555-1000"
                    {...register("phone")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Office Location</label>
                  <input
                    type="text"
                    placeholder="San Jose, CA"
                    {...register("address")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {createMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
