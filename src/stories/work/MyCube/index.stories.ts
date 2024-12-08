import type { Meta, StoryObj } from "@storybook/react";
import { MyCube } from "./MyCube.tsx";

const meta = {
  title: "Work/MyCube",
  component: MyCube,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MyCube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
