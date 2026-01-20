import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Skills
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  category: text("category").notNull(), // e.g., "Programming", "Design", "Languages"
  level: integer("level").notNull().default(0), // 0-100
  icon: text("icon"), // Icon name or URL
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  image: text("image"),
  url: text("url"),
  githubUrl: text("github_url"),
  technologies: text("technologies").notNull(), // JSON array as string
  featured: boolean("featured").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Work Experience
export const workExperience = pgTable("work_experience", {
  id: serial("id").primaryKey(),
  companyEn: text("company_en").notNull(),
  companyAr: text("company_ar").notNull(),
  positionEn: text("position_en").notNull(),
  positionAr: text("position_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null for current position
  location: text("location"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Education
export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  institutionEn: text("institution_en").notNull(),
  institutionAr: text("institution_ar").notNull(),
  degreeEn: text("degree_en").notNull(),
  degreeAr: text("degree_ar").notNull(),
  fieldEn: text("field_en").notNull(),
  fieldAr: text("field_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null for ongoing
  grade: text("grade"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Resume
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  filePathEn: text("file_path_en").notNull(),
  filePathAr: text("file_path_ar").notNull(),
  version: text("version").notNull().default("1.0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Hobbies
export const hobbies = pgTable("hobbies", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  icon: text("icon"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  position: text("position"),
  company: text("company"),
  message: text("message").notNull(),
  rating: integer("rating").notNull().default(5), // 1-5
  image: text("image"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Contact Info
export const contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  linkedIn: text("linkedin"),
  github: text("github"),
  twitter: text("twitter"),
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schemas for validation
export const insertSkillSchema = createInsertSchema(skills);
export const selectSkillSchema = createSelectSchema(skills);

export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);

export const insertWorkExperienceSchema = createInsertSchema(workExperience);
export const selectWorkExperienceSchema = createSelectSchema(workExperience);

export const insertEducationSchema = createInsertSchema(education);
export const selectEducationSchema = createSelectSchema(education);

export const insertResumeSchema = createInsertSchema(resumes);
export const selectResumeSchema = createSelectSchema(resumes);

export const insertHobbySchema = createInsertSchema(hobbies);
export const selectHobbySchema = createSelectSchema(hobbies);

export const insertContactMessageSchema = createInsertSchema(contactMessages);
export const selectContactMessageSchema = createSelectSchema(contactMessages);

export const insertTestimonialSchema = createInsertSchema(testimonials);
export const selectTestimonialSchema = createSelectSchema(testimonials);

export const insertContactInfoSchema = createInsertSchema(contactInfo);
export const selectContactInfoSchema = createSelectSchema(contactInfo);
