import {
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const INPUT_NAME = "MentionInput";

interface MentionInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const MentionInput = React.forwardRef<HTMLInputElement, MentionInputProps>(
  ({ ...props }, ref) => {
    const context = useMentionContext(INPUT_NAME);
    const composedRef = useComposedRefs<HTMLInputElement>(
      ref,
      context.inputRef,
    );

    const onChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const lastChar = value[value.length - 1];

        if (lastChar === context.triggerCharacter) {
          const { selectionStart } = e.target;
          const rect = e.target.getBoundingClientRect();
          const lineHeight = Number.parseInt(
            getComputedStyle(e.target).lineHeight,
          );
          const lines = value.slice(0, selectionStart ?? 0).split("\n");
          const currentLine = lines.length;

          context.onTriggerPointChange({
            top: rect.top + currentLine * lineHeight,
            left: rect.left + (selectionStart ?? 0) * 8, // Approximate char width
          });
          context.onOpenChange(true);
        }

        context.onInputValueChange(value);

        context.onFilterItems();
      },
      [
        context.triggerCharacter,
        context.onInputValueChange,
        context.onOpenChange,
        context.onTriggerPointChange,
        context.onFilterItems,
      ],
    );

    const onKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape" && context.open) {
          context.onOpenChange(false);
        }
      },
      [context.onOpenChange, context.open],
    );

    return (
      <Primitive.input
        ref={composedRef}
        onChange={composeEventHandlers(props.onChange, onChange)}
        onKeyDown={composeEventHandlers(props.onKeyDown, onKeyDown)}
        {...props}
      />
    );
  },
);

MentionInput.displayName = INPUT_NAME;

const Input = MentionInput;

export { MentionInput, Input };

export type { MentionInputProps };
