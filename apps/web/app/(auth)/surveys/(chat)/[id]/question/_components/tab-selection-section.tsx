export const TabSelectionSection = () => {
  // Define tab data for easier maintenance
  const tabItems = [
    { id: "screening", label: "スクリーニング調査", isActive: true },
    { id: "main", label: "本調査", isActive: false },
  ];

  return (
    <div className="px-6">
      <div className="flex items-center gap-2">
        {tabItems.map((tab) => (
          <div
            key={tab.id}
            className={`w-52 h-10 rounded-[8px_8px_0px_0px] px-8 py-2 flex items-center justify-center ${
              tab.isActive
                ? "bg-[#138FB5] text-white font-bold text-base"
                : "bg-white text-[#138FB5] font-medium text-base border-t-2 border-r-2 border-l-2 border-[#138FB5]"
            }`}
          >
            <span className="text-center leading-6 font-['Noto_Sans_JP']">
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
