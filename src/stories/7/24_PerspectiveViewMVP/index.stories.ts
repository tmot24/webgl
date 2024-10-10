import type { Meta, StoryObj } from "@storybook/react";
import { PerspectiveViewMVP } from "./PerspectiveViewMVP.tsx";

const meta = {
  title: "Chapter/7/24 PerspectiveViewMVP",
  component: PerspectiveViewMVP,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof PerspectiveViewMVP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
