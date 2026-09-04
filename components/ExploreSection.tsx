"use client";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { POAPCard } from "./POAPCard";

type StatusFilter = "all" | "public" | "allowlist" | "soulbound";
const PAGE_SIZE = 8;
const ZERO_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000000";

export function ExploreSection() {
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const { data: total } = useReadContract({ address: contractAddress(chainId), abi: POAP_ABI, functionName: "totalEvents" });
  const allIds = useMemo(() => (total !== undefined ? Array.from({ length: Number(total) + 1 }, (_, i) => BigInt(i)) : []), [total]);
  const { data: allEvents } = useReadContracts({ contracts: allIds.map((id) => ({ address: contractAddress(chainId), abi: POAP_ABI, functionName: "events" as const, args: [id] as const })), query: { enabled: allIds.length > 0 } });
  const filteredIds = useMemo(() => {
    if (!allEvents) return [];
    const q = query.trim().toLowerCase();
    const matches: bigint[] = [];
    allEvents.forEach((result, i) => {
      if (result.status !== "success" || !result.result) return;
      const [name, , , location, allowlistRoot, , , , , isSoulbound, isPublic] = result.result as readonly [string,string,bigint,string,`0x${string}`,`0x${string}`,string,bigint,string,boolean,boolean];
      if (q && !name.toLowerCase().includes(q) && !location.toLowerCase().includes(q) && !allIds[i].toString().includes(q)) return;
      if (status === "public" && !isPublic) return;
      if (status === "allowlist" && allowlistRoot === ZERO_ROOT) return;
      if (status === "soulbound" && !isSoulbound) return;
      matches.push(allIds[i]);
    });
    return matches.reverse();
  }, [allEvents, allIds, query, status]);
  const pageCount = Math.max(1, Math.ceil(filteredIds.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageIds = filteredIds.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);
  const filters: { key: StatusFilter; label: string }[] = [
    { key:"all", label:"All Events" }, { key:"public", label:"Public Mint" }, { key:"allowlist", label:"Allowlist" }, { key:"soulbound", label:"Soulbound" },
  ];

  return (
    <section className="reference-explore">
      <div className="reference-explore-head">
        <div><p className="reference-kicker accent-kicker">ONCHAIN GALLERY</p><h2>Explore events</h2></div>
        <span>{total !== undefined ? `${Number(total) + 1} ONCHAIN` : "READING CHAIN"}</span>
      </div>
      <div className="reference-explore-tools">
        <input value={query} onChange={(e)=>{setQuery(e.target.value);setPage(0)}} placeholder="Search by name, location, or event ID" />
        <div className="reference-filter-row">
          {filters.map((f)=><button key={f.key} type="button" onClick={()=>{setStatus(f.key);setPage(0)}} className={status===f.key?"active":""}>{f.label}</button>)}
        </div>
      </div>
      {allIds.length===0 && <p className="reference-empty">No POAPs registered yet on this contract — be the first.</p>}
      {allIds.length>0 && filteredIds.length===0 && <p className="reference-empty">Nothing matches that search or filter.</p>}
      <div className="reference-event-grid">{pageIds.map((id)=><POAPCard key={id.toString()} eventId={id}/>)}</div>
      {filteredIds.length>PAGE_SIZE && <div className="reference-pagination"><button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={clampedPage===0}>← Previous</button><span>PAGE {clampedPage+1} / {pageCount}</span><button onClick={()=>setPage(p=>Math.min(pageCount-1,p+1))} disabled={clampedPage>=pageCount-1}>Next →</button></div>}
    </section>
  );
}
