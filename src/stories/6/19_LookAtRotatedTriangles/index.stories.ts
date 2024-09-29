import type { Meta, StoryObj } from "@storybook/react";
import { LookAtRotatedTriangles } from "./LookAtRotatedTriangles.tsx";

const meta = {
  title: "Chapter/6/19 LookAtRotatedTriangles",
  component: LookAtRotatedTriangles,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LookAtRotatedTriangles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
