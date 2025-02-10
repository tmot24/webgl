import type { Meta, StoryObj } from "@storybook/react";
import { BlendedCube } from "./BlendedCube.tsx";

const meta = {
  title: "WebGLBook/Chapter/10/47 BlendedCube",
  component: BlendedCube,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof BlendedCube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
