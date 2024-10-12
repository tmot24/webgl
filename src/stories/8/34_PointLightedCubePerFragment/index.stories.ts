import type { Meta, StoryObj } from "@storybook/react";
import { PointLightedCubePerFragment } from "./PointLightedCubePerFragment.tsx";

const meta = {
  title: "Chapter/8/34 PointLightedCubePerFragment",
  component: PointLightedCubePerFragment,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof PointLightedCubePerFragment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
