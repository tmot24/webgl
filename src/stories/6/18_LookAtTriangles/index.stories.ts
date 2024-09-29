import type { Meta, StoryObj } from "@storybook/react";
import { LookAtTriangles } from "./LookAtTriangles.tsx";

const meta = {
  title: "Chapter/6/18 LookAtTriangles",
  component: LookAtTriangles,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LookAtTriangles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
