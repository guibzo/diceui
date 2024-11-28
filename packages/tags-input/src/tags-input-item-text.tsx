import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInputItem } from "./tags-input-item";
import { useTagsInput } from "./tags-input-root";

interface TagsInputItemTextProps
  extends React.ComponentPropsWithoutRef<"span"> {}

const TagsInputItemText = React.forwardRef<
  HTMLSpanElement,
  TagsInputItemTextProps
>((props, ref) => {
  const { children, ...tagsInputItemTextProps } = props;
  const context = useTagsInput();
  const itemContext = useTagsInputItem();
  const [editValue, setEditValue] = React.useState(itemContext.displayValue);

  if (itemContext.isEditing && context.editable && !itemContext.disabled) {
    return (
      <Primitive.input
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        type="text"
        value={editValue}
        onChange={(event) => setEditValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            const index = context.values.findIndex(
              (v) => v === itemContext.value,
            );
            context.onUpdateValue(index, editValue);
          } else if (event.key === "Escape") {
            setEditValue(itemContext.displayValue);
            context.setEditingIndex(-1);
            context.inputRef.current?.focus();
          }
          event.stopPropagation();
        }}
        onFocus={(event) => event.target.select()}
        onBlur={() => {
          setEditValue(itemContext.displayValue);
          context.setEditingIndex(-1);
        }}
        style={{
          outline: "none",
          background: "inherit",
          border: "none",
          font: "inherit",
          color: "inherit",
          padding: 0,
        }}
      />
    );
  }

  return (
    <Primitive.span
      ref={ref}
      id={itemContext.textId}
      {...tagsInputItemTextProps}
    >
      {children ?? itemContext.displayValue}
    </Primitive.span>
  );
});

const Text = TagsInputItemText;

export { TagsInputItemText, Text, type TagsInputItemTextProps };
