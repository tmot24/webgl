import type { Meta, StoryObj } from "@storybook/react";
import { Cube } from "./Cube.tsx";

const meta = {
  title: "WebGLBook/Chapter/7/28 Cube",
  component: Cube,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof Cube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
