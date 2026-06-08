"use client";

import {createContext,useContext,useState,type ReactNode} from "react";

type MyVideosSearchContextValue = {
  search: string;
  setSearch: (value: string) => void;
};

const MyVideosSearchContext =
  createContext<MyVideosSearchContextValue | null>(null);

export function MyVideosSearchProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [search, setSearch] = useState("");

  return (
    <MyVideosSearchContext.Provider value={{ search, setSearch }}> {/*context api is used here*/}
      {children}
    </MyVideosSearchContext.Provider>
  );
}

export function useMyVideosSearch() {
  const context = useContext(MyVideosSearchContext); // this comp can use the context for now.
  if (!context) {
    throw new Error(
      "useMyVideosSearch must be used within MyVideosSearchProvider"
    );
  }
  return context;
}
