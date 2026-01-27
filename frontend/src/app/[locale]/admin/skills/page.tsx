"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
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
import { Code, Plus, Edit, Trash2 } from "lucide-react";

interface Skill {
  id: number;
  nameEn: string;
  nameAr: string;
  category: string;
  level: number;
  icon: string | null;
  order: number;
}

export default function AdminSkillsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { authorized, loading } = useAdminAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nameEn: formData.nameEn,
          nameAr: formData.nameAr || formData.nameEn,
          category: formData.category,
          level: formData.level,
          icon: formData.icon || "⭐",
          order: skills.length,
        }),
      });

      if (res.ok) {
        const newSkill = await res.json();
        setSkills([...skills, newSkill]);
        setFormData({ nameEn: "", nameAr: "", category: "", level: 0, icon: "" });
        setIsModalOpen(false);
      } else {
        const error = await res.json();
        console.error("Failed to create skill:", error);
        alert("Failed to create skill. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create skill:", error);
      alert("Failed to create skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Skills Management</h1>
            <p className="text-muted-foreground mt-2">Manage your technical skills</p>
          </div>
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add New Skill
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              {skills.length} {skills.length === 1 ? "skill" : "skills"} in your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSkills ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading skills...</p>
              </div>
            ) : skills.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No skills yet. Add your first skill to get started.</p>
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
                          <span className="text-xl">{skill.icon || "⭐"}</span>
                          <h3 className="text-lg font-semibold text-foreground">
                            {skill.nameEn}
                          </h3>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            {skill.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Level:</span>
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
                          onClick={() => {
                            // TODO: Implement edit functionality
                            console.log("Edit skill:", skill.id);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this skill?")) {
                              try {
                                const res = await fetch(`/api/skills/${skill.id}`, {
                                  method: "DELETE",
                                  credentials: "include",
                                });
                                if (res.ok) {
                                  setSkills(skills.filter((s) => s.id !== skill.id));
                                } else {
                                  alert("Failed to delete skill");
                                }
                              } catch (error) {
                                console.error("Failed to delete skill:", error);
                                alert("Failed to delete skill");
                              }
                            }
                          }}
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

      {/* Add Skill Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Add a new technical skill to your portfolio
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="nameEn" className="text-sm font-medium text-foreground">
                  Skill Name (English) *
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
                  Skill Name (French)
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
                Category *
              </label>
              <Input
                id="category"
                placeholder="e.g., Frontend, Backend, Database"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="level" className="text-sm font-medium text-foreground">
                  Proficiency Level (1-5) *
                </label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="5"
                  placeholder="1-5"
                  value={formData.level || ""}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="icon" className="text-sm font-medium text-foreground">
                  Icon (emoji)
                </label>
                <Input
                  id="icon"
                  placeholder="⭐"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Skill"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
