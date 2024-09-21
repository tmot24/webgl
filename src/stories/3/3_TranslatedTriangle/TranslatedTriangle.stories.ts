import type { Meta, StoryObj } from "@storybook/react";
import { TranslatedTriangle } from "./TranslatedTriangle.tsx";

const meta = {
  title: "Chapter/3/3 TranslatedTriangle",
  component: TranslatedTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof TranslatedTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
