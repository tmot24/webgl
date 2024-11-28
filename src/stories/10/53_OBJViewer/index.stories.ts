import type { Meta, StoryObj } from "@storybook/react";
import { OBJViewer } from "./OBJViewer.tsx";

const meta = {
  title: "Chapter/10/53 OBJViewer",
  component: OBJViewer,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof OBJViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
