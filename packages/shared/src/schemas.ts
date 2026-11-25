import { z } from "zod";
export const slugSchema=z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const contentStatusSchema=z.enum(["draft","review","published","archived"]);
export const contentTypeSchema=z.enum(["page","story","program","event"]);
export const contentInputSchema=z.object({type:contentTypeSchema.default("story"),title:z.string().trim().min(1).max(180),slug:slugSchema,summary:z.string().trim().max(500).optional(),body:z.string().max(200000).optional(),metadata:z.record(z.string(),z.string().trim().max(1000)).optional(),status:contentStatusSchema.default("draft")});
export type ContentInput=z.infer<typeof contentInputSchema>;