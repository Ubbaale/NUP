import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export type EditField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "url" | "email" | "number" | "select" | "switch";
  options?: { value: string; label: string }[];
  rows?: number;
  placeholder?: string;
};

export interface EditEntryDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  invalidateKeys: any[][];
  fields: EditField[];
  initial: Record<string, any>;
}

export function EditEntryDialog({
  open, onClose, title, endpoint, invalidateKeys, fields, initial,
}: EditEntryDialogProps) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      const init: Record<string, any> = {};
      for (const f of fields) {
        init[f.name] = initial[f.name] ?? (f.type === "switch" ? false : "");
      }
      setValues(init);
    }
  }, [open, initial, fields]);

  const mut = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {};
      for (const f of fields) {
        let v = values[f.name];
        if (f.type === "number") {
          v = v === "" || v == null ? null : Number(v);
        } else if (typeof v === "string") {
          v = v.trim() === "" ? null : v;
        }
        payload[f.name] = v;
      }
      const res = await apiRequest("PATCH", endpoint, payload);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      return data;
    },
    onSuccess: () => {
      for (const k of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: k });
      }
      toast({ title: "Saved", description: "Your changes have been saved." });
      onClose();
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const setField = (name: string, value: any) => setValues(v => ({ ...v, [name]: value }));

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
        >
          {fields.map((f) => {
            const id = `edit-${f.name}`;
            const val = values[f.name] ?? "";
            if (f.type === "textarea") {
              return (
                <div key={f.name}>
                  <Label htmlFor={id}>{f.label}</Label>
                  <Textarea
                    id={id}
                    rows={f.rows ?? 4}
                    value={val ?? ""}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    data-testid={`input-edit-${f.name}`}
                  />
                </div>
              );
            }
            if (f.type === "select" && f.options) {
              return (
                <div key={f.name}>
                  <Label htmlFor={id}>{f.label}</Label>
                  <Select value={String(val ?? "")} onValueChange={(v) => setField(f.name, v)}>
                    <SelectTrigger id={id} data-testid={`select-edit-${f.name}`}>
                      <SelectValue placeholder={f.placeholder || "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            if (f.type === "switch") {
              return (
                <div key={f.name} className="flex items-center justify-between">
                  <Label htmlFor={id}>{f.label}</Label>
                  <Switch
                    id={id}
                    checked={!!val}
                    onCheckedChange={(v) => setField(f.name, v)}
                    data-testid={`switch-edit-${f.name}`}
                  />
                </div>
              );
            }
            return (
              <div key={f.name}>
                <Label htmlFor={id}>{f.label}</Label>
                <Input
                  id={id}
                  type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "url" ? "url" : "text"}
                  value={val ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  data-testid={`input-edit-${f.name}`}
                />
              </div>
            );
          })}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              disabled={mut.isPending}
              className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white border-0 font-bold"
              data-testid="button-save-edit"
            >
              {mut.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
