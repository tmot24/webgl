import type { Meta, StoryObj } from "@storybook/react";
import { LookAtRotatedTrianglesWithKeys } from "./LookAtRotatedTrianglesWithKeys.tsx";

const meta = {
  title: "Chapter/7/20 LookAtRotatedTrianglesWithKeys",
  component: LookAtRotatedTrianglesWithKeys,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LookAtRotatedTrianglesWithKeys>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
