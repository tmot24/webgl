import type { Meta, StoryObj } from "@storybook/react";
import { LookAtRotatedTrianglesWithKeysViewVolume } from "./LookAtRotatedTrianglesWithKeysViewVolume.tsx";

const meta = {
  title: "Chapter/7/22 LookAtRotatedTrianglesWithKeysViewVolume",
  component: LookAtRotatedTrianglesWithKeysViewVolume,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LookAtRotatedTrianglesWithKeysViewVolume>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
