"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import { useAdminApi } from "@/lib/hooks/useAdminApi";
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
import { Briefcase, Plus, Edit, Trash2, MapPin, Calendar } from "lucide-react";

interface Experience {
  id: number;
  companyEn: string;
  companyAr: string;
  positionEn: string;
  positionAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  location: string | null;
  order: number;
}

export default function AdminExperiencePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.experiencePage");
  const tCommon = useTranslations("common");
  const { authorized, loading } = useAdminAccess();
  const { get, post, put, del } = useAdminApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyEn: "",
    companyAr: "",
    positionEn: "",
    positionAr: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    descriptionEn: "",
    descriptionAr: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  const fetchExperiences = async () => {
    try {
      setIsLoadingExperiences(true);
      setFetchError(null);
      const { data, error } = await get<Experience[]>("/experience");
      if (data && Array.isArray(data)) {
        setExperiences(data);
      } else {
        setExperiences([]);
        const message = error || "Invalid response";
        setFetchError(message);
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
      setExperiences([]);
      setFetchError("Could not reach the server. Is the backend running?");
    } finally {
      setIsLoadingExperiences(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchExperiences();
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
    companyEn: "",
    companyAr: "",
    positionEn: "",
    positionAr: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    descriptionEn: "",
    descriptionAr: "",
  });

  const openEditModal = (exp: Experience) => {
    setEditingExperience(exp);
    setFormData({
      companyEn: exp.companyEn,
      companyAr: exp.companyAr || "",
      positionEn: exp.positionEn,
      positionAr: exp.positionAr || "",
      location: exp.location || "",
      startDate: exp.startDate ? String(exp.startDate).slice(0, 7) : "",
      endDate: exp.endDate ? String(exp.endDate).slice(0, 7) : "",
      isCurrent: exp.isCurrent ?? false,
      descriptionEn: exp.descriptionEn || "",
      descriptionAr: exp.descriptionAr || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExperience(null);
    setFormData(emptyForm());
  };

  const buildPayload = () => ({
    companyEn: formData.companyEn,
    companyAr: formData.companyAr || formData.companyEn,
    positionEn: formData.positionEn,
    positionAr: formData.positionAr || formData.positionEn,
    location: formData.location || null,
    startDate: new Date(formData.startDate + "-01").toISOString(),
    endDate: formData.isCurrent ? null : (formData.endDate ? new Date(formData.endDate + "-01").toISOString() : null),
    isCurrent: formData.isCurrent,
    descriptionEn: formData.descriptionEn || null,
    descriptionAr: formData.descriptionAr || null,
    order: editingExperience ? editingExperience.order : experiences.length,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (editingExperience) {
        const { data: updated, error } = await put<Experience>(`/experience/${editingExperience.id}`, payload);
        if (updated) {
          setExperiences(experiences.map((ex) => (ex.id === editingExperience.id ? updated : ex)));
          closeModal();
        } else {
          alert(error || "Failed to update experience.");
        }
      } else {
        const { data: newExperience, error } = await post<Experience>("/experience", payload);
        if (newExperience) {
          setExperiences([...experiences, newExperience]);
          closeModal();
        } else {
          alert(error || t("failedCreate"));
        }
      }
    } catch (error) {
      console.error("Failed to save experience:", error);
      alert("Failed to save experience.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      const { error } = await del(`/experience/${deleteConfirm.id}`);
      if (!error) {
        setExperiences(experiences.filter((e) => e.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        alert(t("failedDelete"));
      }
    } catch (error) {
      console.error("Failed to delete experience:", error);
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
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            {t("addNew")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("entriesCount", { count: experiences.length })} {t("inPortfolio")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingExperiences ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t("loading")}</p>
              </div>
            ) : fetchError ? (
              <div className="text-center py-12">
                <p className="text-destructive font-medium mb-2">{t("errorLoading")}</p>
                <p className="text-sm text-muted-foreground mb-4">{fetchError}</p>
                <Button variant="outline" onClick={() => fetchExperiences()}>
                  {t("retry")}
                </Button>
              </div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("empty")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 border border-border rounded-lg hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {locale === "fr" ? (exp.positionAr || exp.positionEn) : exp.positionEn}
                          </h3>
                          {exp.isCurrent && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                              {t("current")}
                            </span>
                          )}
                        </div>
                        <p className="text-base font-medium text-foreground mb-2">
                          {locale === "fr" ? (exp.companyAr || exp.companyEn) : exp.companyEn}
                        </p>
                        {(locale === "fr" ? exp.descriptionAr : exp.descriptionEn) && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {locale === "fr" ? (exp.descriptionAr || exp.descriptionEn) : exp.descriptionEn}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {exp.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {exp.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(exp.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            })}
                            {" - "}
                            {exp.isCurrent
                              ? t("present")
                              : exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                  timeZone: "UTC",
                                })
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(exp)}
                          aria-label="Edit experience"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteConfirm({ id: exp.id, name: `${locale === "fr" ? (exp.positionAr || exp.positionEn) : exp.positionEn} - ${locale === "fr" ? (exp.companyAr || exp.companyEn) : exp.companyEn}` })}
                          aria-label="Delete experience"
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

      {/* Add/Edit Experience Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-4xl w-[85vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExperience ? t("edit") : t("addNew")}</DialogTitle>
            <DialogDescription>{t("subtitle")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="companyEn" className="text-sm font-medium text-foreground">
                  {t("companyEn")} *
                </label>
                <Input
                  id="companyEn"
                  placeholder="Company name"
                  value={formData.companyEn}
                  onChange={(e) => setFormData({ ...formData, companyEn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="companyAr" className="text-sm font-medium text-foreground">
                  Company (French)
                </label>
                <Input
                  id="companyAr"
                  placeholder="Nom de l'entreprise"
                  value={formData.companyAr}
                  onChange={(e) => setFormData({ ...formData, companyAr: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="positionEn" className="text-sm font-medium text-foreground">
                  {t("positionEn")} *
                </label>
                <Input
                  id="positionEn"
                  placeholder="Job title"
                  value={formData.positionEn}
                  onChange={(e) => setFormData({ ...formData, positionEn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="positionAr" className="text-sm font-medium text-foreground">
                  Position (French)
                </label>
                <Input
                  id="positionAr"
                  placeholder="Titre du poste"
                  value={formData.positionAr}
                  onChange={(e) => setFormData({ ...formData, positionAr: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-foreground">
                {t("location")} *
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
                  Start Date *
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
                  {t("endDate")}
                </label>
                <Input
                  id="endDate"
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isCurrent}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isCurrent"
                checked={formData.isCurrent}
                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked, endDate: "" })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isCurrent" className="text-sm font-medium text-foreground">
                Currently working here
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="descriptionEn" className="text-sm font-medium text-foreground">
                  {t("descriptionEn")}
                </label>
                <Textarea
                  id="descriptionEn"
                  placeholder="Describe your role and achievements..."
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
                  placeholder="Décrivez votre rôle et vos réalisations..."
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
                {isSubmitting ? tCommon("loading") : editingExperience ? t("edit") : t("add")}
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
