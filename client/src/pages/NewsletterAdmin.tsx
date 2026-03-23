import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  ArrowLeft,
  Send,
  Users,
  Mail,
  Trash2,
  Eye,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import type { Subscription } from "@shared/schema";

export default function NewsletterAdmin() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: subscribers, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const activeSubscribers = subscribers?.filter(s => s.isActive) || [];
  const inactiveSubscribers = subscribers?.filter(s => !s.isActive) || [];

  const filteredSubscribers = subscribers?.filter(s =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sendMutation = useMutation({
    mutationFn: async (data: { subject: string; content: string; testEmail?: string }) => {
      const res = await apiRequest("POST", "/api/newsletter/send", data);
      return res.json();
    },
    onSuccess: (data: { sent: number; failed: number; total: number; isTest?: boolean }) => {
      if (data.isTest) {
        toast({ title: "Test email sent!", description: `Newsletter preview sent to your test email.` });
      } else {
        toast({
          title: "Newsletter sent!",
          description: `Successfully sent to ${data.sent} of ${data.total} subscribers.${data.failed > 0 ? ` ${data.failed} failed.` : ""}`,
        });
        setSubject("");
        setContent("");
      }
      setConfirmSendOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Send failed", description: error.message || "Could not send newsletter", variant: "destructive" });
      setConfirmSendOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({ title: "Subscriber removed" });
      setDeleteId(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/subscriptions/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
  });

  const htmlContent = content
    .split("\n\n")
    .map(p => p.trim())
    .filter(p => p)
    .map(p => `<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">${p}</p>`)
    .join("");

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-newsletter-title">Newsletter</h1>
            <p className="text-muted-foreground text-sm">Compose and send newsletters to subscribers</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Users className="w-3 h-3" />
              {activeSubscribers.length} active
            </Badge>
            {inactiveSubscribers.length > 0 && (
              <Badge variant="outline" className="gap-1">
                {inactiveSubscribers.length} inactive
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList>
            <TabsTrigger value="compose" data-testid="tab-compose">
              <Send className="w-4 h-4 mr-2" /> Compose
            </TabsTrigger>
            <TabsTrigger value="subscribers" data-testid="tab-subscribers">
              <Users className="w-4 h-4 mr-2" /> Subscribers ({subscribers?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Compose Newsletter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g., NUP Diaspora Monthly Update - March 2026"
                      data-testid="input-subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">
                      Email Content
                      <span className="text-muted-foreground text-xs ml-2">(use blank lines between paragraphs)</span>
                    </Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Write your newsletter content here...

Separate paragraphs with blank lines.

Each paragraph will be formatted automatically with proper spacing."
                      className="min-h-[300px]"
                      data-testid="input-content"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewOpen(true)}
                      disabled={!subject || !content}
                      data-testid="button-preview"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Preview
                    </Button>
                    <div className="flex items-center gap-2">
                      <Input
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                        placeholder="Test email address"
                        className="w-48"
                        data-testid="input-test-email"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => sendMutation.mutate({ subject, content, testEmail })}
                        disabled={!subject || !content || !testEmail || sendMutation.isPending}
                        data-testid="button-send-test"
                      >
                        {sendMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Send Test
                      </Button>
                    </div>
                    <Button
                      className="ml-auto"
                      onClick={() => setConfirmSendOpen(true)}
                      disabled={!subject || !content || activeSubscribers.length === 0}
                      data-testid="button-send-all"
                    >
                      <Send className="w-4 h-4 mr-2" /> Send to All ({activeSubscribers.length})
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subject || content ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-red-700 text-white p-4 text-center">
                        <h2 className="font-bold text-lg">NUP Diaspora</h2>
                        <p className="text-sm opacity-90">National Unity Platform — People Power</p>
                      </div>
                      <div className="p-6">
                        {subject && <h3 className="font-bold text-lg mb-4">{subject}</h3>}
                        {content.split("\n\n").filter(p => p.trim()).map((paragraph, i) => (
                          <p key={i} className="text-sm text-muted-foreground mb-3 leading-relaxed">{paragraph}</p>
                        ))}
                      </div>
                      <div className="bg-muted p-3 text-center text-xs text-muted-foreground">
                        NUP Diaspora — National Unity Platform
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Start typing to see the email preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">All Subscribers</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search subscribers..."
                      className="pl-9"
                      data-testid="input-search-subscribers"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredSubscribers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>{searchQuery ? "No subscribers match your search" : "No subscribers yet"}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredSubscribers.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between py-3" data-testid={`subscriber-row-${sub.id}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${sub.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                          <div>
                            <p className="font-medium text-sm">{sub.email}</p>
                            {sub.name && <p className="text-xs text-muted-foreground">{sub.name}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={sub.isActive ? "default" : "secondary"} className="text-xs">
                            {sub.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : ""}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({ id: sub.id, isActive: !sub.isActive })}
                            data-testid={`button-toggle-${sub.id}`}
                          >
                            {sub.isActive ? <XCircle className="w-4 h-4 text-muted-foreground" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(sub.id)}
                            data-testid={`button-delete-${sub.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
              <DialogDescription>This is how your newsletter will look in subscribers' inboxes.</DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
              <div className="bg-red-700 text-white p-4 text-center">
                <h2 className="font-bold text-lg">NUP Diaspora</h2>
                <p className="text-sm opacity-90">National Unity Platform — People Power</p>
              </div>
              <div className="p-6">
                {subject && <h3 className="font-bold text-lg mb-4">{subject}</h3>}
                {content.split("\n\n").filter(p => p.trim()).map((paragraph, i) => (
                  <p key={i} className="text-sm text-muted-foreground mb-3 leading-relaxed">{paragraph}</p>
                ))}
              </div>
              <div className="bg-muted p-3 text-center text-xs text-muted-foreground">
                NUP Diaspora — National Unity Platform<br />
                You received this because you subscribed to our newsletter.
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Confirm Send
              </DialogTitle>
              <DialogDescription>
                This will send the newsletter to all active subscribers. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm"><strong>Subject:</strong> {subject}</p>
              <p className="text-sm"><strong>Recipients:</strong> {activeSubscribers.length} active subscribers</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmSendOpen(false)}>Cancel</Button>
              <Button
                onClick={() => sendMutation.mutate({ subject, content })}
                disabled={sendMutation.isPending}
                data-testid="button-confirm-send"
              >
                {sendMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Send to {activeSubscribers.length} subscribers</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Subscriber</DialogTitle>
              <DialogDescription>Are you sure you want to remove this subscriber? This cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} data-testid="button-confirm-delete">
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
