import {contentInputSchema,type ContentInput} from "@get-connected/shared/schemas";
import type {Env} from "../../core/env";
import {ContentRepository} from "./repository";
type Node={type?:string;attrs?:Record<string,unknown>;content?:Node[]};
export class ContentService{
 private repository:ContentRepository;
 constructor(private env:Env){this.repository=new ContentRepository(env);}
 async listPublished(){return this.repository.listPublished();}
 async getPublished(slug:string){return this.repository.findPublishedBySlug(slug);}
 async listAdmin(){return this.repository.listAdmin();}
 async getById(id:string){return this.repository.findById(id);}
 async parseInput(raw:unknown,request:Request):Promise<{input:ContentInput;body:string}|{error:string}>{
  const parsed=contentInputSchema.safeParse(raw);if(!parsed.success)return {error:"Invalid content fields"};
  const input=parsed.data;const body=input.body??'{"type":"doc","content":[{"type":"paragraph"}]}';
  if(!(await this.validateDocument(body,request)))return {error:"Content body must be valid Tiptap JSON and may only reference approved public media"};
  return {input,body};
 }
 async create(input:ContentInput,body:string){const now=Math.floor(Date.now()/1000);const id=crypto.randomUUID();const publishedAt=input.status==="published"?now:null;await this.repository.create(id,{...input,body},now,publishedAt);return {id,...input,body,publishedAt,createdAt:now,updatedAt:now};}
 async update(id:string,input:ContentInput,body:string){const now=Math.floor(Date.now()/1000);const publishedAt=input.status==="published"?now:null;const result=await this.repository.update(id,{...input,body},now,publishedAt);return result.meta.changes?{id,...input,body,publishedAt,updatedAt:now}:null;}
 private async validateDocument(body:string,request:Request){
  try{const doc=JSON.parse(body) as Node;if(doc.type!=="doc")return false;const apiOrigin=new URL(request.url).origin;
   const visit=async(node:Node):Promise<boolean>=>{
    if(node.type==="image"){const src=node.attrs?.src;const alt=node.attrs?.alt;if(typeof src!=="string"||typeof alt!=="string"||!alt.trim())return false;let asset:URL;try{asset=new URL(src,request.url);}catch{return false;}if(asset.origin!==apiOrigin)return false;const match=asset.pathname.match(/^\/media\/([a-f0-9-]+)$/i);if(!match||!(await this.repository.hasPublicMedia(match[1])))return false;}
    for(const child of node.content??[])if(!(await visit(child)))return false;return true;
   };return await visit(doc);
  }catch{return false;}
 }
}