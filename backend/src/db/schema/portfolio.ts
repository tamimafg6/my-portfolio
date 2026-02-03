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
  category: text("category").notNull(),
  level: integer("level").notNull().default(0),
  icon: text("icon"),
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
  technologies: text("technologies").notNull(),
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
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").notNull().default(false),
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
  fieldEn: text("field_en"),
  fieldAr: text("field_ar"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  gpa: text("gpa"),
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

// Contact Info (includes profile photo URL for "about me" photo)
export const contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  linkedIn: text("linkedin"),
  github: text("github"),
  twitter: text("twitter"),
  website: text("website"),
  profilePhotoUrl: text("profile_photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Resume (single row: optional per-locale PDFs + button labels)
export const resume = pgTable("resume", {
  id: serial("id").primaryKey(),
  /** Legacy single file; used as fallback when fileUrlEn/fileUrlAr missing */
  fileUrl: text("file_url"),
  /** English CV PDF key (e.g. resume-en.pdf) */
  fileUrlEn: text("file_url_en"),
  /** French CV PDF key (e.g. resume-fr.pdf) */
  fileUrlAr: text("file_url_ar"),
  labelEn: text("label_en").notNull().default("Resume"),
  labelAr: text("label_ar").notNull().default("CV"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Hobbies
export const hobbies = pgTable("hobbies", {
  id: serial("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role"),
  company: text("company"),
  content: text("content").notNull(),
  rating: integer("rating").notNull().default(5),
  isApproved: boolean("is_approved").notNull().default(false),
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

export const insertContactMessageSchema = createInsertSchema(contactMessages);
export const selectContactMessageSchema = createSelectSchema(contactMessages);

export const insertContactInfoSchema = createInsertSchema(contactInfo);
export const selectContactInfoSchema = createSelectSchema(contactInfo);

export const insertResumeSchema = createInsertSchema(resume);
export const selectResumeSchema = createSelectSchema(resume);

export const insertHobbySchema = createInsertSchema(hobbies);
export const selectHobbySchema = createSelectSchema(hobbies);

export const insertTestimonialSchema = createInsertSchema(testimonials);
export const selectTestimonialSchema = createSelectSchema(testimonials);
