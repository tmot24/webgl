import type { Meta, StoryObj } from "@storybook/react";
import { Template } from "./Template.tsx";

const meta = {
  title: "Example/Template",
  component: Template,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof Template>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
