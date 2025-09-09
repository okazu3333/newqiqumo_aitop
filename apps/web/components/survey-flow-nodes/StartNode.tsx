import { Handle, Position } from "@xyflow/react";
import { Card, CardHeader } from "@/components/ui/card";

type StartNodeProps = {
  data: { label: string };
};

export const StartNode = ({ data }: StartNodeProps) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <Card className="flex flex-col items-start w-64 bg-white rounded-lg border border-solid border-[#DCDCDC]">
        <CardHeader className="gap-2 p-4 w-full flex items-center border border-solid border-[#DCDCDC]">
          <div className="inline-flex items-center gap-2">
            <span className="text-[#333333] text-[14px] font-semibold leading-[24px] text-center whitespace-nowrap">
              {data.label}
            </span>
          </div>
        </CardHeader>
      </Card>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};
