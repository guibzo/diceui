import {
  type Direction,
  createContext,
  useComposedRefs,
  useControllableState,
  useDirection,
  useId,
} from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const ROOT_NAME = "CheckboxGroupRoot";

interface CheckboxGroupContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  onItemCheckedChange: (value: string, checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  dir: Direction;
  orientation: "horizontal" | "vertical";
  isInvalid: boolean;
  id: string;
  labelId: string;
  descriptionId: string;
}

const [CheckboxGroupProvider, useCheckboxGroup] =
  createContext<CheckboxGroupContextValue>(ROOT_NAME);

interface CheckboxGroupRootProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onChange" | "onInvalid"
  > {
  /** Controlled value. */
  value?: string[];

  /** Initial value when uncontrolled. */
  defaultValue?: string[];

  /** Callback when value changes. */
  onValueChange?: (value: string[]) => void;

  /** Callback function to validate values before they're added. */
  onValidate?: (value: string[]) => boolean;

  /** Callback function to handle invalid input. */
  onInvalid?: (value: string[]) => void;

  /** Whether the checkbox group is disabled. */
  disabled?: boolean;

  /** Whether the checkbox group is required. */
  required?: boolean;

  /** Name for form submission. */
  name?: string;

  /**
   * Text direction for the checkbox group.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the checkbox group.
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
}

const CheckboxGroupRoot = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupRootProps
>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    onValidate,
    onInvalid,
    disabled = false,
    required = false,
    dir: dirProp,
    orientation = "vertical",
    name,
    children,
    ...rootProps
  } = props;

  const [value = [], setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [isInvalid, setIsInvalid] = React.useState(false);
  const dir = useDirection(dirProp);
  const id = useId();
  const labelId = `${id}label`;
  const descriptionId = `${id}description`;
  const collectionRef = React.useRef<HTMLDivElement>(null);
  const composedRefs = useComposedRefs(ref, collectionRef);

  const onItemCheckedChange = React.useCallback(
    (payload: string, checked: boolean) => {
      const newValue = checked
        ? [...value, payload]
        : value.filter((v) => v !== payload);

      if (onValidate && !onValidate(newValue)) {
        setIsInvalid(true);
        onInvalid?.(newValue);
        return;
      }

      setIsInvalid(false);
      setValue(newValue);
    },
    [setValue, onValidate, onInvalid, value],
  );

  return (
    <CheckboxGroupProvider
      value={value}
      onValueChange={setValue}
      onItemCheckedChange={onItemCheckedChange}
      disabled={disabled}
      required={required}
      dir={dir}
      orientation={orientation}
      isInvalid={isInvalid}
      id={id}
      labelId={labelId}
      descriptionId={descriptionId}
    >
      <Primitive.div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        aria-orientation={orientation}
        data-orientation={orientation}
        data-disabled={disabled ? "" : undefined}
        data-invalid={isInvalid ? "" : undefined}
        dir={dir}
        {...rootProps}
        ref={composedRefs}
      >
        {children}
      </Primitive.div>
    </CheckboxGroupProvider>
  );
});

CheckboxGroupRoot.displayName = ROOT_NAME;

const Root = CheckboxGroupRoot;

export {
  CheckboxGroupRoot,
  Root,
  useCheckboxGroup,
  type CheckboxGroupRootProps,
};
