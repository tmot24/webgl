import type { Meta, StoryObj } from "@storybook/react";
import { MultiTexture } from "./MultiTexture.tsx";

const meta = {
  title: "Chapter/5/17 MultiTexture",
  component: MultiTexture,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MultiTexture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
