"use client";

import { motion } from "framer-motion";

export default function SkeletonLoader() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      {/* Movie card */}
      <div className="rounded-2xl border border-imdb-border bg-card-gradient overflow-hidden flex flex-col sm:flex-row">
        <div className="skeleton sm:w-56 w-full h-80 sm:h-72 flex-shrink-0 rounded-none" />
        <div className="flex-1 p-7 space-y-4">
          <div className="flex gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-12 rounded-full" />
          </div>
          <div className="skeleton h-14 w-4/5 rounded-xl" />
          <div className="skeleton h-3.5 w-1/3 rounded" />
          <div className="skeleton h-3.5 w-1/4 rounded" />
          <div className="mt-6 pt-5 border-t border-imdb-border/40 flex justify-between items-end">
            <div className="space-y-2">
              <div className="skeleton h-3 w-14 rounded" />
              <div className="skeleton h-5 w-32 rounded" />
            </div>
            <div className="skeleton w-20 h-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 rounded-2xl border border-imdb-border bg-card-gradient p-6 space-y-4">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-4/6 rounded" />
          <div className="h-px bg-imdb-border/40 my-2" />
          <div className="skeleton h-3 w-16 rounded" />
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({length:4}).map((_,i)=>(
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-imdb-border bg-card-gradient p-6 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2"><div className="skeleton h-3 w-20 rounded"/><div className="skeleton h-6 w-36 rounded"/></div>
            <div className="skeleton h-10 w-24 rounded-xl" />
          </div>
          <div className="flex items-center gap-4">
            <div className="skeleton w-16 h-16 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="skeleton h-2 w-full rounded-full"/>
              <div className="skeleton h-2 w-3/4 rounded-full"/>
              <div className="skeleton h-2 w-1/2 rounded-full"/>
            </div>
          </div>
          <div className="skeleton h-20 rounded-xl" />
        </div>
      </div>

      {/* Reviews */}
      <div className="rounded-2xl border border-imdb-border bg-card-gradient overflow-hidden">
        <div className="p-5 border-b border-imdb-border/60 flex justify-between">
          <div className="space-y-1.5"><div className="skeleton h-4 w-36 rounded"/><div className="skeleton h-3 w-24 rounded"/></div>
          <div className="skeleton h-8 w-32 rounded-lg"/>
        </div>
        <div className="p-5 space-y-3">
          {Array.from({length:3}).map((_,i)=>(
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
