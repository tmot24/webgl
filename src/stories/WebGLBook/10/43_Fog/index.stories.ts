import type { Meta, StoryObj } from "@storybook/react";
import { Fog } from "./Fog.tsx";

const meta = {
  title: "WebGLBook/Chapter/10/43 Fog",
  component: Fog,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof Fog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
