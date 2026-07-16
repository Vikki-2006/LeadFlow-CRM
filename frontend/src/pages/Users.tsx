import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from "../hooks/useCRM";
import { useAuth } from "../context/AuthContext";
import { 
  User, Plus, Shield, ShieldCheck, Mail, 
  Trash2, X, RefreshCw, AlertCircle, Edit
} from "lucide-react";

const userCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["Admin", "Sales Executive"]).default("Sales Executive"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const userEditSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["Admin", "Sales Executive"]).default("Sales Executive"),
  password: z.string().optional(),
});

type UserCreateForm = z.infer<typeof userCreateSchema>;
type UserEditForm = z.infer<typeof userEditSchema>;

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: users = [], isLoading, refetch } = useUsers();
  const createMut = useCreateUser();
  const deleteMut = useDeleteUser();
  const updateMut = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserCreateForm>({
    resolver: zodResolver(userCreateSchema),
  });

  const editForm = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
  });

  const onSubmit = async (data: UserCreateForm) => {
    try {
      await createMut.mutateAsync(data);
      setModalOpen(false);
      reset();
    } catch (err) {}
  };

  const handleEditClick = (u: any) => {
    setSelectedUserId(u.id);
    editForm.reset({
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      role: u.role,
      password: "",
    });
    setEditModalOpen(true);
  };

  const onEditSubmit = async (data: UserEditForm) => {
    if (!selectedUserId) return;
    try {
      const payload = {
        id: selectedUserId,
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        role: data.role,
        password: data.password || undefined,
      };
      await updateMut.mutateAsync(payload);
      setEditModalOpen(false);
    } catch (err) {}
  };

  const handleDelete = async (id: number, name: string) => {
    if (id === currentUser?.id) return;
    if (confirm(`Are you sure you want to delete user ${name}? This will remove their credentials.`)) {
      await deleteMut.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">System Users</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Add or manage login credentials and role authorizations.</p>
        </div>
        <button
          onClick={() => { reset(); setModalOpen(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add User Account
        </button>
      </div>

      {/* Users table list */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 dark:border-zinc-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Access Role</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {isLoading ? (
                [1, 2].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4.5 bg-slate-100 dark:bg-zinc-800 rounded-full w-12" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-6 bg-slate-100 dark:bg-zinc-800 rounded w-10 ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No users logged.
                  </td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100/50 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 text-[10px]">
                        {item.name.charAt(0)}
                      </div>
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 font-medium">{item.email}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 font-medium">{item.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        item.role === "Admin" 
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-255/10" 
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-255/10"
                      }`}>
                        {item.role === "Admin" ? <Shield className="w-3 h-3 shrink-0" /> : <ShieldCheck className="w-3 h-3 shrink-0" />}
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-all"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {item.id !== currentUser?.id ? (
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-450 dark:text-zinc-550 font-semibold italic pr-1">Self</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Rep Account</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Full Name</label>
                <input
                  type="text"
                  placeholder="Sarah Jenkins"
                  {...register("name")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah@leadflow.com"
                    {...register("email")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  {errors.email && <span className="text-[10px] text-red-500 font-semibold">{errors.email.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Phone</label>
                  <input
                    type="text"
                    placeholder="555-0102"
                    {...register("phone")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Role & Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">System Role</label>
                  <select
                    {...register("role")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Account Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  {errors.password && <span className="text-[10px] text-red-500 font-semibold">{errors.password.message}</span>}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {createMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Edit User */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden z-10 p-6 space-y-6 transform transition-all animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit User Account</h3>
              <button onClick={() => setEditModalOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Full Name</label>
                <input
                  type="text"
                  placeholder="Sarah Jenkins"
                  {...editForm.register("name")}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                />
                {editForm.formState.errors.name && <span className="text-[10px] text-red-500 font-semibold">{editForm.formState.errors.name.message}</span>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah@leadflow.com"
                    {...editForm.register("email")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                  {editForm.formState.errors.email && <span className="text-[10px] text-red-500 font-semibold">{editForm.formState.errors.email.message}</span>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Phone</label>
                  <input
                    type="text"
                    placeholder="555-0102"
                    {...editForm.register("phone")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Role & Password */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">System Role</label>
                  <select
                    {...editForm.register("role")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-850 focus:outline-none font-semibold cursor-pointer"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep same"
                    {...editForm.register("password")}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMut.isPending}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {updateMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
