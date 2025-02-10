import type { Meta, StoryObj } from "@storybook/react";
import { HelloCube } from "./HelloCube.tsx";

const meta = {
  title: "OpenGLBook/Chapter/02/0 HelloCube",
  component: HelloCube,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    isTemplate: { control: "boolean" },
  },
  args: { isTemplate: true },
} satisfies Meta<typeof HelloCube>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseCase: Story = {
  args: {
    isTemplate: true,
  },
};
