import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPanel() {
  const { data: users, isLoading, refetch } = trpc.user.list.useQuery();
  const updateRoleMutation = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-card-foreground/10 rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="card-blueprint">
        <h1 className="text-2xl font-bold font-mono mb-4 text-accent">ADMIN PANEL</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-mono font-semibold mb-3 text-cyan-300">USER MANAGEMENT</h2>
            <div className="space-y-2">
              {users && users.length > 0 ? (
                users.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border border-accent/30 rounded-none bg-accent/5"
                  >
                    <div>
                      <p className="font-mono font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            userId: user.id,
                            role: e.target.value as "admin" | "analyst" | "reporter",
                          })
                        }
                        className="input-blueprint px-2 py-1 text-sm"
                      >
                        <option value="reporter">Reporter</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                      </select>

                      <span
                        className={`px-2 py-1 rounded-none text-xs font-mono font-semibold border ${
                          user.role === "admin"
                            ? "bg-red-950/40 text-red-200 border-red-500/50"
                            : user.role === "analyst"
                              ? "bg-blue-950/40 text-blue-200 border-blue-500/50"
                              : "bg-gray-950/40 text-gray-200 border-gray-500/50"
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground font-mono">No users found</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="card-blueprint">
        <h2 className="text-lg font-mono font-semibold mb-4 text-cyan-300">SYSTEM INFORMATION</h2>
        <div className="grid grid-cols-2 gap-4 font-mono text-sm">
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">Application</p>
            <p className="text-cyan-300 font-semibold">CyberShield Portal</p>
          </div>
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">Version</p>
            <p className="text-cyan-300 font-semibold">1.0.0</p>
          </div>
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">ML Model</p>
            <p className="text-cyan-300 font-semibold">TF-IDF + RF</p>
          </div>
          <div className="border border-accent/30 p-3 rounded-none">
            <p className="text-muted-foreground">Database</p>
            <p className="text-cyan-300 font-semibold">MySQL</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
