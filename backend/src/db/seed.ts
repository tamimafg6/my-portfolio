import { db } from "./index";
import * as schema from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.delete(schema.projects);
  await db.delete(schema.skills);
  await db.delete(schema.workExperience);
  await db.delete(schema.education);

  // Seed skills
  await db.insert(schema.skills).values([
    {
      nameEn: "Java",
      nameAr: "Java",
      category: "Programming Languages",
      level: 5,
    },
    {
      nameEn: "C#",
      nameAr: "C#",
      category: "Programming Languages",
      level: 5,
    },
    {
      nameEn: "Kotlin",
      nameAr: "Kotlin",
      category: "Programming Languages",
      level: 4,
    },
    {
      nameEn: "JavaScript",
      nameAr: "JavaScript",
      category: "Programming Languages",
      level: 5,
    },
    {
      nameEn: "SQL",
      nameAr: "SQL",
      category: "Programming Languages",
      level: 5,
    },
    {
      nameEn: "Spring Boot",
      nameAr: "Spring Boot",
      category: "Frameworks",
      level: 5,
    },
    {
      nameEn: "ASP.NET MVC",
      nameAr: "ASP.NET MVC",
      category: "Frameworks",
      level: 4,
    },
    {
      nameEn: "Next.js",
      nameAr: "Next.js",
      category: "Frameworks",
      level: 4,
    },
    {
      nameEn: "SQL Server",
      nameAr: "SQL Server",
      category: "Databases",
      level: 5,
    },
    {
      nameEn: "Azure SQL",
      nameAr: "Azure SQL",
      category: "Cloud",
      level: 4,
    },
    {
      nameEn: "Docker",
      nameAr: "Docker",
      category: "DevOps",
      level: 5,
    },
    {
      nameEn: "Git & GitHub",
      nameAr: "Git & GitHub",
      category: "Tools",
      level: 5,
    },
    {
      nameEn: "IntelliJ IDEA",
      nameAr: "IntelliJ IDEA",
      category: "Tools",
      level: 5,
    },
    {
      nameEn: "VS Code",
      nameAr: "VS Code",
      category: "Tools",
      level: 5,
    },
    {
      nameEn: "Linux",
      nameAr: "Linux",
      category: "Operating Systems",
      level: 4,
    },
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

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
