import type { Meta, StoryObj } from "@storybook/react";
import { PerspectiveView } from "./PerspectiveView.tsx";

const meta = {
  title: "Chapter/7/23 PerspectiveView",
  component: PerspectiveView,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof PerspectiveView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
