import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { composeEventHandlers } from "./lib/compose-event-handlers";
import { composeRefs } from "./lib/compose-refs";
import { useTagsInput } from "./tags-input-root";

interface TagsInputInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const TagsInputInput = React.forwardRef<HTMLInputElement, TagsInputInputProps>(
  (props, ref) => {
    const { autoFocus, ...tagsInputInputProps } = props;
    const context = useTagsInput();

    function onBlur(event: React.FocusEvent<HTMLInputElement>) {
      if (!context.addOnBlur) return;

      const value = event.target.value;
      if (!value) return;

      const isAdded = context.onAddValue(value);
      if (isAdded) event.target.value = "";
    }

    function onTab(event: React.KeyboardEvent<HTMLInputElement>) {
      if (!context.addOnTab) return;
      onCustomKeydown(event);
    }

    function onCustomKeydown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.defaultPrevented) return;

      const value = event.currentTarget.value;
      if (!value) return;

      const isAdded = context.onAddValue(value);
      if (isAdded) {
        event.currentTarget.value = "";
        context.setFocusedIndex(-1);
      }

      event.preventDefault();
    }

    function onInput(event: React.FormEvent<HTMLInputElement>) {
      const target = event.target as HTMLInputElement;
      const delimiter = context.delimiter;

      if (delimiter === target.value.slice(-1)) {
        const value = target.value.slice(0, -1);
        target.value = "";
        if (value) {
          context.onAddValue(value);
          context.setFocusedIndex(-1);
        }
      }
    }

    function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
      if (context.addOnPaste) {
        event.preventDefault();
        const value = event.clipboardData.getData("text");

        // if (context.delimiter) {
        //   const splitValue = value.split(context.delimiter);
        //   for (const v of splitValue) {
        //     const trimmedValue = v.trim();
        //     if (trimmedValue) {
        //       context.onAddValue(trimmedValue);
        //       context.setFocusedIndex(-1);
        //     }
        //   }
        // } else {
        //   context.onAddValue(value);
        //   context.setFocusedIndex(-1);
        // }

        context.onAddValue(value);
        context.setFocusedIndex(-1);
      }
    }

    React.useEffect(() => {
      if (autoFocus) {
        // setTimeout(() => {
        //   context.inputRef.current?.focus();
        // }, 1);
        requestAnimationFrame(() => {
          context.inputRef.current?.focus();
        });
      }
    }, [autoFocus, context.inputRef]);

    return (
      <Primitive.input
        ref={composeRefs(context.inputRef, ref)}
        autoFocus={autoFocus}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        disabled={context.disabled}
        data-invalid={context.isInvalidInput ? "" : undefined}
        onInput={composeEventHandlers(tagsInputInputProps.onInput, onInput)}
        onKeyDown={composeEventHandlers(
          tagsInputInputProps.onKeyDown,
          (event) => {
            if (event.key === "Enter") onCustomKeydown(event);
            if (event.key === "Tab") onTab(event);
            context.onInputKeydown(event);
            if (event.key.length === 1) {
              context.setFocusedIndex(-1);
            }
          },
        )}
        onBlur={composeEventHandlers(tagsInputInputProps.onBlur, onBlur)}
        onPaste={composeEventHandlers(tagsInputInputProps.onPaste, onPaste)}
        {...tagsInputInputProps}
      />
    );
  },
);

TagsInputInput.displayName = "TagsInputInput";

const Input = TagsInputInput;

export { Input, TagsInputInput, type TagsInputInputProps };
