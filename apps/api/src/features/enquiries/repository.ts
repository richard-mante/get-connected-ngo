import type { Env } from "../../core/env";

export type EnquiryStatus = "new" | "in_progress" | "responded" | "archived";
export type EnquiryInput = { name:string; email:string; phone?:string; subject:string; message:string };

export class EnquiryRepository {
  constructor(private env:Env) {}
  async create(id:string,input:EnquiryInput,now:number,ipHash:string|null) {
    await this.env.DB.prepare("INSERT INTO enquiries (id,name,email,phone,subject,message,status,ip_hash,created_at,updated_at) VALUES (?,?,?,?,?,?, 'new', ?, ?, ?)")
      .bind(id,input.name,input.email,input.phone??null,input.subject,input.message,ipHash,now,now).run();
  }
  async list(status:string|null,limit:number,offset:number,search:string|null=null) {
    const term=search?.trim();
    const pattern=term?"%"+term+"%":null;
    const conditions:string[]=[];
    const values:(string|number)[]=[];
    if(status){conditions.push("status=?");values.push(status);}
    if(pattern){conditions.push("(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)");values.push(pattern,pattern,pattern,pattern);}
    const query="SELECT id,name,email,phone,subject,message,status,internal_note AS internalNote,created_at AS createdAt,updated_at AS updatedAt FROM enquiries"+(conditions.length?" WHERE "+conditions.join(" AND "):"")+" ORDER BY created_at DESC LIMIT ? OFFSET ?";
    values.push(limit,offset);
    return (await this.env.DB.prepare(query).bind(...values).all()).results;
  }
  async update(id:string,status:EnquiryStatus,note:string|null,now:number) {
    return this.env.DB.prepare("UPDATE enquiries SET status=?,internal_note=?,updated_at=? WHERE id=?")
      .bind(status,note,now,id).run();
  }
}
