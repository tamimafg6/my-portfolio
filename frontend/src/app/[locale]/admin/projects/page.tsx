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
import { FolderKanban, Plus, ExternalLink, Github, Edit, Trash2 } from "lucide-react";

interface Project {
  id: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string | null;
  url: string | null;
  githubUrl: string | null;
  technologies: string;
  featured: boolean;
  order: number;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.projectsPage");
  const tCommon = useTranslations("common");
  const { authorized, loading } = useAdminAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    technologies: "",
    githubUrl: "",
    url: "",
    featured: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch projects:", res.status);
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (authorized) {
      fetchProjects();
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
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    technologies: "",
    githubUrl: "",
    url: "",
    featured: false,
  });

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      titleEn: project.titleEn,
      titleAr: project.titleAr || "",
      descriptionEn: project.descriptionEn || "",
      descriptionAr: project.descriptionAr || "",
      technologies: project.technologies || "",
      githubUrl: project.githubUrl || "",
      url: project.url || "",
      featured: project.featured ?? false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData(emptyForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        titleEn: formData.titleEn,
        titleAr: formData.titleAr || formData.titleEn,
        descriptionEn: formData.descriptionEn,
        descriptionAr: formData.descriptionAr || formData.descriptionEn,
        technologies: formData.technologies,
        githubUrl: formData.githubUrl || null,
        url: formData.url || null,
        featured: formData.featured,
        order: editingProject ? editingProject.order : projects.length,
      };
      if (editingProject) {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setProjects(projects.map((p) => (p.id === editingProject.id ? updated : p)));
          closeModal();
        } else {
          const err = await res.json();
          alert(err.error || t("failedUpdate"));
        }
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const newProject = await res.json();
          setProjects([...projects, newProject]);
          closeModal();
        } else {
          const error = await res.json();
          alert(error.error || t("failedCreate"));
        }
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      alert(t("failedSave"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/projects/${deleteConfirm.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        alert(t("failedDelete"));
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
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
          <Button className="gap-2" onClick={() => { setEditingProject(null); setFormData(emptyForm()); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            {t("addNew")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("title").replace(" Management", "")}</CardTitle>
            <CardDescription>
              {t("projectsCount", { count: projects.length })} {t("inPortfolio")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t("loading")}</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FolderKanban className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("empty")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border border-border rounded-lg hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {locale === "fr" ? (project.titleAr || project.titleEn) : project.titleEn}
                          </h3>
                          {project.featured && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                              {t("featured")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {locale === "fr" ? (project.descriptionAr || project.descriptionEn) : project.descriptionEn}
                        </p>
                        {project.technologies && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.technologies
                              .split(",")
                              .slice(0, 5)
                              .map((tech: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-blue-500/10 text-blue-500 rounded border border-blue-500/20"
                                >
                                  {tech.trim()}
                                </span>
                              ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-500"
                            >
                              <Github className="w-4 h-4" />
                              GitHub
                            </a>
                          )}
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-500"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditModal(project)}
                          aria-label="Edit project"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteConfirm({ id: project.id, name: locale === "fr" ? (project.titleAr || project.titleEn) : project.titleEn })}
                          aria-label="Delete project"
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

      {/* Add/Edit Project Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-4xl w-[85vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? t("edit") : t("addNew")}</DialogTitle>
            <DialogDescription>
              {editingProject ? t("edit") : t("add")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="titleEn" className="text-sm font-medium text-foreground">
                  {t("titleEn")} *
                </label>
                <Input
                  id="titleEn"
                  placeholder="e.g., E-commerce Platform"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="titleAr" className="text-sm font-medium text-foreground">
                  {t("titleAr")}
                </label>
                <Input
                  id="titleAr"
                  placeholder="e.g., Plateforme E-commerce"
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="descriptionEn" className="text-sm font-medium text-foreground">
                  {t("descriptionEn")} *
                </label>
                <Textarea
                  id="descriptionEn"
                  placeholder="Describe your project in English..."
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={10}
                  className="min-h-[260px] resize-y"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="descriptionAr" className="text-sm font-medium text-foreground">
                  {t("descriptionAr")}
                </label>
                <Textarea
                  id="descriptionAr"
                  placeholder="Décrivez votre projet en français..."
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={10}
                  className="min-h-[260px] resize-y"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="technologies" className="text-sm font-medium text-foreground">
                {t("technologies")} *
              </label>
              <Input
                id="technologies"
                placeholder="e.g., React, TypeScript, Node.js (comma-separated)"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="githubUrl" className="text-sm font-medium text-foreground">
                  {t("githubUrl")}
                </label>
                <Input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium text-foreground">
                  {t("url")}
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="featured" className="text-sm font-medium text-foreground">
                {t("featured")}
              </label>
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
                {isSubmitting ? t("saving") : editingProject ? tCommon("save") : t("add")}
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
              {deleteConfirm
                ? `"${deleteConfirm.name}"`
                : ""}
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
