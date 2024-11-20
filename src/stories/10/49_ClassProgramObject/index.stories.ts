import type { Meta, StoryObj } from "@storybook/react";
import { ClassProgramObject } from "./ClassProgramObject.tsx";

const meta = {
  title: "Chapter/10/49 ClassProgramObject",
  component: ClassProgramObject,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof ClassProgramObject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
