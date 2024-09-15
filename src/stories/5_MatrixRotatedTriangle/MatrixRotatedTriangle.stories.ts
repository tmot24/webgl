import type { Meta, StoryObj } from "@storybook/react";
import { MatrixRotatedTriangle } from "./MatrixRotatedTriangle.tsx";

const meta = {
  title: "Chapter/3/4 MatrixRotatedTriangle",
  component: MatrixRotatedTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MatrixRotatedTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
