import { Button } from "@/components/ui/button";
import { cn } from "@/registry/default/lib/utils";
import * as TagsInputPrimitive from "@diceui/tags-input";
import { X } from "lucide-react";
import * as React from "react";

const TagsInput = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Root
    ref={ref}
    className={cn("flex w-[380px] flex-col gap-2", className)}
    {...props}
  />
));
TagsInput.displayName = TagsInputPrimitive.Root.displayName;

const TagsInputLabel = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Label>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Label
    ref={ref}
    className={cn(
      "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
TagsInputLabel.displayName = TagsInputPrimitive.Label.displayName;

const TagsInputContent = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Content
    ref={ref}
    className={cn(
      "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TagsInputContent.displayName = TagsInputPrimitive.Content.displayName;

const TagsInputInput = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Input>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Input
    ref={ref}
    className={cn(
      "flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TagsInputInput.displayName = TagsInputPrimitive.Input.displayName;

const TagsInputItem = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <TagsInputPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded border bg-transparent px-2.5 py-1 text-sm focus:outline-none data-[disabled]:cursor-not-allowed data-[editable]:select-none data-[editing]:bg-transparent data-[disabled]:opacity-50 data-[editing]:ring-1 data-[editing]:ring-ring [&:not([data-editing])]:pr-1.5 [&[data-highlighted]:not([data-editing])]:bg-accent [&[data-highlighted]:not([data-editing])]:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <TagsInputPrimitive.Text className="truncate">
      {children}
    </TagsInputPrimitive.Text>
    <TagsInputPrimitive.Delete className="h-4 w-4 shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
      <X className="size-3.5" />
    </TagsInputPrimitive.Delete>
  </TagsInputPrimitive.Item>
));
TagsInputItem.displayName = TagsInputPrimitive.Item.displayName;

const TagsInputClear = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Clear>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Clear>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Clear ref={ref} asChild>
    <Button
      variant="outline"
      className={cn(
        "data-[state=visible]:fade-in-0 data-[state=visible]:slide-in-from-bottom-2 data-[state=hidden]:fade-out-0 data-[state=hidden]:slide-out-to-bottom-2 w-full data-[state=visible]:visible data-[state=hidden]:invisible data-[state=hidden]:animate-out data-[state=visible]:animate-in",
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      Clear
    </Button>
  </TagsInputPrimitive.Clear>
));
TagsInputClear.displayName = TagsInputPrimitive.Clear.displayName;

export {
  TagsInput,
  TagsInputLabel,
  TagsInputContent,
  TagsInputInput,
  TagsInputItem,
  TagsInputClear,
};
