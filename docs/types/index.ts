export type ControlledProps<T extends React.ElementType> = Omit<
  React.ComponentPropsWithoutRef<T>,
  "defaultValue" | "value" | "onValueChange"
>;

export type EmptyProps<T extends React.ElementType> = Omit<
  React.ComponentPropsWithoutRef<T>,
  keyof React.ComponentPropsWithoutRef<T>
>;
