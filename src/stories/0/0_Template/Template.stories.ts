import type { Meta, StoryObj } from "@storybook/react";
import { Template } from "./Template.tsx";

const meta = {
  title: "Template/0/Template",
  component: Template,
  parameters: {
    layout: "centered",
  },
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
