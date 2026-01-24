"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
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
import ScrollAnimation from "@/components/ScrollAnimation";
import {
  FolderKanban,
  Code,
  Briefcase,
  GraduationCap,
  Settings,
  Eye,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const { authorized, loading } = useAdminAccess();
  const [stats] = useState({
    projects: 12,
    skills: 24,
    experience: 3,
    education: 2,
  });

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
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-600 dark:text-blue-400",
      route: `/${locale}/admin/projects`,
      count: stats.projects,
    },
    {
      id: "skills",
      title: "Skills",
      description: "Update your technical skills",
      icon: Code,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      textColor: "text-green-600 dark:text-green-400",
      route: `/${locale}/admin/skills`,
      count: stats.skills,
    },
    {
      id: "experience",
      title: "Experience",
      description: "Add or edit work experience",
      icon: Briefcase,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-600 dark:text-purple-400",
      route: `/${locale}/admin/experience`,
      count: stats.experience,
    },
    {
      id: "education",
      title: "Education",
      description: "Update educational background",
      icon: GraduationCap,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      textColor: "text-amber-600 dark:text-amber-400",
      route: `/${locale}/admin/education`,
      count: stats.education,
    },
    {
      id: "settings",
      title: "Settings",
      description: "Configure portfolio settings",
      icon: Settings,
      color: "from-gray-500 to-slate-500",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/20",
      textColor: "text-gray-600 dark:text-gray-400",
      route: `/${locale}/admin/settings`,
    },
    {
      id: "portfolio",
      title: "View Portfolio",
      description: "Preview your public portfolio",
      icon: Eye,
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      route: `/${locale}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <ScrollAnimation animation="fade-in" delay={0}>
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                  Welcome to your portfolio management dashboard
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <ScrollAnimation animation="slide-up" delay={0.1}>
            <Card className="border-border/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs sm:text-sm">
                    Total Projects
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FolderKanban className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stats.projects}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Active
                </p>
              </CardContent>
            </Card>
          </ScrollAnimation>

          <ScrollAnimation animation="slide-up" delay={0.15}>
            <Card className="border-border/50 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs sm:text-sm">
                    Skills
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Code className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stats.skills}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Listed
                </p>
              </CardContent>
            </Card>
          </ScrollAnimation>

          <ScrollAnimation animation="slide-up" delay={0.2}>
            <Card className="border-border/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs sm:text-sm">
                    Experience
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Briefcase className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stats.experience}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Entries
                </p>
              </CardContent>
            </Card>
          </ScrollAnimation>

          <ScrollAnimation animation="slide-up" delay={0.25}>
            <Card className="border-border/50 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs sm:text-sm">
                    Education
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {stats.education}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Records
                </p>
              </CardContent>
            </Card>
          </ScrollAnimation>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {dashboardItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <ScrollAnimation
                key={item.id}
                animation="slide-up"
                delay={0.3 + index * 0.1}
              >
                <Card
                  className={`group relative overflow-hidden border ${item.borderColor} bg-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                  onClick={() => router.push(item.route)}
                >
                  {/* Gradient Background Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {item.count !== undefined && (
                        <div className={`px-3 py-1 rounded-full ${item.bgColor} border ${item.borderColor}`}>
                          <span className={`text-sm font-semibold ${item.textColor}`}>
                            {item.count}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base mt-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative">
                    <Button
                      variant="default"
                      className={`w-full bg-gradient-to-r ${item.color} hover:opacity-90 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(item.route);
                      }}
                    >
                      {item.id === "portfolio" ? "View Portfolio" : `Manage ${item.title}`}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            );
          })}
        </div>
      </div>
    </div>
  );
}
