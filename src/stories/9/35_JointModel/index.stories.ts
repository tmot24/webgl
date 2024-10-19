import type { Meta, StoryObj } from "@storybook/react";
import { JointModel } from "./JointModel.tsx";

const meta = {
  title: "Chapter/9/35 JointModel",
  component: JointModel,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof JointModel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
