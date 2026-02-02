"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAdminAccess } from "@/lib/hooks/useAdminAccess";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Code,
  Briefcase,
  GraduationCap,
  Settings,
  Eye,
  ArrowRight,
  Plus,
  MessageSquare,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const tEdu = useTranslations("education");
  const { authorized, loading } = useAdminAccess();
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    experience: 0,
    education: 0,
    testimonials: 0,
  });
  const [experienceList, setExperienceList] = useState<
    { id: number; companyEn: string; positionEn: string; startDate: string; endDate: string | null; isCurrent: boolean }[]
  >([]);
  const [educationList, setEducationList] = useState<
    { id: number; institutionEn: string; degreeEn: string; fieldEn: string | null; startDate: string; endDate: string | null }[]
  >([]);

  // Fetch stats and experience/education data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projectsRes, skillsRes, experienceRes, educationRes, testimonialsRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/skills"),
          fetch("/api/experience"),
          fetch("/api/education"),
          fetch("/api/testimonials/admin", { credentials: "include" }),
        ]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setStats((prev) => ({ ...prev, projects: Array.isArray(data) ? data.length : 0 }));
        }
        if (skillsRes.ok) {
          const data = await skillsRes.json();
          setStats((prev) => ({ ...prev, skills: Array.isArray(data) ? data.length : 0 }));
        }
        if (experienceRes.ok) {
          const data = await experienceRes.json();
          const list = Array.isArray(data) ? data : [];
          setStats((prev) => ({ ...prev, experience: list.length }));
          setExperienceList(
            list.map((e: { id: number; companyEn: string; positionEn: string; startDate: string; endDate: string | null; isCurrent: boolean }) => ({
              id: e.id,
              companyEn: e.companyEn,
              positionEn: e.positionEn,
              startDate: e.startDate,
              endDate: e.endDate,
              isCurrent: e.isCurrent,
            }))
          );
        }
        if (educationRes.ok) {
          const data = await educationRes.json();
          const list = Array.isArray(data) ? data : [];
          setStats((prev) => ({ ...prev, education: list.length }));
          setEducationList(
            list.map((e: { id: number; institutionEn: string; degreeEn: string; fieldEn: string | null; startDate: string; endDate: string | null }) => ({
              id: e.id,
              institutionEn: e.institutionEn,
              degreeEn: e.degreeEn,
              fieldEn: e.fieldEn,
              startDate: e.startDate,
              endDate: e.endDate,
            }))
          );
        }
        if (testimonialsRes.ok) {
          const data = await testimonialsRes.json();
          setStats((prev) => ({ ...prev, testimonials: Array.isArray(data) ? data.length : 0 }));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (authorized) {
      fetchStats();
    }
  }, [authorized]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

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

  const dashboardItems = [
    {
      id: "projects",
      title: "Projects",
      description: "Manage your portfolio projects",
      icon: FolderKanban,
      route: "/admin/projects",
      count: stats.projects,
    },
    {
      id: "skills",
      title: "Skills",
      description: "Update your technical skills",
      icon: Code,
      route: "/admin/skills",
      count: stats.skills,
    },
    {
      id: "experience",
      title: "Experience",
      description: "Add or edit work experience",
      icon: Briefcase,
      route: "/admin/experience",
      count: stats.experience,
    },
    {
      id: "education",
      title: "Education",
      description: "Update educational background",
      icon: GraduationCap,
      route: "/admin/education",
      count: stats.education,
    },
    {
      id: "testimonials",
      title: "Testimonials",
      description: "Review and manage testimonials",
      icon: MessageSquare,
      route: "/admin/testimonials",
      count: stats.testimonials,
    },
    {
      id: "settings",
      title: "Settings",
      description: "Configure portfolio settings",
      icon: Settings,
      route: "/admin/settings",
    },
    {
      id: "portfolio",
      title: "View Portfolio",
      description: "Preview your public portfolio",
      icon: Eye,
      route: "/",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Overview of your portfolio content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-md">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium opacity-90">PROJECTS</p>
                <div className="p-3 bg-white/20 rounded-lg">
                  <FolderKanban className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.projects}</div>
              <p className="text-xs opacity-75">Active projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-md">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium opacity-90">SKILLS</p>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Code className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.skills}</div>
              <p className="text-xs opacity-75">Technical skills</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-md">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium opacity-90">EXPERIENCE</p>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.experience}</div>
              <p className="text-xs opacity-75">Work entries</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-md">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium opacity-90">EDUCATION</p>
                <div className="p-3 bg-white/20 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stats.education}</div>
              <p className="text-xs opacity-75">Education records</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions Card */}
          <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => router.push("/admin/projects")}
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Project</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => router.push("/admin/skills")}
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Skill</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => router.push("/admin/experience")}
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Experience</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => router.push("/admin/education")}
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Education</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => router.push("/admin/testimonials")}
                >
                  <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Testimonials</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => router.push("/")}
                >
                  <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Portfolio</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials Summary Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {stats.testimonials}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Total reviews
                </p>
                <Button
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push("/admin/testimonials")}
                >
                  Manage Testimonials
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experience & Education Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Experience */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Experience
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 dark:border-gray-700"
                onClick={() => router.push("/admin/experience")}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {experienceList.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No experience entries yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {experienceList.map((exp) => (
                    <li
                      key={exp.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => router.push("/admin/experience")}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {exp.positionEn}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {exp.companyEn}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(exp.startDate)}
                        {exp.isCurrent ? " – Present" : exp.endDate ? ` – ${formatDate(exp.endDate)}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Education
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 dark:border-gray-700"
                onClick={() => router.push("/admin/education")}
              >
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {educationList.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No education entries yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {educationList.map((edu) => (
                    <li
                      key={edu.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => router.push("/admin/education")}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {edu.degreeEn}
                        {edu.fieldEn ? ` ${tEdu("degreeFieldPreposition")} ${edu.fieldEn}` : ""}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {edu.institutionEn}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDate(edu.startDate)}
                        {edu.endDate ? ` – ${formatDate(edu.endDate)}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Sections */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardItems.filter(item => item.id !== "portfolio").map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => router.push(item.route)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                          <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {item.count !== undefined && (
                          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.count}
                          </span>
                        )}
                        <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
