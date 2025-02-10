import type { Meta, StoryObj } from "@storybook/react";
import { LibMatrixRotatedTriangle } from "./LibMatrixRotatedTriangle.tsx";

const meta = {
  title: "WebGLBook/Chapter/4/08 LibMatrixRotatedTriangle",
  component: LibMatrixRotatedTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LibMatrixRotatedTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
