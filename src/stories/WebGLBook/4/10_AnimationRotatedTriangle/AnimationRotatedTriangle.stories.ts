import type { Meta, StoryObj } from "@storybook/react";
import { AnimationRotatedTriangle } from "./AnimationRotatedTriangle.tsx";

const meta = {
  title: "WebGLBook/Chapter/4/10 AnimationRotatedTriangle",
  component: AnimationRotatedTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof AnimationRotatedTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
