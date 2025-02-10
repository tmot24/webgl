import type { Meta, StoryObj } from "@storybook/react";
import { PickObject } from "./PickObject.tsx";

const meta = {
  title: "WebGLBook/Chapter/10/39 PickObject",
  component: PickObject,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof PickObject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
