import type { Meta, StoryObj } from "@storybook/react";
import { HUD } from "./HUD.tsx";

const meta = {
  title: "Chapter/10/40 HUD",
  component: HUD,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof HUD>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
