import type { Meta, StoryObj } from "@storybook/react";
import { MultiAttributeSize } from "./MultiAttributeSize.tsx";

const meta = {
  title: "WebGLBook/Chapter/5/11 MultiAttributeSize",
  component: MultiAttributeSize,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MultiAttributeSize>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
