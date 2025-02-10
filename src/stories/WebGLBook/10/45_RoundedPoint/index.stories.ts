import type { Meta, StoryObj } from "@storybook/react";
import { RoundedPoint } from "./RoundedPoint.tsx";

const meta = {
  title: "WebGLBook/Chapter/10/45 RoundedPoint",
  component: RoundedPoint,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof RoundedPoint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
