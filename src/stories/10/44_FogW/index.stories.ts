import type { Meta, StoryObj } from "@storybook/react";
import { FogW } from "./FogW.tsx";

const meta = {
  title: "Chapter/10/44 FogW",
  component: FogW,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof FogW>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
