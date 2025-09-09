export type ReviewItem = {
  id: number;
  questionNo: string;
  type: string;
  reviewerName: string;
  time: string;
  comment: string;
  status: "unresolved" | "resolved";
  reviewType: "ai" | "team";
  replies?: number;
  // Display position properties
  sectionId?: string;
  questionId?: string;
  position?: {
    x: number; // x position in percentage (0-100) from left of parent element
    y: number; // y position in percentage (0-100) from top of parent element
  };
};

export type CommentProps = ReviewItem & {
  className?: string;
  userType?: "reviewer" | "reviewee";
  question?: {
    id: number;
    code: string;
    title: string;
    type: string;
    options?: Array<{
      value: string;
      label: string;
    }>;
    suffix?: string | null;
    config?: any;
    isRequired: boolean;
    respondentCondition?: string;
    answerControl?: string;
    targetCondition?: string;
    skipCondition?: string;
    displayOrder?: string;
    jumpCondition?: string;
  };
};
