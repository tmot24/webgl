import type { Meta, StoryObj } from "@storybook/react";
import { MultiJointModelSegments } from "./MultiJointModelSegments.tsx";

const meta = {
  title: "Chapter/9/37 MultiJointModelSegments",
  component: MultiJointModelSegments,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MultiJointModelSegments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
