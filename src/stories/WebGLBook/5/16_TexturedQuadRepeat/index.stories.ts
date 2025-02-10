import type { Meta, StoryObj } from "@storybook/react";
import { TexturedQuadRepeat } from "./TexturedQuadRepeat.tsx";

const meta = {
  title: "WebGLBook/Chapter/5/16 TexturedQuadRepeat",
  component: TexturedQuadRepeat,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof TexturedQuadRepeat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
