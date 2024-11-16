import type { Meta, StoryObj } from "@storybook/react";
import { ProgramObject } from "./ProgramObject.tsx";

const meta = {
  title: "Chapter/10/48 ProgramObject",
  component: ProgramObject,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof ProgramObject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
