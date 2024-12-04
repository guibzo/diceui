import * as TagsInputPrimitive from "@diceui/tags-input";
import { X } from "lucide-react";

export default function TagsInputDemo() {
  return (
    <TagsInputPrimitive.Root className="flex w-[380px] flex-col gap-2">
      <TagsInputPrimitive.Label className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Tricks
      </TagsInputPrimitive.Label>
      <TagsInputPrimitive.Content className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-within:ring-zinc-400">
        {({ value }) => (
          <>
            {value.map((item) => (
              <TagsInputPrimitive.Item
                key={item}
                value={item}
                className="inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded border bg-transparent px-2.5 py-1 text-sm focus:outline-none data-[disabled]:cursor-not-allowed data-[editable]:select-none data-[editing]:bg-transparent data-[disabled]:opacity-50 data-[editing]:ring-1 data-[editing]:ring-zinc-500 dark:data-[editing]:ring-zinc-400 [&:not([data-editing])]:pr-1.5 [&[data-highlighted]:not([data-editing])]:bg-zinc-200 [&[data-highlighted]:not([data-editing])]:text-black dark:[&[data-highlighted]:not([data-editing])]:bg-zinc-800 dark:[&[data-highlighted]:not([data-editing])]:text-white"
              >
                <TagsInputPrimitive.Text className="truncate" />
                <TagsInputPrimitive.Delete className="h-4 w-4 shrink-0 rounded-sm opacity-70 ring-offset-zinc-950 transition-opacity hover:opacity-100">
                  <X className="size-3.5" />
                </TagsInputPrimitive.Delete>
              </TagsInputPrimitive.Item>
            ))}
            <TagsInputPrimitive.Input
              placeholder="Add trick..."
              className="flex-1 bg-transparent outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-zinc-400"
            />
          </>
        )}
      </TagsInputPrimitive.Content>
      <TagsInputPrimitive.Clear className="h-9 rounded-sm border border-input bg-transparent text-black shadow-sm hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800">
        Clear
      </TagsInputPrimitive.Clear>
    </TagsInputPrimitive.Root>
  );
}
