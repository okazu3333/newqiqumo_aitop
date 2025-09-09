"use client";

import { createContext, useContext, useState } from "react";

type ReviewContextType = {
  isReviewCollapsed: boolean;
  setIsReviewCollapsed: (value: boolean) => void;
};

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReviewCollapsed, setIsReviewCollapsed] = useState(false);

  return (
    <ReviewContext.Provider value={{ isReviewCollapsed, setIsReviewCollapsed }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviewContext = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error("useReviewContext must be used within a ReviewProvider");
  }
  return context;
};
