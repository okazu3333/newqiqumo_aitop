"use client";

import {
  FileText,
  MessageSquare,
  Plus,
  Settings,
  Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RespondentAttributesDialog } from "@/components/respondent-attributes-dialog";
import { ReviewUrlDialog } from "@/components/review-url-dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ProjectsSection = () => {
  const router = useRouter();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<number>(1);
  const [respondentDialogOpen, setRespondentDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const projects = [
    {
      id: "SRB008",
      numericId: 1,
      title: "家族構成に関する調査",
      status: "作成中",
      statusStyle:
        "border-[#4BBC80] text-[#4BBC80] bg-white hover:bg-white hover:text-[#4BBC80]",
      createdDate: "2025/06/04 08:00",
      updatedDate: "2025/06/10 15:30",
      creator: "山田太郎",
    },
    {
      id: "SRB009",
      numericId: 1,
      title: "〜〜〜〜に関するイメ…",
      status: "作成中",
      statusStyle:
        "border-[#4BBC80] text-[#4BBC80] bg-white hover:bg-white hover:text-[#4BBC80]",
      createdDate: "2025/06/04 08:00",
      updatedDate: "2025/06/10 15:30",
      creator: "山田太郎",
    },
    {
      id: "SRB010",
      numericId: 1,
      title: "〜〜〜〜満足度調査",
      status: "レビュー待ち",
      statusStyle:
        "border-[#60ADC2] text-[#60ADC2] bg-white hover:bg-white hover:text-[#60ADC2]",
      createdDate: "2025/06/04 08:00",
      updatedDate: "2025/06/10 15:30",
      creator: "山田太郎",
    },
    {
      id: "SRB011",
      numericId: 1,
      title: "調査タイトル横幅は切…",
      status: "レビュー完了",
      statusStyle:
        "text-white bg-[#60ADC2] border-[#60ADC2] hover:bg-[#60ADC2] hover:text-white",
      createdDate: "2025/06/04 08:00",
      updatedDate: "2025/06/10 15:30",
      creator: "山田太郎",
    },
    {
      id: "SRB012",
      numericId: 1,
      title: "満足度調査",
      status: "作成完了",
      statusStyle:
        "text-white bg-[#4BBC80] border-[#4BBC80] hover:bg-[#4BBC80] hover:text-white",
      createdDate: "2025/06/04 08:00",
      updatedDate: "2025/06/10 15:30",
      creator: "山田太郎",
    },
    {
      id: "SRB013",
      numericId: 1,
      title: "満足度調査",
      status: "配信中",
      statusStyle:
        "text-white bg-[#D96868] border-[#D96868] hover:bg-[#D96868] hover:text-white",
      createdDate: "2025/06/04 08:00",
      updatedDate: "2025/06/10 15:30",
      creator: "山田太郎",
    },
    {
      id: "SRB014",
      numericId: 1,
      title: "満足度調査",
      status: "配信終了",
      statusStyle:
        "text-white bg-[#ABAEB1] border-[#ABAEB1] hover:bg-[#ABAEB1] hover:text-white",
      createdDate: "2025/06/04 08:00",
      updatedDate: "2025/06/10 15:30",
      creator: "山田太郎",
    },
    {
      id: "SRB015",
      numericId: 1,
      title: "満足度調査",
      status: "配信終了",
      statusStyle:
        "text-white bg-[#ABAEB1] border-[#ABAEB1] hover:bg-[#ABAEB1] hover:text-white",
      createdDate: "2025/06/04 08:00",
      updatedDate: "2025/06/10 15:30",
      creator: "山田太郎",
    },
  ];

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedProjects(projects.map((p) => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects([...selectedProjects, projectId]);
    } else {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    }
  };

  const handleRowClick = (numericId: number, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.tagName === "INPUT" ||
      target.closest('input[type="checkbox"]')
    ) {
      return;
    }
    router.push(`/surveys/${numericId}/question/preview`);
  };

  return (
    <Card className="bg-transparent shadow-none border-none">
      <CardHeader className="bg-[#138fb5] text-white rounded-t-lg py-2 flex items-center justify-center w-[200px]">
        <h2 className="text-base font-bold">現在進行中の案件</h2>
      </CardHeader>
      <CardContent className="p-6 bg-white border shadow rounded-b-lg">
        <div className="mb-4">
          <p className="text-gray-700 mb-4">
            作成する調査タイトルを選択してください。新規で作成する場合は「新規調査作成」から行えます。
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                選択項目を削除
              </Button>
            </div>
            <Button
              onClick={() => router.push('/surveys/assistant')}
              className="bg-[#138fb5] hover:bg-[#0f7a9e]"
            >
              <Plus className="w-4 h-4 mr-1" />
              新規調査作成
            </Button>
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#75bacf] hover:bg-[#75bacf]">
                <TableHead className="w-12 text-white">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-white">調査コード</TableHead>
                <TableHead className="text-white">調査タイトル</TableHead>
                <TableHead className="text-white">ステータス</TableHead>
                <TableHead className="text-white">更新日時</TableHead>
                <TableHead className="text-white">実査日時</TableHead>
                <TableHead className="text-white">作成者</TableHead>
                <TableHead className="text-white text-center whitespace-nowrap w-24">レビューリンク</TableHead>
                <TableHead className="text-white text-center whitespace-nowrap w-24">回答画面</TableHead>
                <TableHead className="text-white text-center whitespace-nowrap w-24">配信</TableHead>
                <TableHead className="text-white text-center whitespace-nowrap w-24">レポート</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const isSelected = selectedProjects.includes(project.id);
                return (
                  <TableRow
                    key={project.id}
                    className={`cursor-pointer ${
                      isSelected ? "bg-yellow-50 hover:bg-yellow-100" : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={(e) => handleRowClick(project.numericId, e)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectProject(project.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{project.id}</TableCell>
                    <TableCell>{project.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${project.statusStyle} rounded-[4px]`}
                        style={{ transition: "none" }}
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{project.updatedDate}</TableCell>
                    <TableCell className="text-sm text-gray-600">{project.createdDate}</TableCell>
                    <TableCell>{project.creator}</TableCell>
                    <TableCell className="text-center w-24">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSurveyId(project.numericId);
                          setReviewDialogOpen(true);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center w-24">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject({ id: project.id, title: project.title });
                          setRespondentDialogOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center w-24">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open("/non-existent-page", "_blank");
                        }}
                        title="配信設定を開く"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center w-24">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/surveys/${project.numericId}/report`);
                        }}
                        title="レポートページを開く"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <ReviewUrlDialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen} surveyId={selectedSurveyId} />
      {selectedProject && (
        <RespondentAttributesDialog
          open={respondentDialogOpen}
          onOpenChange={setRespondentDialogOpen}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
        />
      )}
    </Card>
  );
};
