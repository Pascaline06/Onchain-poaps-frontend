import type { PassportEntryData } from "./usePassportEntryData";
import { formatEventDate } from "@/components/PassportEntry";
import { shortAddress } from "./links";

const BG="#080808", PANEL="#111214", WHITE="#ffffff", MUTED="#9b9b9f", ACCENT="#ff5a1f";
function loadImage(src:string):Promise<HTMLImageElement|null>{return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src})}
function roundRect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
export async function exportBoardingPass({data,eventId,owner,filename,qrDataUrl}:{data:PassportEntryData;eventId:bigint;owner:`0x${string}`;filename:string;qrDataUrl?:string}){
 const width=1200,height=620,canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas not supported in this browser.");
 ctx.fillStyle=BG;ctx.fillRect(0,0,width,height);
 const glow=ctx.createRadialGradient(930,120,0,930,120,420);glow.addColorStop(0,"rgba(255,90,31,.28)");glow.addColorStop(1,"rgba(255,90,31,0)");ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 ctx.strokeStyle="rgba(255,255,255,.12)";ctx.lineWidth=2;roundRect(ctx,28,28,width-56,height-56,34);ctx.stroke();
 // orange hatch accent
 ctx.save();ctx.strokeStyle="rgba(255,112,45,.36)";ctx.lineWidth=2;for(let i=-100;i<500;i+=14){ctx.beginPath();ctx.moveTo(820+i,40);ctx.lineTo(1120+i,340);ctx.stroke()}ctx.restore();
 ctx.fillStyle=ACCENT;ctx.font="800 15px system-ui, sans-serif";ctx.fillText("ONCHAIN POAPS · VERIFIED ATTENDANCE",70,82);
 const art=await (data.image?loadImage(data.image):Promise.resolve(null));ctx.fillStyle=PANEL;roundRect(ctx,70,118,300,300,26);ctx.fill();if(art)ctx.drawImage(art,90,138,260,260);
 ctx.fillStyle="#ff9a63";roundRect(ctx,420,118,188,36,18);ctx.fill();ctx.fillStyle=BG;ctx.font="900 13px system-ui, sans-serif";ctx.fillText("✓ VERIFIED ATTENDEE",438,142);
 ctx.fillStyle=WHITE;ctx.font="900 48px system-ui, sans-serif";const title=(data.name||"Onchain POAP").slice(0,34);ctx.fillText(title,420,215);
 ctx.fillStyle=MUTED;ctx.font="600 19px system-ui, sans-serif";ctx.fillText([data.location,formatEventDate(data.eventDate)].filter(Boolean).join(" · ")||"Permanent attendance record",420,255);
 const fields=[["TRAVELER",shortAddress(owner)],["EVENT",`#${eventId}`],["NETWORK","BASE"]];fields.forEach(([label,value],i)=>{const x=420+i*190;ctx.fillStyle="rgba(255,255,255,.35)";ctx.font="800 11px system-ui, sans-serif";ctx.fillText(label,x,330);ctx.fillStyle=WHITE;ctx.font="700 17px ui-monospace, monospace";ctx.fillText(value,x,358)});
 ctx.fillStyle="#86ff99";ctx.font="800 13px system-ui, sans-serif";ctx.fillText("✓ VERIFIED ONCHAIN",420,418);ctx.fillStyle="rgba(255,255,255,.45)";ctx.fillText("ERC-1155  ·  ARTWORK + METADATA ONCHAIN",575,418);
 if(qrDataUrl){const qr=await loadImage(qrDataUrl);ctx.fillStyle=WHITE;roundRect(ctx,930,356,150,150,18);ctx.fill();if(qr)ctx.drawImage(qr,945,371,120,120);ctx.fillStyle=MUTED;ctx.font="800 11px system-ui, sans-serif";ctx.textAlign="center";ctx.fillText("SCAN TO VERIFY",1005,530);ctx.textAlign="left"}
 ctx.fillStyle="rgba(255,255,255,.38)";ctx.font="600 14px system-ui, sans-serif";ctx.fillText("Proof you showed up — permanent, portable, independently verifiable.",70,540);
 const link=document.createElement("a");link.href=canvas.toDataURL("image/png");link.download=filename;link.click();
}
