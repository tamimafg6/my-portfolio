"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { useAdminApi } from "@/lib/hooks/useAdminApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, User, MessageSquare, Calendar, ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "@/i18n/routing";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.messagesPage");
  const tCommon = useTranslations("common");
  const { authorized, loading } = useAdminAccess();
  const { get, del } = useAdminApi();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await get<ContactMessage[]>("/contact/messages");
        if (data) {
          const list = Array.isArray(data) ? data : [];
          setMessages(list.sort((a: ContactMessage, b: ContactMessage) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          setFetchError(null);
        } else {
          setFetchError(error || "Failed to load messages");
          setMessages([]);
        }
      } catch {
        setFetchError("Failed to load messages");
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (authorized) fetchMessages();
  }, [authorized, get]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleDeleteMessage = async () => {
    if (messageToDelete == null) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const { error } = await del(`/contact/messages/${messageToDelete}`);
      if (!error) {
        setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));
        setMessageToDelete(null);
      } else {
        setDeleteError(error || t("deleteError"));
      }
    } catch {
      setDeleteError(t("deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/${locale}/admin/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {t("backToDashboard")}
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {t("title")}
            </CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground py-8">{t("loading")}</p>
            ) : fetchError ? (
              <div className="py-8">
                <p className="text-destructive font-medium mb-2">{fetchError}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  {t("retry")}
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-muted-foreground py-8">
                {t("empty")}
              </p>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-6 rounded-xl border border-border bg-card hover:border-blue-500/30 transition-colors min-w-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-3 min-w-0">
                        <span className="flex items-center gap-2 font-semibold text-foreground">
                          <User className="w-4 h-4 text-blue-500 shrink-0" />
                          {msg.name}
                        </span>
                        <a
                          href={`mailto:${msg.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500"
                        >
                          <Mail className="w-4 h-4 shrink-0" />
                          {msg.email}
                        </a>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4 shrink-0" />
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => setMessageToDelete(msg.id)}
                        aria-label={t("delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">{t("delete")}</span>
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2 break-words">
                      <MessageSquare className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="min-w-0 break-words">{msg.subject}</span>
                    </p>
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm break-words min-w-0 [overflow-wrap:anywhere]">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Dialog open={messageToDelete != null} onOpenChange={(open) => !open && setMessageToDelete(null)}>
              <DialogContent onClose={() => setMessageToDelete(null)}>
                <DialogHeader>
                  <DialogTitle>{t("deleteTitle")}</DialogTitle>
                  <DialogDescription>{t("deleteDescription")}</DialogDescription>
                </DialogHeader>
                {deleteError && (
                  <p className="text-sm text-destructive">{deleteError}</p>
                )}
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => setMessageToDelete(null)}
                    disabled={isDeleting}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteMessage}
                    disabled={isDeleting}
                  >
                    {isDeleting ? tCommon("loading") : t("deleteConfirm")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
