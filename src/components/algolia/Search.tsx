"use client";

import { InstantSearch, SearchBox, Hits } from "react-instantsearch";
import Hit, { type HitProps } from "./Hit";
import searchClient from "./searchClient";

export default function Search() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="projects"
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      <div className="mx-auto px-4 pb-4">
        <div className="flex flex-row items-center justify-between">
          <SearchBox
            className="mb-4 w-full text-black dark:text-white sm:gap-x-1"
            placeholder="Buscar proyectos..."
          />
        </div>
        <div className="h-[50vh] overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-sm shadow-inner">
          <Hits<HitProps["hit"]> hitComponent={Hit} />
        </div>
      </div>
    </InstantSearch>
  );
}
