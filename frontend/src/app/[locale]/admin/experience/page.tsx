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
import { Briefcase, Plus } from "lucide-react";

export default function AdminExperiencePage() {
  const router = useRouter();
  const locale = useLocale();
  const { authorized, loading } = useAdminAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    summary: "",
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
      // TODO: Add API call to create experience
      console.log("Creating experience:", formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Reset form and close modal
      setFormData({
        company: "",
        position: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        summary: "",
      });
      setIsModalOpen(false);
      
      // TODO: Refresh experience list
    } catch (error) {
      console.error("Failed to create experience:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Experience Management</h1>
            <p className="text-muted-foreground mt-2">Manage your work experience</p>
          </div>
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Experience
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>Your work experience entries will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No experience entries yet. Add your first work experience to get started.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Experience Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Work Experience</DialogTitle>
            <DialogDescription>
              Add a new work experience entry to your portfolio
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium text-foreground">
                  Company *
                </label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium text-foreground">
                  Position *
                </label>
                <Input
                  id="position"
                  placeholder="Job title"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                Currently working here
              </label>
            </div>
            <div className="space-y-2">
              <label htmlFor="summary" className="text-sm font-medium text-foreground">
                Summary *
              </label>
              <Textarea
                id="summary"
                placeholder="Describe your role and achievements..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={4}
                required
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
                {isSubmitting ? "Adding..." : "Add Experience"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
