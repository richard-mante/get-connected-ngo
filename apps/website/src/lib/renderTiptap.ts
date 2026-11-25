type RichNode={type?:string;text?:string;attrs?:Record<string,unknown>;marks?:RichMark[];content?:RichNode[]};
type RichMark={type?:string;attrs?:Record<string,unknown>};
const escape=(value:string)=>value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
function safeHref(value:string,base:string){try{const url=new URL(value,base);if(["https:","http:","mailto:","tel:"].includes(url.protocol))return url.href;}catch{}return null;}
function renderText(node:RichNode,base:string){
 let output=escape(node.text??"");
 for(const mark of node.marks??[]){
  if(mark.type==="bold")output=`<strong>${output}</strong>`;
  else if(mark.type==="italic")output=`<em>${output}</em>`;
  else if(mark.type==="strike")output=`<s>${output}</s>`;
  else if(mark.type==="code")output=`<code>${output}</code>`;
  else if(mark.type==="link"){
   const href=typeof mark.attrs?.href==="string"?safeHref(mark.attrs.href,base):null;
   if(href)output=`<a href="${escape(href)}" rel="noopener noreferrer">${output}</a>`;
  }
 }
 return output;
}
function renderNode(node:RichNode,base:string):string{
 const children=(node.content??[]).map(child=>renderNode(child,base)).join("");
 switch(node.type){
  case "doc":return children;
  case "text":return renderText(node,base);
  case "paragraph":return `<p>${children}</p>`;
  case "heading":{const raw=node.attrs?.level;const level=typeof raw==="number"&&raw>=1&&raw<=6?Math.floor(raw):2;return `<h${level}>${children}</h${level}>`;}
  case "bulletList":return `<ul>${children}</ul>`;
  case "orderedList":{const start=node.attrs?.start;const attr=typeof start==="number"&&start>1?` start="${Math.floor(start)}"`:"";return `<ol${attr}>${children}</ol>`;}
  case "listItem":return `<li>${children}</li>`;
  case "blockquote":return `<blockquote>${children}</blockquote>`;
  case "hardBreak":return "<br />";
  case "horizontalRule":return "<hr />";
  case "image":{
   const src=node.attrs?.src;const alt=node.attrs?.alt;
   if(typeof src!=="string"||typeof alt!=="string")return "";
   try{const url=new URL(src,base);if(url.origin!==new URL(base).origin||!/^\/media\/[a-f0-9-]+$/i.test(url.pathname))return "";
    return `<img src="${escape(url.href)}" alt="${escape(alt)}" loading="lazy" decoding="async" />`;
   }catch{return "";}
  }
  default:return children;
 }
}
export function renderTiptap(body:string|null|undefined,apiBase:string){
 if(!body)return "";
 try{const document=JSON.parse(body) as RichNode;if(document.type!=="doc")return "";return renderNode(document,apiBase);}catch{return "";}
}
