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
  Clock,
  Activity,
  Plus,
  BarChart3,
  Calendar,
  Zap,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  projects: number;
  skills: number;
  experience: number;
  education: number;
  recentProjects?: any[];
  recentSkills?: any[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const { authorized, loading } = useAdminAccess();
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    skills: 0,
    experience: 3,
    education: 2,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !authorized) {
      router.push(`/${locale}/admin/login`);
    }
  }, [authorized, loading, router, locale]);

  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Fetch projects
        const projectsRes = await fetch("/api/projects");
        const projectsData = projectsRes.ok ? await projectsRes.json() : [];
        
        // Fetch skills
        const skillsRes = await fetch("/api/skills");
        const skillsData = skillsRes.ok ? await skillsRes.json() : [];
        
        setStats({
          projects: Array.isArray(projectsData) ? projectsData.length : 0,
          skills: Array.isArray(skillsData) ? skillsData.length : 0,
          experience: 3,
          education: 2,
          recentProjects: Array.isArray(projectsData) ? projectsData.slice(0, 3) : [],
          recentSkills: Array.isArray(skillsData) ? skillsData.slice(0, 5) : [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (authorized) {
      fetchStats();
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
      route: "/admin/projects",
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
      route: "/admin/skills",
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
      route: "/admin/experience",
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
      route: "/admin/education",
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
      route: "/admin/settings",
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
      route: "/",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <ScrollAnimation animation="fade-in" delay={0}>
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm sm:text-base flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Portfolio Management Center
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Portfolio
                </Button>
                <Button
                  onClick={() => router.push("/admin/projects")}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
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
                {isLoadingStats ? (
                  <div className="h-12 flex items-center">
                    <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stats.projects}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      Active Projects
                    </p>
                  </>
                )}
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
                {isLoadingStats ? (
                  <div className="h-12 flex items-center">
                    <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stats.skills}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      Skills Listed
                    </p>
                  </>
                )}
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

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <ScrollAnimation animation="slide-up" delay={0.3}>
            <Card className="lg:col-span-1 border-border/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <CardTitle>Quick Actions</CardTitle>
                </div>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => router.push("/admin/projects")}
                  >
                    <Plus className="w-4 h-4" />
                    Add New Project
                  </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/admin/skills")}
                >
                  <Code className="w-4 h-4" />
                  Manage Skills
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/admin/experience")}
                >
                  <Briefcase className="w-4 h-4" />
                  Update Experience
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/admin/education")}
                >
                  <GraduationCap className="w-4 h-4" />
                  Edit Education
                </Button>
              </CardContent>
            </Card>
          </ScrollAnimation>

          {/* Recent Projects */}
          <ScrollAnimation animation="slide-up" delay={0.35}>
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <CardTitle>Recent Projects</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/admin/projects")}
                    className="gap-2"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>Your latest portfolio projects</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : stats.recentProjects && stats.recentProjects.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentProjects.map((project: any, index: number) => (
                      <div
                        key={project.id || index}
                        className="p-3 rounded-lg border border-border/50 hover:border-blue-500/50 transition-colors cursor-pointer group"
                        onClick={() => router.push("/admin/projects")}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                              {project.name || project.title || "Untitled Project"}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {project.description || "No description"}
                            </p>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-green-500 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No projects yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 gap-2"
                      onClick={() => router.push("/admin/projects")}
                    >
                      <Plus className="w-4 h-4" />
                      Create First Project
                    </Button>
                  </div>
                )}
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

        {/* Performance Metrics & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Performance Overview */}
          <ScrollAnimation animation="slide-up" delay={0.5}>
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  <CardTitle>Performance Overview</CardTitle>
                </div>
                <CardDescription>Portfolio engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Portfolio Views</p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-500">1.2K</p>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Target className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Completion Rate</p>
                        <p className="text-xs text-muted-foreground">Profile completeness</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-500">85%</p>
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Activity className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Last Updated</p>
                        <p className="text-xs text-muted-foreground">Recent activity</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">2 days ago</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Active
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimation>

          {/* Recent Activity Timeline */}
          <ScrollAnimation animation="slide-up" delay={0.55}>
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <CardTitle>Recent Activity</CardTitle>
                </div>
                <CardDescription>Your latest portfolio updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="w-px h-full bg-border mt-2"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-foreground">New Project Added</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added "E-commerce Platform" to portfolio
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        2 hours ago
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="w-px h-full bg-border mt-2"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-foreground">Skills Updated</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Added React, TypeScript, and Next.js skills
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        1 day ago
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <div className="w-px h-full bg-border mt-2"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-foreground">Experience Updated</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated work experience details
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        3 days ago
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Profile Published</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Portfolio made public
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        1 week ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimation>
        </div>

        {/* Tips & Recommendations */}
        <ScrollAnimation animation="fade-in" delay={0.6}>
          <Card className="mt-8 border-border/50 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <CardTitle>Tips & Recommendations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Keep Projects Updated</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Regularly update your projects with latest technologies and achievements
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Add More Skills</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Consider adding more technical skills to showcase your expertise
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollAnimation>
      </div>
    </div>
  );
}
