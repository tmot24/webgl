import type { Meta, StoryObj } from "@storybook/react";
import { DoverWeb } from "./DoverWeb.tsx";

const meta = {
  title: "Chapter/10/42 DoverWeb",
  component: DoverWeb,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof DoverWeb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
