/**
 * Single source of truth for skill icons.
 *
 * To add a new icon later:
 * 1. Add to ICONS_BY_ID: pick a stable id (e.g. "python") and the React node (icon or custom div).
 * 2. Add to SKILL_ICON_OPTIONS: { id: "python", label: "Python" }.
 * 3. Optionally add to NAME_TO_ID if you want name-based fallback (e.g. Python: "python").
 * The admin picker and public page will use it automatically.
 */
import React from "react";
import {
  SiTypescript,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiSpringboot,
  SiPostgresql,
  SiDocker,
  SiGit,
  SiGithub,
  SiLinux,
  SiPython,
  SiGo,
  SiRust,
  SiHtml5,
  SiCss3,
  SiMongodb,
  SiRedis,
  SiGraphql,
  SiAmazonwebservices,
  SiVercel,
  SiFigma,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiPrisma,
  SiFirebase,
  SiKubernetes,
  SiNginx,
  SiJest,
  SiCypress,
  SiSwift,
  SiRuby,
  SiPhp,
  SiDotnet,
  SiGradle,
  SiTerraform,
  SiJira,
  SiSlack,
  SiTrello,
  SiPostman,
} from "react-icons/si";
import { FaJava, FaNode } from "react-icons/fa6";

const iconClass = "w-12 h-12";

/** Icons by stable id (stored in DB). Use these ids in Admin when picking an icon. */
export const ICONS_BY_ID: Record<string, React.ReactNode> = {
  java: <FaJava className={iconClass} />,
  "c-sharp": (
    <div className={`${iconClass} flex items-center justify-center font-bold text-purple-500 text-lg`}>#</div>
  ),
  kotlin: (
    <div className={`${iconClass} flex items-center justify-center font-bold text-purple-600`}>K</div>
  ),
  javascript: <SiJavascript className={iconClass} />,
  sql: (
    <div className={`${iconClass} flex items-center justify-center text-xl font-bold`}>SQL</div>
  ),
  "spring-boot": <SiSpringboot className={iconClass} />,
  "asp-net-mvc": (
    <div className={`${iconClass} flex items-center justify-center text-sm font-bold`}>ASP</div>
  ),
  "next-js": <SiNextdotjs className={iconClass} />,
  "sql-server": (
    <div className={`${iconClass} flex items-center justify-center text-xs font-bold`}>MSSQL</div>
  ),
  "azure-sql": (
    <div className={`${iconClass} flex items-center justify-center text-xs font-bold`}>Azure</div>
  ),
  docker: <SiDocker className={iconClass} />,
  "git-github": <SiGit className={iconClass} />,
  "intellij-idea": (
    <div className={`${iconClass} flex items-center justify-center font-bold text-orange-600`}>I</div>
  ),
  "vs-code": (
    <div className={`${iconClass} flex items-center justify-center text-blue-500 font-bold`}>&lt;&gt;</div>
  ),
  linux: <SiLinux className={iconClass} />,
  react: <SiReact className={iconClass} />,
  typescript: <SiTypescript className={iconClass} />,
  "node-js": <FaNode className={iconClass} />,
  "express-js": (
    <div className={`${iconClass} flex items-center justify-center text-sm font-bold`}>EXP</div>
  ),
  postgresql: <SiPostgresql className={iconClass} />,
  "tailwind-css": <SiTailwindcss className={iconClass} />,
  // Extra common tech
  python: <SiPython className={iconClass} />,
  go: <SiGo className={iconClass} />,
  rust: <SiRust className={iconClass} />,
  "html5": <SiHtml5 className={iconClass} />,
  "css3": <SiCss3 className={iconClass} />,
  mongodb: <SiMongodb className={iconClass} />,
  redis: <SiRedis className={iconClass} />,
  graphql: <SiGraphql className={iconClass} />,
  aws: <SiAmazonwebservices className={iconClass} />,
  vercel: <SiVercel className={iconClass} />,
  figma: <SiFigma className={iconClass} />,
  vue: <SiVuedotjs className={iconClass} />,
  angular: <SiAngular className={iconClass} />,
  svelte: <SiSvelte className={iconClass} />,
  prisma: <SiPrisma className={iconClass} />,
  firebase: <SiFirebase className={iconClass} />,
  kubernetes: <SiKubernetes className={iconClass} />,
  nginx: <SiNginx className={iconClass} />,
  jest: <SiJest className={iconClass} />,
  cypress: <SiCypress className={iconClass} />,
  swift: <SiSwift className={iconClass} />,
  ruby: <SiRuby className={iconClass} />,
  php: <SiPhp className={iconClass} />,
  "dot-net": <SiDotnet className={iconClass} />,
  gradle: <SiGradle className={iconClass} />,
  terraform: <SiTerraform className={iconClass} />,
  jira: <SiJira className={iconClass} />,
  slack: <SiSlack className={iconClass} />,
  trello: <SiTrello className={iconClass} />,
  postman: <SiPostman className={iconClass} />,
  "visual-studio": (
    <div className={`${iconClass} flex items-center justify-center text-xs font-bold`}>VS</div>
  ),
  junit: (
    <div className={`${iconClass} flex items-center justify-center text-xs font-bold`}>JUnit</div>
  ),
  "spring-webflux": <SiSpringboot className={iconClass} />,
  "rest-apis": (
    <div className={`${iconClass} flex items-center justify-center text-xs font-bold`}>REST</div>
  ),
  "html-css": <SiHtml5 className={iconClass} />,
};

