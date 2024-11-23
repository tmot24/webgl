import type { Meta, StoryObj } from "@storybook/react";
import { ShadowHighp } from "./ShadowHighp.tsx";

const meta = {
  title: "Chapter/10/52 ShadowHighp",
  component: ShadowHighp,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof ShadowHighp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
