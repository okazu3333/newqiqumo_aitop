import type { Meta, StoryObj } from "@storybook/react";
import { SurveyImportDialog } from "./survey-import-dialog";

const meta: Meta<typeof SurveyImportDialog> = {
  title: "Survey AI/SurveyImportDialog",
  component: SurveyImportDialog,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ファイルからアンケートを作成するためのインポートダイアログコンポーネント。ドラッグ&ドロップまたはファイル選択によりファイルをアップロードできます。",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: { type: "boolean" },
      description: "ダイアログの表示状態",
    },
    onClose: {
      action: "onClose",
      description: "ダイアログを閉じる際のコールバック",
    },
    onFileImport: {
      action: "onFileImport",
      description: "ファイルがインポートされた際のコールバック",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Dialog closed"),
    onFileImport: (file: File) => console.log("File imported:", file.name),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log("Dialog closed"),
    onFileImport: (file: File) => console.log("File imported:", file.name),
  },
  parameters: {
    docs: {
      description: {
        story: "ダイアログが閉じられた状態。何も表示されません。",
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "実際のファイルアップロード機能をテストできるインタラクティブな状態。ファイルをドラッグ&ドロップまたは選択してテストしてください。",
      },
    },
  },
  render: (args) => {
    return (
      <SurveyImportDialog
        {...args}
        onClose={() => alert("ダイアログが閉じられました")}
        onFileImport={(file: File) =>
          alert(`ファイルがインポートされました: ${file.name} (${file.type})`)
        }
      />
    );
  },
};
