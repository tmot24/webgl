import type { Meta, StoryObj } from "@storybook/react";
import { ColoredTriangle } from "./ColoredTriangle.tsx";

const meta = {
  title: "Chapter/5/14 ColoredTriangle",
  component: ColoredTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof ColoredTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
