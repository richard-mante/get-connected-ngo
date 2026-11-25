import { ContentEditor } from "../../../components/ContentEditor";

const allowed = new Set(["story", "program", "event", "page"]);
export default async function NewContentPage({searchParams}:{searchParams:Promise<{type?:string}>}) {
  const {type}=await searchParams;
  const contentType=allowed.has(type??"")?type as "story"|"program"|"event"|"page":"story";
  return <main className="main cms-main"><ContentEditor contentType={contentType}/></main>;
}
