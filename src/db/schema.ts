import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// Enums (handled as text in SQLite)
export const ROLES = ["admin", "agent"] as const;
export const STATUSES = ["draft", "published", "sold", "archived"] as const;
export const LANGUAGES = ["en", "ru", "ar", "zh"] as const;

export const users = sqliteTable("users", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    phone: text("phone"),
    role: text("role").$type<typeof ROLES[number]>().default("agent"),
    languages: text("languages", { mode: "json" }).$type<string[]>(), // Store array as JSON
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const properties = sqliteTable("properties", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    agentId: integer("agent_id").references(() => users.id).notNull(),
    price: integer("price").notNull(), // Store as cents or main unit? Let's use integer for simplicity or text for exact decimal
    // Better practice in SQLite for currency: Store as integer (cents) or REAL (but REAL has float issues).
    // Let's store as TEXT to be safe with large numbers/decimals or just number if we don't care about float precision yet.
    // The PG schema had decimal. Let's use REAL for now for simplicity in dev, or text.
    // Actually, let's use integer for "price in valid currency" or just Real.
    currency: text("currency").default("USD"),
    location: text("location", { mode: "json" }).notNull(), // { lat, lng, address, city, country }
    features: text("features", { mode: "json" }).notNull(), // { bedrooms, bathrooms, area, pool: boolean, etc. }
    status: text("status").$type<typeof STATUSES[number]>().default("draft"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const propertyTranslations = sqliteTable("property_translations", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    propertyId: integer("property_id").references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    language: text("language").$type<typeof LANGUAGES[number]>().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    slug: text("slug").notNull(),
});

export const media = sqliteTable("media", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    propertyId: integer("property_id").references(() => properties.id, { onDelete: 'cascade' }).notNull(),
    url: text("url").notNull(),
    type: text("type").default("image"),
    order: integer("order").default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
    agent: one(users, {
        fields: [properties.agentId],
        references: [users.id],
    }),
    translations: many(propertyTranslations),
    media: many(media),
}));

export const propertyTranslationsRelations = relations(propertyTranslations, ({ one }) => ({
    property: one(properties, {
        fields: [propertyTranslations.propertyId],
        references: [properties.id],
    }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
    property: one(properties, {
        fields: [media.propertyId],
        references: [properties.id],
    }),
}));
