import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea, ScrollBar } from "./scroll-area";

const meta: Meta<typeof ScrollArea> = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ScrollArea className="h-72 w-48 rounded-md border p-4" {...args}>
      <div className="space-y-2">
        {Array.from({ length: 50 }, (_, i) => (
          <div key={`item-${i}`} className="text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const WithHorizontalScroll: Story = {
  render: (args) => (
    <ScrollArea className="h-72 w-48 rounded-md border" {...args}>
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={`card-${i}`}
            className="w-[250px] shrink-0 rounded-md border p-4 text-sm"
          >
            <h4 className="mb-2 text-sm font-medium leading-none">
              Card {i + 1}
            </h4>
            <p className="text-sm text-muted-foreground">
              This is a wide card that requires horizontal scrolling to view
              completely.
            </p>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

export const TextContent: Story = {
  render: (args) => (
    <ScrollArea className="h-72 w-96 rounded-md border p-4" {...args}>
      <h4 className="mb-4 text-sm font-medium leading-none">Lorem Ipsum</h4>
      <p className="text-sm text-muted-foreground">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
      <br />
      <p className="text-sm text-muted-foreground">
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
        illo inventore veritatis et quasi architecto beatae vitae dicta sunt
        explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
        odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
        voluptatem sequi nesciunt.
      </p>
      <br />
      <p className="text-sm text-muted-foreground">
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit, sed quia non numquam eius modi tempora
        incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim
        ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
        laboriosam, nisi ut aliquid ex ea commodi consequatur?
      </p>
    </ScrollArea>
  ),
};

export const SmallHeight: Story = {
  render: (args) => (
    <ScrollArea className="h-20 w-48 rounded-md border p-4" {...args}>
      <div className="space-y-2">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={`short-${i}`} className="text-sm">
            Short item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const CustomScrollbar: Story = {
  render: (args) => (
    <ScrollArea className="h-72 w-48 rounded-md border p-4" {...args}>
      <div className="space-y-2">
        {Array.from({ length: 50 }, (_, i) => (
          <div key={`custom-${i}`} className="text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar className="bg-red-100" />
    </ScrollArea>
  ),
};
