import type { Meta, StoryObj } from "@storybook/react";
import { Quad } from "./Quad.tsx";

const meta = {
  title: "Chapter/3/2 Quad",
  component: Quad,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof Quad>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
