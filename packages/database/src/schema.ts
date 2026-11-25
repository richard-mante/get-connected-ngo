import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const content=sqliteTable("content",{id:text("id").primaryKey(),type:text("type").notNull(),title:text("title").notNull(),slug:text("slug").notNull().unique(),summary:text("summary"),body:text("body"),metadata:text("metadata"),status:text("status").notNull().default("draft"),publishedAt:integer("published_at",{mode:"timestamp"}),createdAt:integer("created_at",{mode:"timestamp"}).notNull(),updatedAt:integer("updated_at",{mode:"timestamp"}).notNull()});
export const media=sqliteTable("media",{id:text("id").primaryKey(),objectKey:text("object_key").notNull().unique(),filename:text("filename").notNull(),contentType:text("content_type").notNull(),size:integer("size").notNull(),alt:text("alt"),caption:text("caption"),width:integer("width"),height:integer("height"),visibility:text("visibility").notNull().default("private"),createdAt:integer("created_at",{mode:"timestamp"}).notNull(),updatedAt:integer("updated_at",{mode:"timestamp"}).notNull()});
export const enquiries=sqliteTable("enquiries",{
 id:text("id").primaryKey(),
 name:text("name").notNull(),
 email:text("email").notNull(),
 phone:text("phone"),
 subject:text("subject").notNull(),
 message:text("message").notNull(),
 status:text("status").notNull().default("new"),
 internalNote:text("internal_note"),
 ipHash:text("ip_hash"),
 createdAt:integer("created_at",{mode:"timestamp"}).notNull(),
 updatedAt:integer("updated_at",{mode:"timestamp"}).notNull()
},table=>({statusCreated:index("enquiries_status_created_idx").on(table.status,table.createdAt),created:index("enquiries_created_idx").on(table.createdAt)}));

export const organizationSettings=sqliteTable("organization_settings",{
 key:text("key").primaryKey(),
 value:text("value").notNull(),
 updatedAt:integer("updated_at",{mode:"timestamp"}).notNull()
});
