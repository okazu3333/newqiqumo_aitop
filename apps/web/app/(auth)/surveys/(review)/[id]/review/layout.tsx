"use client";

import { ReviewProvider, useReviewContext } from "./review-context";

type ReviewLayoutProps = {
  children: React.ReactNode;
  review: React.ReactNode;
  confirm: React.ReactNode;
};

const ReviewLayoutContent = ({
  children,
  review,
  confirm,
}: ReviewLayoutProps) => {
  const { isReviewCollapsed } = useReviewContext();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="w-full py-6 px-4">
        <div className="flex gap-4 max-w-[1440px] mx-auto">
          <div
            className={`flex flex-col gap-4 transition-all duration-300 ${
              isReviewCollapsed ? "w-full" : "w-[calc(100%-500px)]"
            }`}
          >
            {children}
            {confirm}
          </div>
          {review}
        </div>
      </main>
    </div>
  );
};

const ReviewLayout = ({ children, review, confirm }: ReviewLayoutProps) => {
  return (
    <ReviewProvider>
      <ReviewLayoutContent review={review} confirm={confirm}>
        {children}
      </ReviewLayoutContent>
    </ReviewProvider>
  );
};

export default ReviewLayout;