/** Fallback: map common nameEn values to icon id so existing skills without icon set still show the right icon. */
const NAME_TO_ID: Record<string, string> = {
  Java: "java",
  "C#": "c-sharp",
  Kotlin: "kotlin",
  JavaScript: "javascript",
  SQL: "sql",
  "Spring Boot": "spring-boot",
  "ASP.NET MVC": "asp-net-mvc",
  "Next.js": "next-js",
  "SQL Server": "sql-server",
  "Azure SQL": "azure-sql",
  Docker: "docker",
  "Git & GitHub": "git-github",
  "IntelliJ IDEA": "intellij-idea",
  "VS Code": "vs-code",
  Linux: "linux",
  React: "react",
  TypeScript: "typescript",
  "Node.js": "node-js",
  "Express.js": "express-js",
  PostgreSQL: "postgresql",
  "Tailwind CSS": "tailwind-css",
  Python: "python",
  Go: "go",
  Rust: "rust",
  "HTML5": "html5",
  "CSS3": "css3",
  MongoDB: "mongodb",
  Redis: "redis",
  GraphQL: "graphql",
  AWS: "aws",
  Vercel: "vercel",
  Figma: "figma",
  Vue: "vue",
  "Vue.js": "vue",
  Angular: "angular",
  Svelte: "svelte",
  Prisma: "prisma",
  Firebase: "firebase",
  Kubernetes: "kubernetes",
  Nginx: "nginx",
  Jest: "jest",
  Cypress: "cypress",
  Swift: "swift",
  Ruby: "ruby",
  PHP: "php",
  ".NET": "dot-net",
  Gradle: "gradle",
  Terraform: "terraform",
  Jira: "jira",
  Slack: "slack",
  Trello: "trello",
  Postman: "postman",
  "Visual Studio": "visual-studio",
  JUnit: "junit",
  "Spring WebFlux": "spring-webflux",
  "REST APIs": "rest-apis",
  "HTML/CSS": "html-css",
};

/** Ordered list for admin dropdown: id + label. Add new icons here when you add to ICONS_BY_ID. */
export const SKILL_ICON_OPTIONS: { id: string; label: string }[] = [
  { id: "java", label: "Java" },
  { id: "c-sharp", label: "C#" },
  { id: "kotlin", label: "Kotlin" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "react", label: "React" },
  { id: "next-js", label: "Next.js" },
  { id: "node-js", label: "Node.js" },
  { id: "express-js", label: "Express.js" },
  { id: "tailwind-css", label: "Tailwind CSS" },
  { id: "spring-boot", label: "Spring Boot" },
  { id: "asp-net-mvc", label: "ASP.NET MVC" },
  { id: "sql", label: "SQL" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "sql-server", label: "SQL Server" },
  { id: "azure-sql", label: "Azure SQL" },
  { id: "docker", label: "Docker" },
  { id: "git-github", label: "Git & GitHub" },
  { id: "linux", label: "Linux" },
  { id: "intellij-idea", label: "IntelliJ IDEA" },
  { id: "vs-code", label: "VS Code" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "html5", label: "HTML5" },
  { id: "css3", label: "CSS3" },
  { id: "mongodb", label: "MongoDB" },
  { id: "redis", label: "Redis" },
  { id: "graphql", label: "GraphQL" },
  { id: "aws", label: "AWS" },
  { id: "vercel", label: "Vercel" },
  { id: "figma", label: "Figma" },
  { id: "vue", label: "Vue.js" },
  { id: "angular", label: "Angular" },
  { id: "svelte", label: "Svelte" },
  { id: "prisma", label: "Prisma" },
  { id: "firebase", label: "Firebase" },
  { id: "kubernetes", label: "Kubernetes" },
  { id: "nginx", label: "Nginx" },
  { id: "jest", label: "Jest" },
  { id: "cypress", label: "Cypress" },
  { id: "swift", label: "Swift" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "dot-net", label: ".NET" },
  { id: "gradle", label: "Gradle" },
  { id: "terraform", label: "Terraform" },
  { id: "jira", label: "Jira" },
  { id: "slack", label: "Slack" },
  { id: "trello", label: "Trello" },
  { id: "postman", label: "Postman" },
  { id: "visual-studio", label: "Visual Studio" },
  { id: "junit", label: "JUnit" },
  { id: "spring-webflux", label: "Spring WebFlux" },
  { id: "rest-apis", label: "REST APIs" },
  { id: "html-css", label: "HTML/CSS" },
];

/** Resolve icon for a skill: use stored icon id, else fallback by nameEn, else null (caller shows letter fallback). */
export function getSkillIcon(skill: { icon?: string | null; nameEn: string }): React.ReactNode | null {
  const byId = skill.icon && ICONS_BY_ID[skill.icon];
  if (byId) return byId;
  const idFromName = NAME_TO_ID[skill.nameEn];
  if (idFromName) return ICONS_BY_ID[idFromName] ?? null;
  return null;
}

/** Get icon node by id (for admin preview). */
export function getSkillIconById(id: string): React.ReactNode | null {
  return ICONS_BY_ID[id] ?? null;
}
