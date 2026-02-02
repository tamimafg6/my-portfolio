"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
} from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  email: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { authorized, loading } = useAdminAccess();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [testimonialToReject, setTestimonialToReject] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoadingTestimonials(true);
        const res = await fetch("/api/testimonials/admin", {
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched testimonials:", data);
          setTestimonials(Array.isArray(data) ? data : []);
          setFetchError(null);
        } else {
          const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
          console.error("Failed to fetch testimonials:", res.status, errorData);
          setTestimonials([]);
          setFetchError(errorData?.error || `Failed to fetch testimonials (${res.status})`);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
        setFetchError("Network error: Failed to fetch testimonials");
      } finally {
        setIsLoadingTestimonials(false);
      }
    };

    if (authorized) {
      fetchTestimonials();
    }
  }, [authorized]);

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isApproved: true }),
      });

      if (res.ok) {
        // Refresh testimonials
        const refreshRes = await fetch("/api/testimonials/admin", {
          credentials: "include",
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setTestimonials(Array.isArray(refreshData) ? refreshData : []);
        } else {
          // Still update the local state even if refresh fails
          setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isApproved: true } : t));
        }
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to approve testimonial:", res.status, errorData);
        alert(`Failed to approve testimonial: ${errorData?.error || res.status}`);
      }
    } catch (error: any) {
      console.error("Error approving testimonial:", error);
      alert(`Error approving testimonial: ${error?.message || "Please try again."}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (id: number) => {
    setTestimonialToReject(id);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (testimonialToReject === null) return;

    try {
      setActionLoading(testimonialToReject);
      console.log("[Reject] Starting reject (delete) for testimonial ID:", testimonialToReject);
      
      const res = await fetch(`/api/testimonials/${testimonialToReject}`, {
        method: "DELETE",
        credentials: "include",
      });

      console.log("[Reject] Delete response status:", res.status);
      
      if (res.ok) {
        // Remove from list immediately
        setTestimonials(prev => prev.filter(t => t.id !== testimonialToReject));
        console.log("[Reject] Testimonial deleted successfully");
        setRejectDialogOpen(false);
        setTestimonialToReject(null);
      } else {
        const errorText = await res.text();
        console.error("[Reject] Failed to delete testimonial:", res.status, errorText);
        let errorMessage = `Failed to reject testimonial (${res.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData?.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error("[Reject] Error rejecting testimonial:", error);
      alert(`Error rejecting testimonial: ${error?.message || "Please try again."}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUnapprove = async (id: number) => {
    // For approved testimonials, unapprove them (set isApproved to false)
    try {
      setActionLoading(id);
      console.log("[Unapprove] Starting unapprove for testimonial ID:", id);
      
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isApproved: false }),
      });

      console.log("[Unapprove] Response status:", res.status);
      
      if (res.ok) {
        const updatedData = await res.json();
        console.log("[Unapprove] Updated testimonial:", updatedData);
        
        // Refresh testimonials to get updated list
        const refreshRes = await fetch("/api/testimonials/admin", {
          credentials: "include",
        });
        
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          console.log("[Unapprove] Refreshed testimonials count:", refreshData.length);
          setTestimonials(Array.isArray(refreshData) ? refreshData : []);
        } else {
          // Update local state optimistically
          setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isApproved: false } : t));
        }
      } else {
        const errorText = await res.text();
        console.error("[Unapprove] Failed to unapprove testimonial:", res.status, errorText);
        alert(`Failed to unapprove testimonial: ${res.status}`);
      }
    } catch (error: any) {
      console.error("[Unapprove] Error unapproving testimonial:", error);
      alert(`Error unapproving testimonial: ${error?.message || "Please try again."}`);
    } finally {
      setActionLoading(null);
    }
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const approvedTestimonials = testimonials.filter((t) => t.isApproved);
  const pendingTestimonials = testimonials.filter((t) => !t.isApproved);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Testimonials Management</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Review and manage testimonials submitted by users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Testimonials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{testimonials.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {approvedTestimonials.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {pendingTestimonials.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoadingTestimonials ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading testimonials...</p>
          </div>
        ) : fetchError ? (
          <Card className="border-red-500/20">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50" />
              <p className="text-red-500 font-semibold mb-2">Error loading testimonials</p>
              <p className="text-muted-foreground text-sm">{fetchError}</p>
              <Button
                onClick={() => {
                  setFetchError(null);
                  setIsLoadingTestimonials(true);
                  fetch("/api/testimonials/admin", { credentials: "include" })
                    .then((res) => {
                      if (res.ok) {
                        return res.json();
                      }
                      throw new Error(`Failed: ${res.status}`);
                    })
                    .then((data) => {
                      setTestimonials(Array.isArray(data) ? data : []);
                      setFetchError(null);
                    })
                    .catch((error) => {
                      console.error("Retry error:", error);
                      setFetchError("Failed to fetch testimonials");
                    })
                    .finally(() => setIsLoadingTestimonials(false));
                }}
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : testimonials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No testimonials found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Testimonials */}
            {pendingTestimonials.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-amber-500" />
                  Pending Review ({pendingTestimonials.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTestimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="border-amber-500/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                            <CardDescription>
                              {testimonial.email}
                              {testimonial.role && testimonial.company
                                ? ` • ${testimonial.role} at ${testimonial.company}`
                                : testimonial.role
                                ? ` • ${testimonial.role}`
                                : testimonial.company
                                ? ` • ${testimonial.company}`
                                : ""}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                        <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(testimonial.id)}
                            disabled={actionLoading === testimonial.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectClick(testimonial.id)}
                            disabled={actionLoading === testimonial.id}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Testimonials */}
            {approvedTestimonials.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  Approved ({approvedTestimonials.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedTestimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="border-green-500/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                            <CardDescription>
                              {testimonial.email}
                              {testimonial.role && testimonial.company
                                ? ` • ${testimonial.role} at ${testimonial.company}`
                                : testimonial.role
                                ? ` • ${testimonial.role}`
                                : testimonial.company
                                ? ` • ${testimonial.company}`
                                : ""}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                            Approved
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-500 text-yellow-500"
                            />
                          ))}
                        </div>
                        <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // For approved testimonials, "reject" means unapprove (set to false)
                              handleRejectUnapprove(testimonial.id);
                            }}
                            disabled={actionLoading === testimonial.id}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Unapprove
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectClick(testimonial.id)}
                            disabled={actionLoading === testimonial.id}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reject Confirmation Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Testimonial</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject and delete this testimonial? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setTestimonialToReject(null);
                }}
                disabled={actionLoading !== null}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectConfirm}
                disabled={actionLoading !== null}
              >
                {actionLoading !== null ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
