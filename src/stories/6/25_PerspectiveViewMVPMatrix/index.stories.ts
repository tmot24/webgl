import type { Meta, StoryObj } from "@storybook/react";
import { PerspectiveViewMVPMatrix } from "./PerspectiveViewMVPMatrix.tsx";

const meta = {
  title: "Chapter/6/25 PerspectiveViewMVPMatrix",
  component: PerspectiveViewMVPMatrix,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof PerspectiveViewMVPMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
