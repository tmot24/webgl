import type { Meta, StoryObj } from "@storybook/react";
import { OrthoView } from "./OrthoView.tsx";

const meta = {
  title: "Chapter/7/21 OrthoView",
  component: OrthoView,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof OrthoView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
