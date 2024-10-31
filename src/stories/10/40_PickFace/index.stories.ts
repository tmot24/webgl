import type { Meta, StoryObj } from "@storybook/react";
import { PickFace } from "./PickFace.tsx";

const meta = {
  title: "Chapter/10/40 PickFace",
  component: PickFace,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof PickFace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
