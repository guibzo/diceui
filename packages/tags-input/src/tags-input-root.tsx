import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

import {
  BubbleInput,
  DATA_ITEM_ATTR,
  type Direction,
  composeEventHandlers,
  createContext,
  useCollection,
  useComposedRefs,
  useControllableState,
  useDirection,
  useFormControl,
  useId,
} from "@diceui/shared";
import type { TagsInputInput } from "./tags-input-input";

type InputValue = string;

const ROOT_NAME = "TagsInputRoot";

type CollectionElement = React.ElementRef<typeof Primitive.div>;
type InputElement = React.ElementRef<typeof TagsInputInput>;

interface TagsInputContextValue<T = InputValue> {
  value: T[];
  onValueChange: (value: T[]) => void;
  onItemAdd: (textValue: string, options?: { viaPaste?: boolean }) => boolean;
  onItemRemove: (index: number) => void;
  onItemUpdate: (index: number, newTextValue: string) => void;
  onInputKeydown: (event: React.KeyboardEvent) => void;
  highlightedValue: T | null;
  setHighlightedValue: (value: T | null) => void;
  editingValue: T | null;
  setEditingValue: (value: T | null) => void;
  displayValue: (value: T) => string;
  onItemLeave: () => void;
  inputRef: React.RefObject<InputElement | null>;
  addOnPaste: boolean;
  addOnTab: boolean;
  delimiter: string;
  disabled: boolean;
  editable: boolean;
  loop: boolean;
  isInvalidInput: boolean;
  blurBehavior: "add" | "clear" | undefined;
  max: number;
  dir: Direction;
  id: string;
  inputId: string;
  labelId: string;
}

const [TagsInputProvider, useTagsInput] =
  createContext<TagsInputContextValue<InputValue>>(ROOT_NAME);

interface TagsInputRootProps<T = InputValue>
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue" | "onValueChange" | "onInvalid" | "children"
  > {
  /** Controlled array of tag values. */
  value?: T[];

  /** Initial array of tag values when uncontrolled. */
  defaultValue?: T[];

  /** Callback function to handle changes in the tag values. */
  onValueChange?: (value: T[]) => void;

  /** Callback function to validate tags before they're added. */
  onValidate?: (value: T) => boolean;

  /** Callback function to handle invalid input. */
  onInvalid?: (value: T) => void;

  /** Function to convert a tag value to its display string representation. */
  displayValue?: (value: T) => string;

  /**
   * Enable adding tags by pasting text, which will be split by the delimiter.
   * @default false
   */
  addOnPaste?: boolean;

  /**
   * Enable adding tags when Tab key is pressed.
   * @default false
   */
  addOnTab?: boolean;

  /**
   * Disables the entire tags input.
   * @default false
   */
  disabled?: boolean;

  /**
   * Allow editing of existing tags
   * @default false
   */
  editable?: boolean;

  /**
   * Enable wrapping focus from last to first tag and vice versa.
   * @default false
   */
  loop?: boolean;

  /**
   * Behavior when the input loses focus.
   * - "add": Add the current input value as a new tag.
   * - "clear": Reset the input field, removing its value.
   * By default, the input value will stay in the input field.
   * Can be overridden by the preventDefault() call in the input's onBlur handler.
   */
  blurBehavior?: "add" | "clear";

  /**
   * Character used to split pasted text into multiple tags.
   * @default ","
   */
  delimiter?: string;

  /**
   * Maximum number of tags allowed.
   * @default Number.POSITIVE_INFINITY
   */
  max?: number;

  /** Whether the field is required in a form context. */
  required?: boolean;

  /** Name of the form field when used in a form. */
  name?: string;

  /**
   * The content of the tags input.
   *
   * Can be a function that receives the current value as an argument,
   * or a React node.
   * @default undefined
   */
  children?:
    | ((context: { value: InputValue[] }) => React.ReactNode)
    | React.ReactNode;

  /**
   * The reading direction of the tags input.
   * @default "ltr"
   */
  dir?: Direction;

  /** Unique identifier for the tags input. */
  id?: string;
}

const TagsInputRoot = React.forwardRef<
  CollectionElement,
  TagsInputRootProps<InputValue>
