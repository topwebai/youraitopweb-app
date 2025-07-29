import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  company: varchar("company"),
  phone: varchar("phone"),
  subscription: varchar("subscription").default("free"), // free, campaign_hub, enterprise
  subscriptionStatus: varchar("subscription_status").default("active"), // active, cancelled, expired
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientProjects = pgTable("client_projects", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // seo, ppc, social_media, website, ai_assistant
  status: varchar("status").default("active"), // active, paused, completed
  description: text("description"),
  budget: varchar("budget"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiGenerations = pgTable("ai_generations", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  projectId: varchar("project_id").references(() => clientProjects.id),
  type: varchar("type").notNull(), // text, image, video, audio
  prompt: text("prompt").notNull(),
  result: text("result"), // URL or text content
  model: varchar("model"), // gpt-4o, dall-e-3, sora, etc
  status: varchar("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// Clients table for service customers
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  gmbListingId: text("gmb_listing_id"),
  websiteUrl: text("website_url"),
  services: text("services").array().default([]),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  serviceType: varchar("service_type").notNull(), // 'seo', 'ppc', 'gmb', 'social', 'chatbot'
  reportMonth: varchar("report_month").notNull(), // YYYY-MM format
  data: jsonb("data").notNull(), // Flexible JSON data for different report types
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact inquiries table
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  services: text("services").array().default([]),
  message: text("message"),
  status: varchar("status").default("new"), // 'new', 'contacted', 'converted', 'closed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Chatbot conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  messages: jsonb("messages").notNull(), // Array of message objects
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// White-label report brands table
export const whiteLabelBrands = pgTable("white_label_brands", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  brandName: varchar("brand_name").notNull(),
  logoUrl: varchar("logo_url"),
  brandColor: varchar("brand_color").default("#3b82f6"),
  websiteUrl: varchar("website_url"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// White-label client relationships
export const whiteLabelClients = pgTable("white_label_clients", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => whiteLabelBrands.id).notNull(),
  clientName: varchar("client_name").notNull(),
  clientEmail: varchar("client_email").notNull(),
  clientPhone: varchar("client_phone"),
  businessName: varchar("business_name"),
  businessUrl: varchar("business_url"),
  servicesOffered: text("services_offered").array().default([]),
  monthlyFee: varchar("monthly_fee"),
  status: varchar("status").default("active"), // active, paused, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// White-label report templates
export const whiteLabelReports = pgTable("white_label_reports", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").references(() => whiteLabelBrands.id).notNull(),
  clientId: integer("client_id").references(() => whiteLabelClients.id).notNull(),
  reportType: varchar("report_type").notNull(), // seo, ppc, social, gmb, comprehensive
  reportMonth: varchar("report_month").notNull(), // YYYY-MM
  title: varchar("title").notNull(),
  summary: text("summary"),
  keyMetrics: jsonb("key_metrics").notNull(),
  insights: text("insights").array().default([]),
  recommendations: text("recommendations").array().default([]),
  reportData: jsonb("report_data").notNull(),
  isDelivered: boolean("is_delivered").default(false),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = typeof clientProjects.$inferInsert;
export type AiGeneration = typeof aiGenerations.$inferSelect;
export type InsertAiGeneration = typeof aiGenerations.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
export const insertClientSchema = createInsertSchema(clients);

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export const insertReportSchema = createInsertSchema(reports);

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;
export const insertInquirySchema = createInsertSchema(inquiries).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  services: true,
  message: true,
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;
export const insertChatSchema = createInsertSchema(chatConversations);

// White-label schema exports
export type WhiteLabelBrand = typeof whiteLabelBrands.$inferSelect;
export type InsertWhiteLabelBrand = typeof whiteLabelBrands.$inferInsert;
export const insertWhiteLabelBrandSchema = createInsertSchema(whiteLabelBrands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WhiteLabelClient = typeof whiteLabelClients.$inferSelect;
export type InsertWhiteLabelClient = typeof whiteLabelClients.$inferInsert;
export const insertWhiteLabelClientSchema = createInsertSchema(whiteLabelClients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type WhiteLabelReport = typeof whiteLabelReports.$inferSelect;
export type InsertWhiteLabelReport = typeof whiteLabelReports.$inferInsert;
export const insertWhiteLabelReportSchema = createInsertSchema(whiteLabelReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
