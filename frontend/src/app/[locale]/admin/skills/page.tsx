"use client";

import { useEffect, useState, useRef } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Code, Plus, Edit, Trash2, ChevronDown } from "lucide-react";
import { SKILL_ICON_OPTIONS, getSkillIconById } from "@/lib/skill-icons";

interface Skill {
  id: number;
  nameEn: string;
  nameAr: string;
  category: string;
  level: number;
  icon: string | null;
  order: number;
}

const CATEGORY_TO_KEY: Record<string, string> = {
  "Programming Languages": "categoryProgrammingLanguages",
  "Frameworks": "categoryFrameworks",
  "Databases & Cloud": "categoryDatabasesAndCloud",
  "Tools": "categoryTools",
  "Operating Systems": "categoryOperatingSystems",
  "Databases": "categoryDatabases",
  "Cloud": "categoryCloud",
  "DevOps": "categoryDevOps",
  "Other": "categoryOther",
};

export default function AdminSkillsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.skillsPage");
  const tCommon = useTranslations("common");
  const { authorized, loading } = useAdminAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    category: "",
    level: 0,
    icon: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const iconDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!iconDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(e.target as Node)) {
        setIconDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [iconDropdownOpen]);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoadingSkills(true);
        const res = await fetch("/api/skills");
        if (res.ok) {
          const data = await res.json();
          setSkills(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch skills:", res.status);
          setSkills([]);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        setSkills([]);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    if (authorized) {
      fetchSkills();
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

  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      nameEn: skill.nameEn,
      nameAr: skill.nameAr || "",
      category: skill.category,
      level: skill.level,
      icon: skill.icon || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSkill(null);
    setIconDropdownOpen(false);
    setFormData({ nameEn: "", nameAr: "", category: "", level: 0, icon: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const level = Math.min(5, Math.max(1, formData.level || 1));
      if (editingSkill) {
        const res = await fetch(`/api/skills/${editingSkill.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            nameEn: formData.nameEn,
            nameAr: formData.nameAr || formData.nameEn,
            category: formData.category,
            level,
            icon: formData.icon || null,
            order: editingSkill.order,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setSkills(skills.map((s) => (s.id === editingSkill.id ? updated : s)));
          closeModal();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to update skill.");
        }
      } else {
        const res = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            nameEn: formData.nameEn,
            nameAr: formData.nameAr || formData.nameEn,
            category: formData.category,
            level,
            icon: formData.icon || null,
            order: skills.length,
          }),
        });
        if (res.ok) {
          const newSkill = await res.json();
          setSkills([...skills, newSkill]);
          closeModal();
        } else {
          const error = await res.json();
          alert(error.error || t("failedCreate"));
        }
      }
    } catch (error) {
      console.error("Failed to save skill:", error);
      alert("Failed to save skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/skills/${deleteConfirm.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSkills(skills.filter((s) => s.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        alert(t("failedDelete"));
      }
    } catch (error) {
      console.error("Failed to delete skill:", error);
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
          <Button className="gap-2" onClick={() => { setEditingSkill(null); setFormData({ nameEn: "", nameAr: "", category: "", level: 0, icon: "" }); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            {t("addNew")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("skillsCount", { count: skills.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSkills ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t("loading")}</p>
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("empty")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 border border-border rounded-lg hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {locale === "fr" ? (skill.nameAr || skill.nameEn) : skill.nameEn}
                          </h3>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            {CATEGORY_TO_KEY[skill.category] ? t(CATEGORY_TO_KEY[skill.category]) : skill.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{t("level")}:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= skill.level
                                    ? "text-yellow-500"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(skill)}
                          aria-label="Edit skill"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteConfirm({ id: skill.id, name: locale === "fr" ? (skill.nameAr || skill.nameEn) : skill.nameEn })}
                          aria-label="Delete skill"
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

      {/* Add/Edit Skill Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? t("edit") : t("addNew")}</DialogTitle>
            <DialogDescription>
              {t("subtitle")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="nameEn" className="text-sm font-medium text-foreground">
                  {t("nameEn")} *
                </label>
                <Input
                  id="nameEn"
                  placeholder="e.g., React, TypeScript"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="nameAr" className="text-sm font-medium text-foreground">
                  {t("nameAr")}
                </label>
                <Input
                  id="nameAr"
                  placeholder="e.g., React, TypeScript"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-foreground">
                {t("category")} *
              </label>
              <Input
                id="category"
                placeholder="e.g., Frontend, Backend, Database"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Icon
              </label>
              <div className="flex items-center gap-3" ref={iconDropdownRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIconDropdownOpen((v) => !v)}
                    className="flex h-9 min-w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <span>
                      {formData.icon
                        ? SKILL_ICON_OPTIONS.find((o) => o.id === formData.icon)?.label ?? "Default (first letter)"
                        : "Default (first letter)"}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </button>
                  {iconDropdownOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[200px] overflow-auto rounded-md border border-border bg-background py-1 text-foreground shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((f) => ({ ...f, icon: "" }));
                          setIconDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Default (first letter)
                      </button>
                      {SKILL_ICON_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setFormData((f) => ({ ...f, icon: opt.id }));
                            setIconDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${formData.icon === opt.id ? "bg-accent/50" : ""}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.icon && getSkillIconById(formData.icon) && (
                  <div className="flex h-9 w-9 shrink-0 scale-75 origin-left items-center justify-center rounded border border-border bg-muted/50 text-foreground">
                    {getSkillIconById(formData.icon)}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Proficiency Level (1–5 stars) *
              </label>
              <div className="flex items-center gap-1" role="group" aria-label="Proficiency level">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, level: star })}
                    className="text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-0.5"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    title={`${star} / 5`}
                  >
                    <span className={star <= (formData.level || 0) ? "text-yellow-500" : "text-muted-foreground/40"}>
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {formData.level || 0}/5
                </span>
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
                {isSubmitting ? tCommon("loading") : editingSkill ? t("edit") : t("add")}
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
