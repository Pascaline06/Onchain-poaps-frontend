"use client";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ExploreSection } from "@/components/ExploreSection";
export default function EventsPage(){return <main><Nav/><div className="mx-auto max-w-7xl px-6 pt-14"><p className="eyebrow text-accent">DISCOVER THE NETWORK</p><h1 className="mt-2 text-5xl font-black tracking-[-.04em] sm:text-6xl">Explore Events.</h1><p className="mt-4 max-w-2xl text-ink/55">Discover onchain memories, verify event records and collect the ones you actually attended.</p></div><ExploreSection/><Footer/></main>}
