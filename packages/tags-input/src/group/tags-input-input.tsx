import { composeRefs } from "@radix-ui/react-compose-refs";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

interface TagsInputInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  autoFocus?: boolean;
}

const TagsInputInput = React.forwardRef<HTMLInputElement, TagsInputInputProps>(
  (props, ref) => {
    const {
      placeholder,
      autoFocus,
      maxLength,
      className,
      ...tagsInputInputProps
    } = props;

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
      if (isAdded) event.currentTarget.value = "";

      event.preventDefault();
    }

    function onInputChange(event: React.FormEvent<HTMLInputElement>) {
      const target = event.target as HTMLInputElement;
      const delimiter = context.delimiter;

      if (delimiter === target.value.slice(-1)) {
        const value = target.value.slice(0, -1);
        target.value = "";
        context.onAddValue(value);
      }
    }

    function onPaste(event: React.ClipboardEvent<HTMLInputElement>) {
      if (context.addOnPaste) {
        event.preventDefault();
        const value = event.clipboardData.getData("text");

        if (context.delimiter) {
          const splitValue = value.split(context.delimiter);
          for (const v of splitValue) {
            context.onAddValue(v.trim());
          }
        } else {
          context.onAddValue(value);
        }
      }
    }

    React.useEffect(() => {
      if (!context.inputRef.current || !autoFocus) return;
      requestAnimationFrame(() => {
        context.inputRef.current?.focus();
      });
    }, [autoFocus, context.inputRef]);

    return (
      <Primitive.input
        ref={composeRefs(context.inputRef, ref)}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={context.disabled}
        className={className}
        data-invalid={context.isInvalidInput ? "" : undefined}
        onInput={onInputChange}
        onKeyDown={(event) => {
          if (event.key === "Enter") onCustomKeydown(event);
          if (event.key === "Tab") onTab(event);
          context.onInputKeydown(event);
        }}
        onBlur={onBlur}
        onPaste={onPaste}
        {...tagsInputInputProps}
      />
    );
  },
);

TagsInputInput.displayName = "TagsInputInput";

const Input = TagsInputInput;

export { Input, TagsInputInput };

export type { TagsInputInputProps };
