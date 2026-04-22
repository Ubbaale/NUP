import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAdminAuth, type AdminRole } from "@/components/AdminAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, UserPlus, Shield, Trash2, KeyRound, Power } from "lucide-react";

interface AdminUserRow {
  id: string;
  username: string;
  email: string | null;
  fullName: string | null;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: "Full access — manages users and views audit log",
  editor: "Can create, edit and delete content",
  viewer: "Read-only access to admin pages",
};

export default function UsersAdmin() {
  const { user: currentUser, hasRole } = useAdminAuth();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<AdminUserRow[]>({
    queryKey: ["/api/admin/users"],
    enabled: hasRole("super_admin"),
  });

  if (!hasRole("super_admin")) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-semibold">Super Admin access required</p>
            <p className="text-muted-foreground mt-1">Only super admins can manage users.</p>
            <Link href="/admin">
              <Button variant="outline" className="mt-4" data-testid="link-back">Back to dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" data-testid="link-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mt-2">Admin Users</h1>
          <p className="text-muted-foreground">Manage who can access the admin and what they can do.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="text-base font-bold px-6 py-6 shadow-lg text-white border-0 bg-[length:200%_200%] animate-[gradient-pulse_3s_ease_infinite] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:opacity-95"
              data-testid="button-create-user"
            >
              <UserPlus className="w-5 h-5 mr-2" /> Create New Admin User
            </Button>
          </DialogTrigger>
          <CreateUserDialog onClose={() => setCreateOpen(false)} />
        </Dialog>
      </div>

      <Card className="border-2 border-dashed border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="p-5 flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <p className="font-semibold">Add a new admin to your team</p>
            <p className="text-sm text-muted-foreground">Give someone Editor access to help manage content, or another Super Admin as a backup.</p>
          </div>
          <Button
            size="lg"
            onClick={() => setCreateOpen(true)}
            className="text-base font-bold px-6 shadow-md text-white border-0 bg-[length:200%_200%] animate-[gradient-pulse_3s_ease_infinite] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:opacity-95"
            data-testid="button-create-user-cta"
          >
            <UserPlus className="w-5 h-5 mr-2" /> Create New Admin User
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="divide-y">
              {users.map(u => (
                <UserRow key={u.id} user={u} isSelf={u.id === currentUser?.id} toast={toast} />
              ))}
              {users.length === 0 && (
                <div className="p-10 text-center">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No additional users yet — click the button above to add one.</p>
                  <Button
                    size="lg"
                    onClick={() => setCreateOpen(true)}
                    className="text-base font-bold px-6 shadow-md text-white border-0 bg-[length:200%_200%] animate-[gradient-pulse_3s_ease_infinite] bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:opacity-95"
                    data-testid="button-create-user-empty"
                  >
                    <UserPlus className="w-5 h-5 mr-2" /> Create New Admin User
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({ user, isSelf, toast }: { user: AdminUserRow; isSelf: boolean; toast: any }) {
  const [pwOpen, setPwOpen] = useState(false);

  const updateMut = useMutation({
    mutationFn: async (patch: Partial<AdminUserRow>) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${user.id}`, patch);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated" });
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/admin/users/${user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted" });
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const roleColor: Record<AdminRole, string> = {
    super_admin: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
    editor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    viewer: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <div className="p-4 flex items-center gap-4 flex-wrap" data-testid={`row-user-${user.id}`}>
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2">
          <span className="font-semibold" data-testid={`text-username-${user.id}`}>{user.username}</span>
          {isSelf && <Badge variant="outline" className="text-xs">You</Badge>}
          {!user.isActive && <Badge variant="secondary" className="text-xs">Disabled</Badge>}
        </div>
        {user.fullName && <p className="text-sm">{user.fullName}</p>}
        {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
        {user.lastLoginAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Last login: {new Date(user.lastLoginAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="w-44">
        <Select
          value={user.role}
          onValueChange={(v) => updateMut.mutate({ role: v as AdminRole })}
          disabled={updateMut.isPending}
        >
          <SelectTrigger data-testid={`select-role-${user.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["super_admin", "editor", "viewer"] as AdminRole[]).map(r => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">{ROLE_DESCRIPTIONS[user.role]}</p>
      </div>

      <Badge className={roleColor[user.role]}>{ROLE_LABELS[user.role]}</Badge>

      <div className="flex gap-2">
        <Dialog open={pwOpen} onOpenChange={setPwOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" data-testid={`button-reset-password-${user.id}`}>
              <KeyRound className="w-4 h-4 mr-1" /> Reset password
            </Button>
          </DialogTrigger>
          <ResetPasswordDialog
            onSubmit={async (newPassword) => {
              await updateMut.mutateAsync({ password: newPassword } as any);
              setPwOpen(false);
            }}
          />
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          onClick={() => updateMut.mutate({ isActive: !user.isActive })}
          disabled={updateMut.isPending || isSelf}
          data-testid={`button-toggle-active-${user.id}`}
          title={isSelf ? "You cannot disable your own account" : ""}
        >
          <Power className="w-4 h-4 mr-1" />
          {user.isActive ? "Disable" : "Enable"}
        </Button>

        {!isSelf && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" data-testid={`button-delete-user-${user.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete user "{user.username}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the account. Their past audit log entries are preserved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMut.mutate()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

function CreateUserDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");

  const mut = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/users", {
        username, password, fullName: fullName || undefined, email: email || undefined, role, isActive: true,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User created" });
      setUsername(""); setPassword(""); setFullName(""); setEmail(""); setRole("editor");
      onClose();
    },
    onError: (e: any) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add admin user</DialogTitle>
      </DialogHeader>
      <form
        className="space-y-3"
        onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
      >
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input id="username" value={username} onChange={e => setUsername(e.target.value)} required data-testid="input-username" />
        </div>
        <div>
          <Label htmlFor="password">Password * (min 8 characters)</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} data-testid="input-password" />
        </div>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} data-testid="input-fullname" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} data-testid="input-email" />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={v => setRole(v as AdminRole)}>
            <SelectTrigger id="role" data-testid="select-new-role"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["super_admin", "editor", "viewer"] as AdminRole[]).map(r => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mut.isPending} data-testid="button-submit-create-user">
            {mut.isPending ? "Creating..." : "Create user"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function ResetPasswordDialog({ onSubmit }: { onSubmit: (pw: string) => Promise<void> }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reset password</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (pw.length < 8) return;
          setBusy(true);
          try { await onSubmit(pw); setPw(""); } finally { setBusy(false); }
        }}
        className="space-y-3"
      >
        <Label htmlFor="newpw">New password (min 8 characters)</Label>
        <Input id="newpw" type="password" value={pw} onChange={e => setPw(e.target.value)} minLength={8} required data-testid="input-new-password" />
        <DialogFooter>
          <Button type="submit" disabled={busy || pw.length < 8} data-testid="button-submit-reset-password">
            {busy ? "Saving..." : "Reset password"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
