import type {Env} from "../../core/env";
import {error,json} from "../../core/http";
type Auth=(request:Request,env:Env)=>Promise<{email:string}|null>;
const keys=["organizationName","contactEmail","contactPhone","publicAddress","websiteUrl","facebookUrl","instagramUrl","linkedinUrl","footerText","defaultSeoTitle","defaultSeoDescription"] as const;
type Settings=Record<(typeof keys)[number],string>;
const defaults:Settings={organizationName:"Get Connected",contactEmail:"",contactPhone:"",publicAddress:"",websiteUrl:"",facebookUrl:"",instagramUrl:"",linkedinUrl:"",footerText:"",defaultSeoTitle:"Get Connected",defaultSeoDescription:""};
function parseRows(rows:Array<{key:string;value:string}>):Settings{const result={...defaults};for(const row of rows){if(keys.includes(row.key as typeof keys[number]))result[row.key as keyof Settings]=row.value;}return result;}
async function read(env:Env){const {results}=await env.DB.prepare("SELECT key,value FROM organization_settings").all<{key:string;value:string}>();return parseRows(results??[]);}
export async function handleSettingsRoute(request:Request,env:Env,cors:Record<string,string>,authenticate:Auth):Promise<Response|null>{
 const path=new URL(request.url).pathname;const fail=(message:string,status:number)=>error(message,status,cors);
 if(path==="/api/v1/settings"&&request.method==="GET"){return json({settings:await read(env)},200,cors);}
 if(path!=="/api/v1/admin/settings")return null;
 const admin=await authenticate(request,env);if(!admin)return fail("Unauthorized",401);
 if(request.method==="GET")return json({settings:await read(env)},200,cors);
 if(request.method==="PUT"){
  let raw:unknown;try{raw=await request.json();}catch{return fail("Invalid JSON body",400);}
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return fail("Settings must be an object",400);
  const input=(raw as {settings?:unknown}).settings;
  if(!input||typeof input!=="object"||Array.isArray(input))return fail("Missing settings object",400);
  const record=input as Record<string,unknown>;
  if(Object.keys(record).some(key=>!keys.includes(key as typeof keys[number])))return fail("Unknown settings field",400);
  for(const [key,value] of Object.entries(record)){
   if(typeof value!=="string"||value.length>2000)return fail(\`Invalid value for \${key}\`,400);
   if(key==="contactEmail"&&value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return fail("Invalid contact email",400);
   if(["websiteUrl","facebookUrl","instagramUrl","linkedinUrl"].includes(key)&&value){
    try{const url=new URL(value);if(url.protocol!=="https:"&&url.protocol!=="http:")return fail(\`Invalid URL for \${key}\`,400);}
    catch{return fail(\`Invalid URL for \${key}\`,400);}
   }
  }
  if("organizationName" in record&&typeof record.organizationName==="string"&&!record.organizationName.trim())return fail("Organization name cannot be empty",400);
  const now=Math.floor(Date.now()/1000);
  const statements=Object.entries(record).map(([key,value])=>env.DB.prepare("INSERT INTO organization_settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(key,value,now));
  if(statements.length)await env.DB.batch(statements);
  return json({settings:await read(env)},200,cors);
 }
 return fail("Method not allowed",405);
}
