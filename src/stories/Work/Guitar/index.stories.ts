import type { Meta, StoryObj } from "@storybook/react";
import { Guitar } from "./Guitar.tsx";

const meta = {
  title: "Work/Guitar",
  component: Guitar,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof Guitar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
