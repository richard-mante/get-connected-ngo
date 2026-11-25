import type {Env} from "../../core/env";
export type ContentRecord={id:string;type:string;title:string;slug:string;summary:string|null;body:string|null;metadata:Record<string,string>|null;status:string;publishedAt:number|null;createdAt?:number;updatedAt?:number};
type ContentInput={type:string;title:string;slug:string;summary?:string;body:string;metadata?:Record<string,string>;status:string};
export class ContentRepository{
 constructor(private env:Env){}
 async listPublished(type?:string){
  const query=type
   ?this.env.DB.prepare("SELECT id,type,title,slug,summary,metadata,published_at AS publishedAt FROM content WHERE status=? AND type=? ORDER BY published_at DESC LIMIT 100").bind("published",type)
   :this.env.DB.prepare("SELECT id,type,title,slug,summary,metadata,published_at AS publishedAt FROM content WHERE status=? ORDER BY published_at DESC LIMIT 100").bind("published");
  const {results}=await query.all();return results;
 }
 async findPublishedBySlug(slug:string){return this.env.DB.prepare("SELECT id,type,title,slug,summary,body,metadata,published_at AS publishedAt FROM content WHERE status=? AND slug=? LIMIT 1").bind("published",slug).first();}
 async listAdmin(){const {results}=await this.env.DB.prepare("SELECT id,type,title,slug,summary,metadata,status,published_at AS publishedAt,updated_at AS updatedAt FROM content ORDER BY updated_at DESC LIMIT 100").all();return results;}
 async findById(id:string){return this.env.DB.prepare("SELECT id,type,title,slug,summary,body,metadata,status,published_at AS publishedAt,created_at AS createdAt,updated_at AS updatedAt FROM content WHERE id=? LIMIT 1").bind(id).first();}
 async create(id:string,input:ContentInput,now:number,publishedAt:number|null){await this.env.DB.prepare("INSERT INTO content (id,type,title,slug,summary,body,metadata,status,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id,input.type,input.title,input.slug,input.summary??null,input.body,input.metadata?JSON.stringify(input.metadata):null,input.status,publishedAt,now,now).run();}
 async update(id:string,input:ContentInput,now:number,publishedAt:number|null){return this.env.DB.prepare("UPDATE content SET type=?,title=?,slug=?,summary=?,body=?,metadata=?,status=?,published_at=?,updated_at=? WHERE id=?").bind(input.type,input.title,input.slug,input.summary??null,input.body,input.metadata?JSON.stringify(input.metadata):null,input.status,publishedAt,now,id).run();}
 async hasPublicMedia(id:string){return this.env.DB.prepare("SELECT id FROM media WHERE id=? AND visibility='public' LIMIT 1").bind(id).first();}
}
