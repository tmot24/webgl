import type { Meta, StoryObj } from "@storybook/react";
import { Triangle } from "./Triangle.tsx";

const meta = {
  title: "Chapter/3/1 Triangle",
  component: Triangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof Triangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
