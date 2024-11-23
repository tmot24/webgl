import type { Meta, StoryObj } from "@storybook/react";
import { Shadow } from "./Shadow.tsx";

const meta = {
  title: "Chapter/10/51 Shadow",
  component: Shadow,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof Shadow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
