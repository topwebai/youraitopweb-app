import {
  users,
  clients,
  reports,
  inquiries,
  chatConversations,
  aiGenerations,
  whiteLabelBrands,
  whiteLabelClients,
  whiteLabelReports,
  type User,
  type UpsertUser,
  type Client,
  type InsertClient,
  type Report,
  type InsertReport,
  type Inquiry,
  type InsertInquiry,
  type ChatConversation,
  type InsertChatConversation,
  type AiGeneration,
  type InsertAiGeneration,
  type WhiteLabelBrand,
  type InsertWhiteLabelBrand,
  type WhiteLabelClient,
  type InsertWhiteLabelClient,
  type WhiteLabelReport,
  type InsertWhiteLabelReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Client operations
  createClient(client: InsertClient): Promise<Client>;
  getClient(id: number): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReportsByClient(clientId: number): Promise<Report[]>;
  getReportsByMonth(month: string): Promise<Report[]>;
  updateReport(id: number, updates: Partial<InsertReport>): Promise<Report>;
  
  // Inquiry operations
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
  updateInquiry(id: number, updates: Partial<InsertInquiry>): Promise<Inquiry>;
  
  // Chat operations
  createChatConversation(chat: InsertChatConversation): Promise<ChatConversation>;
  getChatConversation(sessionId: string): Promise<ChatConversation | undefined>;
  updateChatConversation(id: number, updates: Partial<InsertChatConversation>): Promise<ChatConversation>;
  
  // AI Generation operations
  createAiGeneration(generation: InsertAiGeneration): Promise<AiGeneration>;
  getUserAiGenerations(userId: string): Promise<AiGeneration[]>;
  
  // White-label brand operations
  createWhiteLabelBrand(brand: InsertWhiteLabelBrand): Promise<WhiteLabelBrand>;
  getUserWhiteLabelBrands(userId: string): Promise<WhiteLabelBrand[]>;
  getWhiteLabelBrand(id: number): Promise<WhiteLabelBrand | undefined>;
  updateWhiteLabelBrand(id: number, updates: Partial<InsertWhiteLabelBrand>): Promise<WhiteLabelBrand>;
  deleteWhiteLabelBrand(id: number): Promise<void>;
  
  // White-label client operations
  createWhiteLabelClient(client: InsertWhiteLabelClient): Promise<WhiteLabelClient>;
  getBrandWhiteLabelClients(brandId: number): Promise<WhiteLabelClient[]>;
  getWhiteLabelClient(id: number): Promise<WhiteLabelClient | undefined>;
  updateWhiteLabelClient(id: number, updates: Partial<InsertWhiteLabelClient>): Promise<WhiteLabelClient>;
  deleteWhiteLabelClient(id: number): Promise<void>;
  
  // White-label report operations
  createWhiteLabelReport(report: InsertWhiteLabelReport): Promise<WhiteLabelReport>;
  getBrandWhiteLabelReports(brandId: number): Promise<WhiteLabelReport[]>;
  getClientWhiteLabelReports(clientId: number): Promise<WhiteLabelReport[]>;
  getWhiteLabelReport(id: number): Promise<WhiteLabelReport | undefined>;
  updateWhiteLabelReport(id: number, updates: Partial<InsertWhiteLabelReport>): Promise<WhiteLabelReport>;
  deleteWhiteLabelReport(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Client operations
  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReportsByClient(clientId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.clientId, clientId))
      .orderBy(desc(reports.reportMonth));
  }

  async getReportsByMonth(month: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.reportMonth, month))
      .orderBy(desc(reports.createdAt));
  }

  async updateReport(id: number, updates: Partial<InsertReport>): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set(updates)
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  // Inquiry operations
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db.insert(inquiries).values(inquiry).returning();
    return newInquiry;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async updateInquiry(id: number, updates: Partial<InsertInquiry>): Promise<Inquiry> {
    const [inquiry] = await db
      .update(inquiries)
      .set(updates)
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry;
  }

  // Chat operations
  async createChatConversation(chat: InsertChatConversation): Promise<ChatConversation> {
    const [conversation] = await db.insert(chatConversations).values(chat).returning();
    return conversation;
  }

  async getChatConversation(sessionId: string): Promise<ChatConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.sessionId, sessionId));
    return conversation;
  }

  async updateChatConversation(id: number, updates: Partial<InsertChatConversation>): Promise<ChatConversation> {
    const [conversation] = await db
      .update(chatConversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatConversations.id, id))
      .returning();
    return conversation;
  }

  // AI Generation operations
  async createAiGeneration(generation: InsertAiGeneration): Promise<AiGeneration> {
    const [result] = await db
      .insert(aiGenerations)
      .values(generation)
      .returning();
    return result;
  }

  async getUserAiGenerations(userId: string): Promise<AiGeneration[]> {
    return await db
      .select()
      .from(aiGenerations)
      .where(eq(aiGenerations.userId, userId))
      .orderBy(desc(aiGenerations.createdAt))
      .limit(50);
  }

  // White-label brand operations
  async createWhiteLabelBrand(brand: InsertWhiteLabelBrand): Promise<WhiteLabelBrand> {
    const [created] = await db.insert(whiteLabelBrands).values(brand).returning();
    return created;
  }

  async getUserWhiteLabelBrands(userId: string): Promise<WhiteLabelBrand[]> {
    return await db
      .select()
      .from(whiteLabelBrands)
      .where(eq(whiteLabelBrands.userId, userId))
      .orderBy(desc(whiteLabelBrands.createdAt));
  }

  async getWhiteLabelBrand(id: number): Promise<WhiteLabelBrand | undefined> {
    const [brand] = await db
      .select()
      .from(whiteLabelBrands)
      .where(eq(whiteLabelBrands.id, id));
    return brand;
  }

  async updateWhiteLabelBrand(id: number, updates: Partial<InsertWhiteLabelBrand>): Promise<WhiteLabelBrand> {
    const [updated] = await db
      .update(whiteLabelBrands)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whiteLabelBrands.id, id))
      .returning();
    return updated;
  }

  async deleteWhiteLabelBrand(id: number): Promise<void> {
    await db.delete(whiteLabelBrands).where(eq(whiteLabelBrands.id, id));
  }

  // White-label client operations
  async createWhiteLabelClient(client: InsertWhiteLabelClient): Promise<WhiteLabelClient> {
    const [created] = await db.insert(whiteLabelClients).values(client).returning();
    return created;
  }

  async getBrandWhiteLabelClients(brandId: number): Promise<WhiteLabelClient[]> {
    return await db
      .select()
      .from(whiteLabelClients)
      .where(eq(whiteLabelClients.brandId, brandId))
      .orderBy(desc(whiteLabelClients.createdAt));
  }

  async getWhiteLabelClient(id: number): Promise<WhiteLabelClient | undefined> {
    const [client] = await db
      .select()
      .from(whiteLabelClients)
      .where(eq(whiteLabelClients.id, id));
    return client;
  }

  async updateWhiteLabelClient(id: number, updates: Partial<InsertWhiteLabelClient>): Promise<WhiteLabelClient> {
    const [updated] = await db
      .update(whiteLabelClients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whiteLabelClients.id, id))
      .returning();
    return updated;
  }

  async deleteWhiteLabelClient(id: number): Promise<void> {
    await db.delete(whiteLabelClients).where(eq(whiteLabelClients.id, id));
  }

  // White-label report operations
  async createWhiteLabelReport(report: InsertWhiteLabelReport): Promise<WhiteLabelReport> {
    const [created] = await db.insert(whiteLabelReports).values(report).returning();
    return created;
  }

  async getBrandWhiteLabelReports(brandId: number): Promise<WhiteLabelReport[]> {
    return await db
      .select()
      .from(whiteLabelReports)
      .where(eq(whiteLabelReports.brandId, brandId))
      .orderBy(desc(whiteLabelReports.createdAt));
  }

  async getClientWhiteLabelReports(clientId: number): Promise<WhiteLabelReport[]> {
    return await db
      .select()
      .from(whiteLabelReports)
      .where(eq(whiteLabelReports.clientId, clientId))
      .orderBy(desc(whiteLabelReports.createdAt));
  }

  async getWhiteLabelReport(id: number): Promise<WhiteLabelReport | undefined> {
    const [report] = await db
      .select()
      .from(whiteLabelReports)
      .where(eq(whiteLabelReports.id, id));
    return report;
  }

  async updateWhiteLabelReport(id: number, updates: Partial<InsertWhiteLabelReport>): Promise<WhiteLabelReport> {
    const [updated] = await db
      .update(whiteLabelReports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whiteLabelReports.id, id))
      .returning();
    return updated;
  }

  async deleteWhiteLabelReport(id: number): Promise<void> {
    await db.delete(whiteLabelReports).where(eq(whiteLabelReports.id, id));
  }
}

export const storage = new DatabaseStorage();
