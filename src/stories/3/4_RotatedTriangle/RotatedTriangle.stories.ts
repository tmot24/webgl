import type { Meta, StoryObj } from "@storybook/react";
import { RotatedTriangle } from "./RotatedTriangle.tsx";

const meta = {
  title: "Chapter/3/5 RotatedTriangle",
  component: RotatedTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof RotatedTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
