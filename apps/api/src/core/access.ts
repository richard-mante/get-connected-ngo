import {createRemoteJWKSet,jwtVerify} from "jose";
import type {Env} from "./env";
let jwks:ReturnType<typeof createRemoteJWKSet>|undefined;
function issuerFor(env:Env){return env.ACCESS_TEAM_DOMAIN.replace(/\/$/,"");}
function getJwks(env:Env){if(!jwks)jwks=createRemoteJWKSet(new URL("/cdn-cgi/access/certs",issuerFor(env)));return jwks;}
export async function requireAdmin(request:Request,env:Env){
 const token=request.headers.get("cf-access-jwt-assertion");
 if(!token||!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD)return null;
 try{
  const {payload}=await jwtVerify(token,getJwks(env),{issuer:issuerFor(env),audience:env.ACCESS_AUD});
  const email=typeof payload.email==="string"?payload.email.toLowerCase():"";
  const allowed=env.ADMIN_EMAILS.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
  if(!email||!allowed.includes(email))return null;
  return {email};
 }catch{return null;}
}