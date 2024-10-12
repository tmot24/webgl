import type { Meta, StoryObj } from "@storybook/react";
import { PointLightedCube } from "./PointLightedCube.tsx";

const meta = {
  title: "Chapter/8/33 PointLightedCube",
  component: PointLightedCube,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof PointLightedCube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
