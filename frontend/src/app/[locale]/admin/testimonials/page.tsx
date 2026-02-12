"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { useAdminApi } from "@/lib/hooks/useAdminApi";
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
  Trash2,
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
  const t = useTranslations("admin.testimonialsPage");
  const tCommon = useTranslations("common");
  const { authorized, loading } = useAdminAccess();
  const { get, put, del } = useAdminApi();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<number | null>(null);

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
        const { data, error } = await get<Testimonial[]>("/testimonials/admin");
        
        if (data) {
          console.log("Fetched testimonials:", data);
          setTestimonials(Array.isArray(data) ? data : []);
          setFetchError(null);
        } else {
          console.error("Failed to fetch testimonials:", error);
          setTestimonials([]);
          setFetchError(error || "Failed to fetch testimonials");
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
  }, [authorized, get]);

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      const { data, error } = await put(`/testimonials/${id}`, { isApproved: true });

      if (data) {
        // Refresh testimonials
        const { data: refreshData } = await get<Testimonial[]>("/testimonials/admin");
        if (refreshData) {
          setTestimonials(Array.isArray(refreshData) ? refreshData : []);
        } else {
          // Still update the local state even if refresh fails
          setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isApproved: true } : t));
        }
      } else {
        console.error("Failed to approve testimonial:", error);
        alert(`Failed to approve testimonial: ${error || "Unknown error"}`);
      }
    } catch (error: unknown) {
      console.error("Error approving testimonial:", error);
      alert(`Error approving testimonial: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setTestimonialToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (testimonialToDelete === null) return;

    try {
      setActionLoading(testimonialToDelete);
      const { error } = await del(`/testimonials/${testimonialToDelete}`);

      if (!error) {
        setTestimonials((prev) => prev.filter((t) => t.id !== testimonialToDelete));
        setDeleteDialogOpen(false);
        setTestimonialToDelete(null);
      } else {
        alert(error || t("failedReject"));
      }
    } catch (error: unknown) {
      alert(t("failedReject"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUnapprove = async (id: number) => {
    // For approved testimonials, unapprove them (set isApproved to false)
    try {
      setActionLoading(id);
      console.log("[Unapprove] Starting unapprove for testimonial ID:", id);
      
      const { data, error } = await put(`/testimonials/${id}`, { isApproved: false });

      console.log("[Unapprove] Response:", data, error);
      
      if (data) {
        console.log("[Unapprove] Updated testimonial:", data);
        
        // Refresh testimonials to get updated list
        const { data: refreshData } = await get<Testimonial[]>("/testimonials/admin");
        
        if (refreshData) {
          console.log("[Unapprove] Refreshed testimonials count:", refreshData.length);
          setTestimonials(Array.isArray(refreshData) ? refreshData : []);
        } else {
          // Update local state optimistically
          setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isApproved: false } : t));
        }
      } else {
        console.error("[Unapprove] Failed to unapprove testimonial:", error);
        alert(`Failed to unapprove testimonial: ${error || "Unknown error"}`);
      }
    } catch (error: unknown) {
      console.error("[Unapprove] Error unapproving testimonial:", error);
      alert(`Error unapproving testimonial: ${error instanceof Error ? error.message : "Please try again."}`);
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
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          </div>
          <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("title")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{testimonials.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("approved")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {approvedTestimonials.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{t("pendingReview")}</CardDescription>
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
              <p className="text-red-500 font-semibold mb-2">{t("loading").replace("...", "")}</p>
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
                  {t("pendingReview")} ({pendingTestimonials.length})
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
                            {t("pending")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(testimonial.id)}
                            disabled={actionLoading === testimonial.id}
                            className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t("approve")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(testimonial.id)}
                            disabled={actionLoading === testimonial.id}
                            className="flex-1 min-w-[100px] text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("delete")}
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
                  {t("approved")} ({approvedTestimonials.length})
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
{t("approved")}
                            </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectUnapprove(testimonial.id)}
                            disabled={actionLoading === testimonial.id}
                            className="flex-1 min-w-[100px]"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t("reject")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(testimonial.id)}
                            disabled={actionLoading === testimonial.id}
                            className="flex-1 min-w-[100px] text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("delete")}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
              <DialogDescription>{t("deleteConfirmDescription")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setTestimonialToDelete(null);
                }}
                disabled={actionLoading !== null}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={actionLoading !== null}
              >
                {actionLoading !== null ? tCommon("loading") : t("delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
