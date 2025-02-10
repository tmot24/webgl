import type { Meta, StoryObj } from "@storybook/react";
import { ColoredCube } from "./ColoredCube.tsx";

const meta = {
  title: "WebGLBook/Chapter/7/29 ColoredCube",
  component: ColoredCube,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof ColoredCube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
