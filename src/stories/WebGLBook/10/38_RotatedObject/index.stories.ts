import type { Meta, StoryObj } from "@storybook/react";
import { RotatedObject } from "./RotatedObject.tsx";

const meta = {
  title: "WebGLBook/Chapter/10/38 RotatedObject",
  component: RotatedObject,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof RotatedObject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
