import type { Meta, StoryObj } from "@storybook/react";
import { InterleavedMultiAttributeSize } from "./InterleavedMultiAttributeSize.tsx";

const meta = {
  title: "Chapter/5/12 InterleavedMultiAttributeSize",
  component: InterleavedMultiAttributeSize,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof InterleavedMultiAttributeSize>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
