import type { Env } from "../../core/env";

export type EnquiryStatus = "new" | "in_progress" | "responded" | "archived";
export type EnquiryInput = { name:string; email:string; phone?:string; subject:string; message:string };

export class EnquiryRepository {
  constructor(private env:Env) {}
  async create(id:string,input:EnquiryInput,now:number,ipHash:string|null) {
    await this.env.DB.prepare("INSERT INTO enquiries (id,name,email,phone,subject,message,status,ip_hash,created_at,updated_at) VALUES (?,?,?,?,?,?, 'new', ?, ?, ?)")
      .bind(id,input.name,input.email,input.phone??null,input.subject,input.message,ipHash,now,now).run();
  }
  async list(status:string|null,limit:number,offset:number) {
    const query=status
      ? "SELECT id,name,email,phone,subject,message,status,internal_note AS internalNote,created_at AS createdAt,updated_at AS updatedAt FROM enquiries WHERE status=? ORDER BY created_at DESC LIMIT ? OFFSET ?"
      : "SELECT id,name,email,phone,subject,message,status,internal_note AS internalNote,created_at AS createdAt,updated_at AS updatedAt FROM enquiries ORDER BY created_at DESC LIMIT ? OFFSET ?";
    return status
      ? (await this.env.DB.prepare(query).bind(status,limit,offset).all()).results
      : (await this.env.DB.prepare(query).bind(limit,offset).all()).results;
  }
  async update(id:string,status:EnquiryStatus,note:string|null,now:number) {
    return this.env.DB.prepare("UPDATE enquiries SET status=?,internal_note=?,updated_at=? WHERE id=?")
      .bind(status,note,now,id).run();
  }
}
