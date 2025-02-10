import type { Meta, StoryObj } from "@storybook/react";
import { TexturedQuad } from "./TexturedQuad.tsx";

const meta = {
  title: "WebGLBook/Chapter/5/15 TexturedQuad",
  component: TexturedQuad,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof TexturedQuad>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
