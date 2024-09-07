export interface TemplateProps {
  isTemplate: boolean;
}

export const Template = ({ isTemplate }: TemplateProps) => {
  return <div>Template: {isTemplate ? "true" : "false"}</div>;
};
