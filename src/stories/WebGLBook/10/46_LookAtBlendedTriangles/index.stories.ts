import type { Meta, StoryObj } from "@storybook/react";
import { LookAtBlendedTriangles } from "./LookAtBlendedTriangles.tsx";

const meta = {
  title: "WebGLBook/Chapter/10/46 LookAtBlendedTriangles",
  component: LookAtBlendedTriangles,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof LookAtBlendedTriangles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
