"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

type GroupDetailsPanelProps = {
  selectedGroup?: {
    id: string;
    title: string;
    description?: string;
    questions?: Array<{
      id: string;
      question: string;
      type: string;
    }>;
  };
};

export const GroupDetailsPanel = ({
  selectedGroup,
}: GroupDetailsPanelProps) => {
  if (!selectedGroup) {
    return (
      <Card className="h-full">
        <CardHeader>
          <h3 className="text-lg font-semibold">グループ詳細</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">グループを選択してください</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">{selectedGroup.title}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedGroup.description && (
          <p className="text-sm text-gray-600">{selectedGroup.description}</p>
        )}

        {selectedGroup.questions && selectedGroup.questions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">含まれる質問:</h4>
            <ul className="space-y-1">
              {selectedGroup.questions.map((q) => (
                <li key={q.id} className="text-sm text-gray-600">
                  • {q.question} ({q.type})
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
