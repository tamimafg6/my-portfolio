"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Plus, Edit, Trash2 } from "lucide-react";

interface Hobby {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  order: number;
}

export default function AdminHobbiesPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.hobbiesPage");
  const tCommon = useTranslations("common");
  const { authorized, loading } = useAdminAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [isLoadingHobbies, setIsLoadingHobbies] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  const fetchHobbies = async () => {
    try {
      setIsLoadingHobbies(true);
      const res = await fetch("/api/hobbies", { credentials: "include" });
      const data = await res.json();
      setHobbies(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching hobbies:", e);
      setHobbies([]);
    } finally {
      setIsLoadingHobbies(false);
    }
  };

  useEffect(() => {
    if (authorized) fetchHobbies();
  }, [authorized]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  const handleEdit = (hobby: Hobby) => {
    setEditingId(hobby.id);
    setFormData({
      titleEn: hobby.titleEn,
      titleAr: hobby.titleAr,
      descriptionEn: hobby.descriptionEn || "",
      descriptionAr: hobby.descriptionAr || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        titleEn: formData.titleEn,
        titleAr: formData.titleAr || formData.titleEn,
        descriptionEn: formData.descriptionEn || null,
        descriptionAr: formData.descriptionAr || null,
        order: editingId ? undefined : hobbies.length,
      };

      const res = editingId
        ? await fetch(`/api/hobbies/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          })
        : await fetch("/api/hobbies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        const updatedHobby = await res.json();
        if (editingId) {
          setHobbies(hobbies.map((h) => (h.id === editingId ? updatedHobby : h)));
        } else {
          setHobbies([...hobbies, updatedHobby]);
        }
        setFormData({ titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "" });
        setEditingId(null);
        setIsModalOpen(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || `Failed to ${editingId ? "update" : "create"} hobby`);
      }
    } catch (e) {
      console.error(e);
      alert(`Failed to ${editingId ? "update" : "create"} hobby`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this hobby?")) return;
    try {
      const res = await fetch(`/api/hobbies/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setHobbies(hobbies.filter((h) => h.id !== id));
      else alert("Failed to delete hobby");
    } catch (e) {
      console.error(e);
      alert("Failed to delete hobby");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
          </div>
          <Button className="gap-2" onClick={() => {
            setEditingId(null);
            setFormData({ titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "" });
            setIsModalOpen(true);
          }}>
            <Plus className="w-4 h-4" />
            {t("addHobby")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("cardTitle")}</CardTitle>
            <CardDescription>
              {hobbies.length === 1 ? t("entryCount", { count: hobbies.length }) : t("entryCountPlural", { count: hobbies.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHobbies ? (
              <div className="text-center py-12 text-muted-foreground">{t("loading")}</div>
            ) : hobbies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("empty")}</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {hobbies.map((h) => (
                  <li
                    key={h.id}
                    className="p-4 border border-border rounded-lg hover:border-blue-500/50 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {locale === "fr" ? h.titleAr : h.titleEn}
                      </h3>
                      {(locale === "fr" ? h.descriptionAr : h.descriptionEn) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {locale === "fr" ? h.descriptionAr : h.descriptionEn}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(h)}
                        aria-label="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(h.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setEditingId(null);
          setFormData({ titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "" });
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? t("editHobby") : t("addHobby")}</DialogTitle>
            <DialogDescription>
              {editingId ? t("editDescription") : t("addDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="titleEn" className="text-sm font-medium text-foreground">{t("titleEn")} *</label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => setFormData((f) => ({ ...f, titleEn: e.target.value }))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="titleAr" className="text-sm font-medium text-foreground">{t("titleAr")}</label>
              <Input
                id="titleAr"
                value={formData.titleAr}
                onChange={(e) => setFormData((f) => ({ ...f, titleAr: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="descriptionEn" className="text-sm font-medium text-foreground">{t("descriptionEn")}</label>
              <Input
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData((f) => ({ ...f, descriptionEn: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="descriptionAr" className="text-sm font-medium text-foreground">{t("descriptionAr")}</label>
              <Input
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) => setFormData((f) => ({ ...f, descriptionAr: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("adding") : (editingId ? tCommon("save") : t("addHobby"))}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
