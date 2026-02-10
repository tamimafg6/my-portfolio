import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const { db } = await import("./index.js");
const schema = await import("./schema/index.js");

/** Run full seed (clear + insert). Exported for seed-if-empty. */
export async function runSeed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.delete(schema.projects);
  await db.delete(schema.skills);
  await db.delete(schema.workExperience);
  await db.delete(schema.education);
  await db.delete(schema.contactInfo);
  await db.delete(schema.resume);
  await db.delete(schema.hobbies);

  // Seed skills — aligned with CV: categories, levels (5 = comfortable, 4 = familiar), icon ids, order
  await db.insert(schema.skills).values([
    // Programming Languages (Comfortable: 5, Familiar: 4)
    { nameEn: "Java", nameAr: "Java", category: "Programming Languages", level: 5, icon: "java", order: 0 },
    { nameEn: "C#", nameAr: "C#", category: "Programming Languages", level: 5, icon: "c-sharp", order: 1 },
    { nameEn: "Kotlin", nameAr: "Kotlin", category: "Programming Languages", level: 5, icon: "kotlin", order: 2 },
    { nameEn: "HTML/CSS", nameAr: "HTML/CSS", category: "Programming Languages", level: 5, icon: "html-css", order: 3 },
    { nameEn: "JavaScript", nameAr: "JavaScript", category: "Programming Languages", level: 5, icon: "javascript", order: 4 },
    { nameEn: "SQL", nameAr: "SQL", category: "Programming Languages", level: 5, icon: "sql", order: 5 },
    { nameEn: "PHP", nameAr: "PHP", category: "Programming Languages", level: 4, icon: "php", order: 6 },
    { nameEn: "Swift", nameAr: "Swift", category: "Programming Languages", level: 4, icon: "swift", order: 7 },
    // Frameworks
    { nameEn: "Spring Boot", nameAr: "Spring Boot", category: "Frameworks", level: 5, icon: "spring-boot", order: 0 },
    { nameEn: "Spring WebFlux", nameAr: "Spring WebFlux", category: "Frameworks", level: 4, icon: "spring-webflux", order: 1 },
    { nameEn: "ASP.NET MVC", nameAr: "ASP.NET MVC", category: "Frameworks", level: 5, icon: "asp-net-mvc", order: 2 },
    { nameEn: "JUnit", nameAr: "JUnit", category: "Frameworks", level: 5, icon: "junit", order: 3 },
    { nameEn: "Next.js", nameAr: "Next.js", category: "Frameworks", level: 5, icon: "next-js", order: 4 },
    { nameEn: "React", nameAr: "React", category: "Frameworks", level: 4, icon: "react", order: 5 },
    // Databases & Cloud (single category so section looks full)
    { nameEn: "SQL Server", nameAr: "SQL Server", category: "Databases & Cloud", level: 5, icon: "sql-server", order: 0 },
    { nameEn: "Azure SQL", nameAr: "Azure SQL", category: "Databases & Cloud", level: 5, icon: "azure-sql", order: 1 },
    { nameEn: "REST APIs", nameAr: "API REST", category: "Databases & Cloud", level: 5, icon: "rest-apis", order: 2 },
    { nameEn: "Postman", nameAr: "Postman", category: "Databases & Cloud", level: 5, icon: "postman", order: 3 },
    // Tools
    { nameEn: "Linux", nameAr: "Linux", category: "Tools", level: 5, icon: "linux", order: 0 },
    { nameEn: "Git & GitHub", nameAr: "Git & GitHub", category: "Tools", level: 5, icon: "git-github", order: 1 },
    { nameEn: "IntelliJ IDEA", nameAr: "IntelliJ IDEA", category: "Tools", level: 5, icon: "intellij-idea", order: 2 },
    { nameEn: "VS Code", nameAr: "VS Code", category: "Tools", level: 5, icon: "vs-code", order: 3 },
    { nameEn: "Visual Studio", nameAr: "Visual Studio", category: "Tools", level: 5, icon: "visual-studio", order: 4 },
    { nameEn: "Docker", nameAr: "Docker", category: "Tools", level: 5, icon: "docker", order: 5 },
    { nameEn: "Jira", nameAr: "Jira", category: "Tools", level: 4, icon: "jira", order: 6 },
    { nameEn: "Gradle", nameAr: "Gradle", category: "Tools", level: 4, icon: "gradle", order: 7 },
  ]);

  // Seed projects
  await db.insert(schema.projects).values([
    {
      titleEn: "Passion Jerseys Online Store",
      titleAr: "Boutique en ligne Passion Jerseys",
      descriptionEn:
        "Client-based e-commerce platform for authentic sports jerseys and related apparel. Developing core features: product catalog, shopping cart, and order checkout flow. Building a responsive frontend using Next.js (React) for customers to browse and purchase jerseys.",
      descriptionAr:
        "Plateforme e-commerce développée pour un client externe, spécialisée dans les chandails de sport authentiques. Développement des fonctionnalités principales : catalogue produits, panier d'achat et processus de commande. Création d'une interface réactive avec Next.js (React).",
      technologies: "Next.js,React,Java,Spring Boot,Docker,SQL Server,GitHub",
      featured: true,
      githubUrl: "https://github.com/tamimafg6/PassionJerseysStore",
    },
    {
      titleEn: "Champlain PetClinic (Vets Service)",
      titleAr: "Champlain PetClinic (Service VETS)",
      descriptionEn:
        "A full-stack academic project simulating a pet clinic, developed with 40+ students across multiple microservices. Worked on the VETS service, managing veterinarian data and photo upload endpoints. Implemented and tested REST APIs for photo uploads and improved test coverage (JUnit, Jacoco).",
      descriptionAr:
        "Projet académique complet simulant une clinique vétérinaire, développé avec plus de 40 étudiants répartis en plusieurs microservices. Contribuer au service VETS : gestion des données et téléversement de photos des vétérinaires. Implémenter et tester des APIs REST pour l'ajout de photos; améliorer la couverture de tests (JaCoCo).",
      technologies: "Java,Spring Boot,Docker,GitHub,CI/CD,JUnit",
      featured: true,
      githubUrl: "https://github.com/tamimafg6/champlain_petclinic",
    },
    {
      titleEn: "World of Soccer 2025",
      titleAr: "World of Soccer 2025",
      descriptionEn:
        "Multi-service REST API for teams, matches, leagues, and locations; containerized with Docker. Designed the API gateway and decomposed services (teams, league, match, location). Implemented REST endpoints with input validation and error handling, also exercised endpoints with Postman.",
      descriptionAr:
        "API REST multi-services pour équipes, matchs, ligues et lieux; conteneurisée avec Docker. Conception de la passerelle API et décomposition des services (équipes, ligues, matchs, lieux). Implémentation des endpoints REST avec validation et gestion d'erreurs, tests effectués avec Postman.",
      technologies: "Java,Spring Boot,Docker,Gradle,Lombok,Postman",
      featured: false,
      githubUrl: "https://github.com/tamimafg6/worldofsoccer2025-microservice",
    },
  ]);

  // Seed work experience (from resume)
  await db.insert(schema.workExperience).values([
    {
      companyEn: "Immo 1ère",
      companyAr: "Immo 1ère",
      positionEn: "Server — Part-Time Contract",
      positionAr: "Serveur — Contrat à temps partiel",
      descriptionEn:
        "Worked in a team environment, strengthened teamwork and customer service skills. Assisted clients and supported smooth daily operations in a fast-paced setting.",
      descriptionAr:
        "Travail en équipe, consolidation des compétences en collaboration et en service à la clientèle. Assistance aux clients et soutien aux opérations quotidiennes dans un environnement dynamique.",
      startDate: new Date("2024-07-01"),
      endDate: null,
      isCurrent: true,
      location: "Canada",
      order: 0,
    },
    {
      companyEn: "Champlain College",
      companyAr: "Collège Champlain",
      positionEn: "Peer Tutor — First-Year",
      positionAr: "Tuteur — Première année",
      descriptionEn:
        "Helped first-year students with programming labs and assignments by clarifying concepts and debugging issues.",
      descriptionAr:
        "Aidé les étudiants de première année pour les laboratoires et travaux de programmation en clarifiant les concepts et en déboguant les problèmes.",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2025-10-01"),
      isCurrent: false,
      location: "Saint-Lambert, QC",
      order: 1,
    },
  ]);

  // Seed education (from resume)
  await db.insert(schema.education).values([
    {
      institutionEn: "Champlain College",
      institutionAr: "Collège Champlain",
      degreeEn: "DEC",
      degreeAr: "DEC",
      fieldEn: "Computer Science Technology",
      fieldAr: "Techniques de l'informatique",
      descriptionEn:
        "Relevant coursework: OOP (Java); Databases (SQL); Web Development (JS/ASP.NET); Distributed Systems (Web Services/Microservices); Linux/Operating Systems; Networking & Security; Mobile (Android); Azure SQL. Graduating May 2026.",
      descriptionAr:
        "Cours pertinents : POO (Java); Bases de données (SQL); Développement Web (JS/ASP.NET); Systèmes distribués (Web Services); Linux/Systèmes d'exploitation; Réseautique et sécurité; Développement mobile (Android/IOS). Diplôme prévu : Mai 2026.",
      startDate: new Date("2023-08-01"),
      endDate: new Date("2026-05-01"),
      location: "Saint-Lambert, QC",
      gpa: null,
      order: 0,
    },
  ]);

  // Seed contact info (single row)
  await db.insert(schema.contactInfo).values({
    email: "tamim.afghanyar@gmail.com",
    phone: "514-953-9598",
    address: "Saint-Jean-sur-Richelieu, Quebec",
    linkedIn: "https://www.linkedin.com/in/tamim-afghanyar-2026852b3",
    github: "https://github.com/tamimafg6",
    twitter: null,
    website: null,
  });

  // Resume: no seed row — CV is set only after admin uploads a PDF in Settings.
  // Seed hobbies (incl. extra-curricular from resume)
  await db.insert(schema.hobbies).values([
    { titleEn: "Champlain Code Quest 2025 — Hackathon", titleAr: "Champlain Code Quest 2025 — Hackathon", descriptionEn: "One-day hackathon focused on innovation and teamwork under the theme \"Life 2035\".", descriptionAr: "Hackathon d'une journée sur le thème « Life 2035 », axé sur l'innovation et le travail d'équipe.", order: 0 },
    { titleEn: "Coding & Side Projects", titleAr: "Code et projets personnels", descriptionEn: "Building small apps and exploring new tech", descriptionAr: "Créer des applis et explorer de nouvelles technologies", order: 1 },
    { titleEn: "Reading", titleAr: "Lecture", descriptionEn: "Tech blogs and software books", descriptionAr: "Blogs tech et livres sur le logiciel", order: 2 },
  ]);

  console.log("✅ Database seeded successfully!");
}

// When run directly (npm run db:seed), not when imported by seed-if-empty
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  runSeed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error seeding database:", error);
      process.exit(1);
    });
}
