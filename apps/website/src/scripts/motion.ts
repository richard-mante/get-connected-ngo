import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const menu = document.querySelector<HTMLButtonElement>("[data-menu]");
const nav = document.querySelector<HTMLElement>("[data-nav]");
menu?.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));menu.setAttribute("aria-label",open?"Open menu":"Close menu");nav?.classList.toggle("open",!open);document.body.classList.toggle("menu-open",!open);});
nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{menu?.setAttribute("aria-expanded","false");nav?.classList.remove("open");document.body.classList.remove("menu-open");}));
const header=document.querySelector<HTMLElement>("[data-header]");
const updateHeader=()=>header?.classList.toggle("scrolled",scrollY>20);
updateHeader();addEventListener("scroll",updateHeader,{passive:true});
if(!reduced){
 const lenis=new Lenis({lerp:.085,smoothWheel:true,syncTouch:false});
 lenis.on("scroll",ScrollTrigger.update);
 gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
 gsap.timeline({defaults:{ease:"power3.out"}}).from(".hero .eyebrow",{y:18,opacity:0,duration:.6}).from("[data-hero]",{y:42,opacity:0,duration:.9},"-=.3").from(".lead",{y:20,opacity:0,duration:.65},"-=.5").from(".actions>*",{y:14,opacity:0,stagger:.12,duration:.5},"-=.35").from("[data-hero-visual]",{y:28,opacity:0,duration:1},"-=.8");
 gsap.utils.toArray<HTMLElement>(".reveal").forEach(el=>gsap.from(el,{y:32,opacity:0,duration:.8,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 86%",once:true}}));
 gsap.to(".hero-photo img",{yPercent:6,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:.7}});
}
