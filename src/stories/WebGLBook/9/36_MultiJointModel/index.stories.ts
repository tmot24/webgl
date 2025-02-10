import type { Meta, StoryObj } from "@storybook/react";
import { MultiJointModel } from "./MultiJointModel.tsx";

const meta = {
  title: "WebGLBook/Chapter/9/36 MultiJointModel",
  component: MultiJointModel,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MultiJointModel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
