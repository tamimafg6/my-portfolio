"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
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
import { GraduationCap, Plus } from "lucide-react";

export default function AdminEducationPage() {
  const router = useRouter();
  const locale = useLocale();
  const { authorized, loading } = useAdminAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    coursework: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

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
      // TODO: Add API call to create education
      console.log("Creating education:", formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      setFormData({
        institution: "",
        degree: "",
        field: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        coursework: "",
      });
      setIsModalOpen(false);
      
      // TODO: Refresh education list
    } catch (error) {
      console.error("Failed to create education:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Education Management</h1>
            <p className="text-muted-foreground mt-2">Manage your educational background</p>
          </div>
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Education
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Your education entries will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No education entries yet. Add your first education entry to get started.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Education Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
            <DialogDescription>
              Add a new education entry to your portfolio
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="institution" className="text-sm font-medium text-foreground">
                Institution *
              </label>
              <Input
                id="institution"
                placeholder="School or University name"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="degree" className="text-sm font-medium text-foreground">
                  Degree *
                </label>
                <Input
                  id="degree"
                  placeholder="e.g., Bachelor's, Master's"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="field" className="text-sm font-medium text-foreground">
                  Field of Study *
                </label>
                <Input
                  id="field"
                  placeholder="e.g., Computer Science"
                  value={formData.field}
                  onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                  required
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
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="month"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.current}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current"
                checked={formData.current}
                onChange={(e) => setFormData({ ...formData, current: e.target.checked, endDate: "" })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="current" className="text-sm font-medium text-foreground">
                Currently studying
              </label>
            </div>
            <div className="space-y-2">
              <label htmlFor="coursework" className="text-sm font-medium text-foreground">
                Relevant Coursework
              </label>
              <Textarea
                id="coursework"
                placeholder="List relevant courses (comma-separated)"
                value={formData.coursework}
                onChange={(e) => setFormData({ ...formData, coursework: e.target.value })}
                rows={3}
              />
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
                {isSubmitting ? "Adding..." : "Add Education"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
