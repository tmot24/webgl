import type { Meta, StoryObj } from "@storybook/react";
import { DepthBuffer } from "./DepthBuffer.tsx";

const meta = {
  title: "Chapter/7/26 DepthBuffer",
  component: DepthBuffer,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof DepthBuffer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
