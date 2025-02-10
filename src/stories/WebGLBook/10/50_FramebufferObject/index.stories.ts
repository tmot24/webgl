import type { Meta, StoryObj } from "@storybook/react";
import { FramebufferObject } from "./FramebufferObject.tsx";

const meta = {
  title: "WebGLBook/Chapter/10/50 FramebufferObject",
  component: FramebufferObject,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof FramebufferObject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
