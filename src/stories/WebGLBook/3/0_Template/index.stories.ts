import type { Meta, StoryObj } from "@storybook/react";
import { MultiPoint } from "./MultiPoint.tsx";

const meta = {
  title: "WebGLBook/Chapter/3/0 MultiPoint",
  component: MultiPoint,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MultiPoint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
