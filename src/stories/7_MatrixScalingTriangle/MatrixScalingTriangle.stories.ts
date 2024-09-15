import type { Meta, StoryObj } from "@storybook/react";
import { MatrixScalingTriangle } from "./MatrixScalingTriangle.tsx";

const meta = {
  title: "Chapter/3/6 MatrixScalingTriangle",
  component: MatrixScalingTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MatrixScalingTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