>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    onValidate,
    onInvalid,
    displayValue = (value: InputValue) => value.toString(),
    addOnPaste = false,
    addOnTab = false,
    disabled = false,
    editable = false,
    loop = false,
    blurBehavior,
    delimiter = ",",
    max = Number.POSITIVE_INFINITY,
    required = false,
    name,
    children,
    dir: dirProp,
    id: idProp,
    ...rootProps
  } = props;

  const [value = [], setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });
  const [highlightedValue, setHighlightedValue] =
    React.useState<InputValue | null>(null);
  const [editingValue, setEditingValue] = React.useState<InputValue | null>(
    null,
  );
  const [isInvalidInput, setIsInvalidInput] = React.useState(false);
  const collectionRef = React.useRef<CollectionElement>(null);
  const inputRef = React.useRef<InputElement>(null);

  const id = useId();
  const inputId = useId();
  const labelId = useId();

  const dir = useDirection(dirProp);
  const { getEnabledItems } = useCollection<CollectionElement>({
    ref: collectionRef,
  });
  const { isFormControl, onTriggerChange } =
    useFormControl<CollectionElement>();
  const composedRef = useComposedRefs(ref, collectionRef, (node) =>
    onTriggerChange(node),
  );

  const onItemAdd = React.useCallback(
    (textValue: string, options?: { viaPaste?: boolean }) => {
      if (addOnPaste && options?.viaPaste) {
        const splitValues = textValue
          .split(delimiter)
          .map((v) => v.trim())
          .filter(Boolean);

        if (value.length + splitValues.length > max && max > 0) {
          onInvalid?.(textValue);
          return false;
        }

        let newValues: InputValue[] = [];
        for (const v of splitValues) {
          if (value.includes(v)) {
            onInvalid?.(v);
          }
        }
        newValues = [...new Set(splitValues.filter((v) => !value.includes(v)))];

        const validValues = newValues.filter(
          (v) => !onValidate || onValidate(v),
        );

        if (validValues.length === 0) return false;

        setValue([...value, ...validValues]);
        return true;
      }

      if (value.length >= max && max > 0) {
        onInvalid?.(textValue);
        return false;
      }

      const trimmedValue = textValue.trim();

      if (onValidate && !onValidate(trimmedValue)) {
        setIsInvalidInput(true);
        onInvalid?.(trimmedValue);
        return false;
      }

      const exists = value.some((v) => {
        const valueToCompare = v;
        return valueToCompare === trimmedValue;
      });

      if (exists) {
        setIsInvalidInput(true);
        onInvalid?.(trimmedValue);
        return true;
      }

      const newValue = trimmedValue;
      const newValues = [...value, newValue];
      setValue(newValues);
      setHighlightedValue(null);
      setEditingValue(null);
      setIsInvalidInput(false);
      return true;
    },
    [value, max, addOnPaste, delimiter, setValue, onInvalid, onValidate],
  );

  const onItemUpdate = React.useCallback(
    (index: number, newTextValue: string) => {
      if (index !== -1) {
        const trimmedValue = newTextValue.trim();

        const exists = value.some((v, i) => {
          if (i === index) return false;
          const valueToCompare = v;
          return valueToCompare === trimmedValue;
        });

        if (exists) {
          setIsInvalidInput(true);
          onInvalid?.(trimmedValue);
          return;
        }

        if (onValidate && !onValidate(trimmedValue)) {
          setIsInvalidInput(true);
          onInvalid?.(trimmedValue);
          return;
        }

        const updatedValue = displayValue(trimmedValue);
        const newValues = [...value];
        newValues[index] = updatedValue;

        setValue(newValues);
        setHighlightedValue(updatedValue);
        setEditingValue(null);
        setIsInvalidInput(false);

        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [value, setValue, displayValue, onInvalid, onValidate],
  );

  const onItemRemove = React.useCallback(
    (index: number) => {
      if (index !== -1) {
        const newValues = [...value];
        newValues.splice(index, 1);
        setValue(newValues);
        setHighlightedValue(null);
        setEditingValue(null);
        inputRef.current?.focus();
      }
    },
    [value, setValue],
  );

  const onItemLeave = React.useCallback(() => {
    setHighlightedValue(null);
    setEditingValue(null);
    inputRef.current?.focus();
  }, []);

  const onInputKeydown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;

      const isArrowLeft =
        (event.key === "ArrowLeft" && dir === "ltr") ||
        (event.key === "ArrowRight" && dir === "rtl");
      const isArrowRight =
        (event.key === "ArrowRight" && dir === "ltr") ||
        (event.key === "ArrowLeft" && dir === "rtl");

      if (target.value && target.selectionStart !== 0) {
        setHighlightedValue(null);
        setEditingValue(null);
        return;
      }

      const findNextEnabledValue = (
        currentValue: InputValue | null,
        direction: "next" | "prev",
      ): InputValue | null => {
        const collectionElement = collectionRef.current;
        if (!collectionElement) return null;

        const enabledItems = getEnabledItems();
        const enabledValues = enabledItems.map((_, index) => value[index]);

        if (enabledValues.length === 0) return null;

        if (currentValue === null) {
          return direction === "prev"
            ? (enabledValues[enabledValues.length - 1] ?? null)
            : (enabledValues[0] ?? null);
        }

        const currentIndex = enabledValues.indexOf(currentValue);
        if (direction === "next") {
          return currentIndex >= enabledValues.length - 1
            ? loop
              ? (enabledValues[0] ?? null)
              : null
            : (enabledValues[currentIndex + 1] ?? null);
        }

        return currentIndex <= 0
          ? loop
            ? (enabledValues[enabledValues.length - 1] ?? null)
            : null
          : (enabledValues[currentIndex - 1] ?? null);
      };

      switch (event.key) {
        case "Delete":
        case "Backspace": {
          if (target.selectionStart !== 0 || target.selectionEnd !== 0) break;

          if (highlightedValue !== null) {
            const index = value.indexOf(highlightedValue);
            const newValue = findNextEnabledValue(highlightedValue, "prev");
            onItemRemove(index);
            setHighlightedValue(newValue);
            event.preventDefault();
          } else if (event.key === "Backspace" && value.length > 0) {
            const lastValue = findNextEnabledValue(null, "prev");
            setHighlightedValue(lastValue);
            event.preventDefault();
          }
          break;
        }
        case "Enter": {
          if (highlightedValue !== null && editable && !disabled) {
            setEditingValue(highlightedValue);
            event.preventDefault();
            return;
          }
          break;
        }
        case "ArrowLeft":
        case "ArrowRight": {
          if (
            target.selectionStart === 0 &&
            isArrowLeft &&
            highlightedValue === null &&
            value.length > 0
          ) {
            const lastValue = findNextEnabledValue(null, "prev");
            setHighlightedValue(lastValue);
            event.preventDefault();
          } else if (highlightedValue !== null) {
            const nextValue = findNextEnabledValue(
              highlightedValue,
              isArrowLeft ? "prev" : "next",
            );
            if (nextValue !== null) {
              setHighlightedValue(nextValue);
              event.preventDefault();
            } else if (isArrowRight) {
              setHighlightedValue(null);
              requestAnimationFrame(() => target.setSelectionRange(0, 0));
            }
          }
          break;
        }
        case "Home": {
          if (highlightedValue !== null) {
            const firstValue = findNextEnabledValue(null, "next");
            setHighlightedValue(firstValue);
            event.preventDefault();
          }
          break;
        }
        case "End": {
          if (highlightedValue !== null) {
            const lastValue = findNextEnabledValue(null, "prev");
            setHighlightedValue(lastValue);
            event.preventDefault();
          }
          break;
        }
        case "Escape": {
          setHighlightedValue(null);
          setEditingValue(null);
          requestAnimationFrame(() => target.setSelectionRange(0, 0));
          break;
        }
      }
    },
    [
      highlightedValue,
      value,
      onItemRemove,
      dir,
      editable,
      disabled,
      loop,
      getEnabledItems,
    ],
  );

  const getIsClickedInEmptyRoot = React.useCallback((target: HTMLElement) => {
    return (
      collectionRef.current?.contains(target) &&
      !target.hasAttribute(DATA_ITEM_ATTR) &&
      target.tagName !== "INPUT"
    );
  }, []);

  return (
    <TagsInputProvider
      value={value}
      onValueChange={setValue}
      onItemAdd={onItemAdd}
      onItemRemove={onItemRemove}
      onItemUpdate={onItemUpdate}
      onInputKeydown={onInputKeydown}
      highlightedValue={highlightedValue}
      setHighlightedValue={setHighlightedValue}
      editingValue={editingValue}
      setEditingValue={setEditingValue}
      displayValue={displayValue}
      onItemLeave={onItemLeave}
      inputRef={inputRef}
      isInvalidInput={isInvalidInput}
      addOnPaste={addOnPaste}
      addOnTab={addOnTab}
      disabled={disabled}
      editable={editable}
      loop={loop}
      blurBehavior={blurBehavior}
      delimiter={delimiter}
      max={max}
      dir={dir}
      id={id}
      inputId={inputId}
      labelId={labelId}
    >
      <Primitive.div
        id={id}
        data-invalid={isInvalidInput ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        dir={dir}
        {...rootProps}
        ref={composedRef}
        onClick={composeEventHandlers(rootProps.onClick, (event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;

          if (
            getIsClickedInEmptyRoot(target) &&
            document.activeElement !== inputRef.current
          ) {
            event.currentTarget.focus();
            inputRef.current?.focus();
          }
        })}
        onMouseDown={composeEventHandlers(rootProps.onMouseDown, (event) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;

          if (getIsClickedInEmptyRoot(target)) {
            // prevent root from stealing focus from the input
            event.preventDefault();
          }
        })}
        onBlur={composeEventHandlers(rootProps.onBlur, (event) => {
          if (
            event.relatedTarget !== inputRef.current &&
            !collectionRef.current?.contains(event.relatedTarget)
          ) {
            requestAnimationFrame(() => setHighlightedValue(null));
          }
        })}
      >
        {typeof children === "function" ? <>{children({ value })}</> : children}
        {isFormControl && name && (
          <BubbleInput
            type="hidden"
            control={collectionRef.current}
            name={name}
            value={value}
            required={required}
            disabled={disabled}
          />
        )}
      </Primitive.div>
    </TagsInputProvider>
  );
});

TagsInputRoot.displayName = ROOT_NAME;

const Root = TagsInputRoot;

export { Root, TagsInputRoot, useTagsInput };

export type { InputValue, TagsInputRootProps };
