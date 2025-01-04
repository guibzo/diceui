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
  (props, forwardedRef) => {
    const context = useMentionContext(INPUT_NAME);
    const composedRef = useComposedRefs<HTMLInputElement>(
      forwardedRef,
      context.inputRef,
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const lastChar = value[value.length - 1];

        if (lastChar === context.triggerCharacter) {
          const { selectionStart } = event.target;
          const rect = event.target.getBoundingClientRect();
          const lineHeight = Number.parseInt(
            getComputedStyle(event.target).lineHeight,
          );
          const lines = value.slice(0, selectionStart ?? 0).split("\n");
          const currentLine = lines.length;

          context.onTriggerPointChange({
            top: rect.top + currentLine * lineHeight,
            left: rect.left + (selectionStart ?? 0) * 8, // Approximate char width
          });
          context.onOpenChange(true);
          context.filterStore.search = "";
        } else if (context.open) {
          // Check if trigger character is still present
          if (!value.includes(context.triggerCharacter)) {
            context.onOpenChange(false);
            context.filterStore.search = "";
          } else {
            // Extract text after the last trigger character
            const lastTriggerIndex = value.lastIndexOf(
              context.triggerCharacter,
            );
            if (lastTriggerIndex !== -1) {
              const searchTerm = value.slice(lastTriggerIndex + 1);
              context.filterStore.search = searchTerm;
            }
          }
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
        context.open,
        context.filterStore,
      ],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!context.open) return;

        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Enter",
          "Escape",
          "Tab",
        ].includes(event.key);

        if (isNavigationKey) {
          event.preventDefault();
        }

        switch (event.key) {
          case "Enter":
          case "Tab": {
            if (context.highlightedItem) {
              context.onItemSelect(context.highlightedItem.value);
              context.onHighlightedItemChange(null);
              context.onOpenChange(false);
            }
            break;
          }
          case "ArrowDown": {
            context.onHighlightMove(context.highlightedItem ? "next" : "first");
            break;
          }
          case "ArrowUp": {
            context.onHighlightMove(context.highlightedItem ? "prev" : "last");
            break;
          }
          case "Escape": {
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
            break;
          }
        }
      },
      [context],
    );

    return (
      <Primitive.input
        role="combobox"
        id={context.inputId}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        aria-labelledby={context.labelId}
        aria-autocomplete="list"
        aria-disabled={context.disabled}
        disabled={context.disabled}
        {...props}
        ref={composedRef}
        onChange={composeEventHandlers(props.onChange, onChange)}
        onKeyDown={composeEventHandlers(props.onKeyDown, onKeyDown)}
      />
    );
  },
);

MentionInput.displayName = INPUT_NAME;

const Input = MentionInput;

export { Input, MentionInput };

export type { MentionInputProps };
