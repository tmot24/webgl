import type { Meta, StoryObj } from "@storybook/react";
import { InterleavedMultiAttributeColor } from "./InterleavedMultiAttributeColor.tsx";

const meta = {
  title: "WebGLBook/Chapter/5/13 InterleavedMultiAttributeColor",
  component: InterleavedMultiAttributeColor,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof InterleavedMultiAttributeColor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
