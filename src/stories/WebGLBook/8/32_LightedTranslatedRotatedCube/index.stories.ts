import type { Meta, StoryObj } from "@storybook/react";
import { LightedTranslatedRotatedCube } from "./LightedTranslatedRotatedCube.tsx";

const meta = {
  title: "WebGLBook/Chapter/8/32 LightedTranslatedRotatedCube",
  component: LightedTranslatedRotatedCube,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LightedTranslatedRotatedCube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
