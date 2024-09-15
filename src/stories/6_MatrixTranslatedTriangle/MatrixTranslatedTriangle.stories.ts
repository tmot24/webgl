import type { Meta, StoryObj } from "@storybook/react";
import { MatrixTranslatedTriangle } from "./MatrixTranslatedTriangle.tsx";

const meta = {
  title: "Chapter/3/5 MatrixTranslatedTriangle",
  component: MatrixTranslatedTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof MatrixTranslatedTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
