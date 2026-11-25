import { ContentList } from "../../components/ContentList";
export default async function ContentPage({searchParams}:{searchParams:Promise<{type?:string}>}) {
  const {type}=await searchParams;
  const allowed=["story","program","event","page"];
  return <main className="main cms-main"><ContentList initialType={allowed.includes(type??"")?type:"all"}/></main>;
}
