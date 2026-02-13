import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// Enums (handled as text in SQLite)
export const ROLES = ["admin", "agent"] as const;
export const STATUSES = ["draft", "published", "sold", "archived"] as const;
export const LANGUAGES = ["en", "ru", "tr", "ar", "zh"] as const;
export const TYPES = ["real_estate", "vehicle", "part"] as const;

export const users = sqliteTable("users", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone"),
    role: text("role").$type<typeof ROLES[number]>().default("agent"),
    languages: text("languages", { mode: "json" }).$type<string[]>(), // Store array as JSON
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
    emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
    isApproved: integer("is_approved", { mode: "boolean" }).default(false), // Admin approval
    verificationToken: text("verification_token"),
    resetToken: text("reset_token"),
    resetTokenExpiresAt: integer("reset_token_expires_at", { mode: "timestamp" }),
});

export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull()
});

export const listings = sqliteTable("listings", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    agentId: integer("agent_id").references(() => users.id).notNull(),
    type: text("type").$type<typeof TYPES[number]>().default("real_estate").notNull(), // real_estate, vehicle, part
    price: integer("price").notNull(), // Store as integer (val * 1) or just number
    currency: text("currency").default("USD"),
    location: text("location", { mode: "json" }).notNull(), // { lat, lng, address, city, country }
    features: text("features", { mode: "json" }).notNull(), // Polymorphic JSON: { bedrooms... } OR { km, year... }
    status: text("status").$type<typeof STATUSES[number]>().default("draft"),
    isShowcase: integer("is_showcase", { mode: "boolean" }).default(false), // Showcase on homepage
    viewCount: integer("view_count").default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(cast(unixepoch() * 1000 as integer))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(cast(unixepoch() * 1000 as integer))`),
});

export const listingTranslations = sqliteTable("listing_translations", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    listingId: integer("listing_id").references(() => listings.id, { onDelete: 'cascade' }).notNull(),
    language: text("language").$type<typeof LANGUAGES[number]>().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    slug: text("slug").notNull(),
});

export const media = sqliteTable("media", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    listingId: integer("listing_id").references(() => listings.id, { onDelete: 'cascade' }).notNull(),
    url: text("url").notNull(),
    type: text("type").default("image"),
    order: integer("order").default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
    agent: one(users, {
        fields: [listings.agentId],
        references: [users.id],
    }),
    translations: many(listingTranslations),
    media: many(media),
}));

export const listingTranslationsRelations = relations(listingTranslations, ({ one }) => ({
    listing: one(listings, {
        fields: [listingTranslations.listingId],
        references: [listings.id],
    }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
    listing: one(listings, {
        fields: [media.listingId],
        references: [listings.id],
    }),
}));
