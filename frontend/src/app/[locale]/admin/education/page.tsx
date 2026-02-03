"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, Plus, Edit, Trash2, MapPin, Calendar } from "lucide-react";

interface Education {
  id: number;
  institutionEn: string;
  institutionAr: string;
  degreeEn: string;
  degreeAr: string;
  fieldEn: string | null;
  fieldAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  gpa: string | null;
  order: number;
}

export default function AdminEducationPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.educationPage");
  const tCommon = useTranslations("common");
  const { authorized, loading } = useAdminAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoadingEducation, setIsLoadingEducation] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    institutionEn: "",
    institutionAr: "",
    degreeEn: "",
    degreeAr: "",
    fieldEn: "",
    fieldAr: "",
    location: "",
    startDate: "",
    endDate: "",
    gpa: "",
    descriptionEn: "",
    descriptionAr: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  const fetchEducation = async () => {
    try {
      setIsLoadingEducation(true);
      setFetchError(null);
      const res = await fetch("/api/education");
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data)) {
        setEducation(data);
      } else {
        setEducation([]);
        setFetchError(
          data?.error || (res.ok ? "Invalid response" : `Failed to load (${res.status})`)
        );
      }
    } catch (error) {
      console.error("Error fetching education:", error);
      setEducation([]);
      setFetchError("Could not reach the server. Is the backend running?");
    } finally {
      setIsLoadingEducation(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchEducation();
    }
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

  if (!authorized) {
    return null;
  }

  const emptyForm = () => ({
    institutionEn: "",
    institutionAr: "",
    degreeEn: "",
    degreeAr: "",
    fieldEn: "",
    fieldAr: "",
    location: "",
    startDate: "",
    endDate: "",
    gpa: "",
    descriptionEn: "",
    descriptionAr: "",
  });

  const openEditModal = (edu: Education) => {
    setEditingEducation(edu);
    setFormData({
      institutionEn: edu.institutionEn,
      institutionAr: edu.institutionAr || "",
      degreeEn: edu.degreeEn,
      degreeAr: edu.degreeAr || "",
      fieldEn: edu.fieldEn || "",
      fieldAr: edu.fieldAr || "",
      location: edu.location || "",
      startDate: edu.startDate ? String(edu.startDate).slice(0, 7) : "",
      endDate: edu.endDate ? String(edu.endDate).slice(0, 7) : "",
      gpa: edu.gpa || "",
      descriptionEn: edu.descriptionEn || "",
      descriptionAr: edu.descriptionAr || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEducation(null);
    setFormData(emptyForm());
  };

  const buildPayload = () => ({
    institutionEn: formData.institutionEn,
    institutionAr: formData.institutionAr || formData.institutionEn,
    degreeEn: formData.degreeEn,
    degreeAr: formData.degreeAr || formData.degreeEn,
    fieldEn: formData.fieldEn || null,
    fieldAr: formData.fieldAr || null,
    location: formData.location || null,
    startDate: new Date(formData.startDate + "-01").toISOString(),
    endDate: formData.endDate ? new Date(formData.endDate + "-01").toISOString() : null,
    gpa: formData.gpa || null,
    descriptionEn: formData.descriptionEn || null,
    descriptionAr: formData.descriptionAr || null,
    order: editingEducation ? editingEducation.order : education.length,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (editingEducation) {
        const res = await fetch(`/api/education/${editingEducation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setEducation(education.map((ed) => (ed.id === editingEducation.id ? updated : ed)));
          closeModal();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to update education.");
        }
      } else {
        const res = await fetch("/api/education", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const newEducation = await res.json();
          setEducation([...education, newEducation]);
          closeModal();
        } else {
          const err = await res.json();
          alert(err.error || t("failedCreate"));
        }
      }
    } catch (error) {
      console.error("Failed to save education:", error);
      alert("Failed to save education.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/education/${deleteConfirm.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setEducation(education.filter((e) => e.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        alert(t("failedDelete"));
      }
    } catch (error) {
      console.error("Failed to delete education:", error);
      alert(t("failedDelete"));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
          </div>
          <Button className="gap-2" onClick={() => { setEditingEducation(null); setFormData(emptyForm()); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            {t("addNew")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("entriesCount", { count: education.length })} {t("inPortfolio")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEducation ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t("loading")}</p>
              </div>
            ) : fetchError ? (
              <div className="text-center py-12">
                <p className="text-destructive font-medium mb-2">{t("errorLoading")}</p>
                <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
                <Button variant="outline" onClick={() => fetchEducation()}>
                  {t("retry")}
                </Button>
              </div>
            ) : education.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("empty")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 border border-border rounded-lg hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {edu.degreeEn}
                        </h3>
                        <p className="text-base font-medium text-foreground mb-2">
                          {edu.institutionEn}
                        </p>
                        {edu.fieldEn && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {edu.fieldEn}
                          </p>
                        )}
                        {edu.descriptionEn && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {edu.descriptionEn}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {edu.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {edu.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(edu.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            })}
                            {" - "}
                            {edu.endDate
                              ? new Date(edu.endDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                  timeZone: "UTC",
                                })
                              : t("present")}
                          </div>
                          {edu.gpa && (
                            <div className="text-sm text-muted-foreground">
                              GPA: {edu.gpa}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(edu)}
                          aria-label="Edit education"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteConfirm({ id: edu.id, name: `${edu.degreeEn} at ${edu.institutionEn}` })}
                          aria-label="Delete education"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Education Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-4xl w-[85vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEducation ? t("edit") : t("add")}</DialogTitle>
            <DialogDescription>
              {editingEducation ? t("editDescription") : t("addDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="institutionEn" className="text-sm font-medium text-foreground">
                  Institution (English) *
                </label>
                <Input
                  id="institutionEn"
                  placeholder="School or University name"
                  value={formData.institutionEn}
                  onChange={(e) => setFormData({ ...formData, institutionEn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="institutionAr" className="text-sm font-medium text-foreground">
                  {t("institutionAr")}
                </label>
                <Input
                  id="institutionAr"
                  placeholder="Nom de l'établissement"
                  value={formData.institutionAr}
                  onChange={(e) => setFormData({ ...formData, institutionAr: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="degreeEn" className="text-sm font-medium text-foreground">
                  Degree (English) *
                </label>
                <Input
                  id="degreeEn"
                  placeholder="e.g., Bachelor's, Master's"
                  value={formData.degreeEn}
                  onChange={(e) => setFormData({ ...formData, degreeEn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="degreeAr" className="text-sm font-medium text-foreground">
                  {t("degreeAr")}
                </label>
                <Input
                  id="degreeAr"
                  placeholder="e.g., Baccalauréat, Maîtrise"
                  value={formData.degreeAr}
                  onChange={(e) => setFormData({ ...formData, degreeAr: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="fieldEn" className="text-sm font-medium text-foreground">
                  Field of Study (English)
                </label>
                <Input
                  id="fieldEn"
                  placeholder="e.g., Computer Science"
                  value={formData.fieldEn}
                  onChange={(e) => setFormData({ ...formData, fieldEn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fieldAr" className="text-sm font-medium text-foreground">
                  {t("fieldAr")}
                </label>
                <Input
                  id="fieldAr"
                  placeholder="e.g., Informatique"
                  value={formData.fieldAr}
                  onChange={(e) => setFormData({ ...formData, fieldAr: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-foreground">
                Location *
              </label>
              <Input
                id="location"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                  {t("startDate")} *
                </label>
                <Input
                  id="startDate"
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium text-foreground">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
<label htmlFor="gpa" className="text-sm font-medium text-foreground">
              {t("gpa")}
            </label>
              <Input
                id="gpa"
                placeholder="e.g., 3.8/4.0"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="descriptionEn" className="text-sm font-medium text-foreground">
                  {t("descriptionEn")}
                </label>
                <Textarea
                  id="descriptionEn"
                  placeholder="Describe your education..."
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={10}
                  className="min-h-[260px] resize-y"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="descriptionAr" className="text-sm font-medium text-foreground">
                  Description (French)
                </label>
                <Textarea
                  id="descriptionAr"
                  placeholder="Décrivez votre formation..."
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={10}
                  className="min-h-[260px] resize-y"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? tCommon("loading") : editingEducation ? t("edit") : t("add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfirm")}</DialogTitle>
            <DialogDescription>
              {deleteConfirm ? t("deleteConfirmMessage", { name: deleteConfirm.name }) : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
