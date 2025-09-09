type GroupNodeProps = {
  data?: { title: string };
};

export const GroupNode = ({ data }: GroupNodeProps) => {
  return (
    <div className="flex flex-col items-start gap-2 pt-2 pb-4 px-4 bg-[#f5f5f5] rounded">
      <h3 className="w-fit font-bold text-[#333333] text-[12px] leading-[24px] whitespace-nowrap">
        {data?.title || "固定セクション：性別・年齢・居住地"}
      </h3>
    </div>
  );
};
