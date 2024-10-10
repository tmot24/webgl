import type { Meta, StoryObj } from "@storybook/react";
import { LightedCube } from "./LightedCube.tsx";

const meta = {
  title: "Chapter/8/30 LightedCube",
  component: LightedCube,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LightedCube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
