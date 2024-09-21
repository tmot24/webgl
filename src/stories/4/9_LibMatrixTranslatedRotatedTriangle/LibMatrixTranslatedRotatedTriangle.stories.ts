import type { Meta, StoryObj } from "@storybook/react";
import { LibMatrixTranslatedRotatedTriangle } from "./LibMatrixTranslatedRotatedTriangle.tsx";

const meta = {
  title: "Chapter/4/09 LibMatrixTranslatedRotatedTriangle",
  component: LibMatrixTranslatedRotatedTriangle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LibMatrixTranslatedRotatedTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
