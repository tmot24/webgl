import type { Meta, StoryObj } from "@storybook/react";
import { ZFighting } from "./ZFighting.tsx";

const meta = {
  title: "WebGLBook/Chapter/7/27 ZFighting",
  component: ZFighting,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof ZFighting>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
