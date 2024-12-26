"use client";

import * as Combobox from "@diceui/combobox";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

const tricks = [
  { label: "Kickflip", value: "kickflip" },
  { label: "Heelflip", value: "heelflip" },
  { label: "Tre Flip", value: "tre-flip" },
  { label: "FS 540", value: "fs-540" },
  { label: "Casper flip 360 flip", value: "casper-flip-360-flip" },
  { label: "Kickflip Backflip", value: "kickflip-backflip" },
  { label: "360 Varial McTwist", value: "360-varial-mc-twist" },
  { label: "The 900", value: "the-900" },
];

export default function ComboboxDemo() {
  const [value, setValue] = React.useState("");
  const [inputValue, setInputValue] = React.useState("");

  return (
    <Combobox.Root
      value={value}
      onValueChange={setValue}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <Combobox.Label className="font-medium text-sm text-zinc-950 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-50">
        Trick
      </Combobox.Label>
      <Combobox.Anchor className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white shadow-sm transition-colors data-[focused]:ring-1 data-[focused]:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:data-[focused]:ring-zinc-800">
        <Combobox.Input
          placeholder="Search trick..."
          className="flex h-9 w-full rounded-md bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-50 dark:placeholder:text-zinc-400"
        />
        <Combobox.Trigger className="flex h-9 w-9 items-center justify-center rounded-r-md border-zinc-200 bg-transparent text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-50">
          <ChevronDown className="h-4 w-4" />
        </Combobox.Trigger>
      </Combobox.Anchor>
      <Combobox.Portal>
        <Combobox.Content className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-[var(--dice-anchor-width)] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
          <Combobox.Empty className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No tricks found.
          </Combobox.Empty>
          {tricks.map((trick) => (
            <Combobox.Item
              key={trick.value}
              value={trick.value}
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 data-[disabled]:opacity-50 dark:data-[highlighted]:bg-zinc-800 dark:data-[highlighted]:text-zinc-50"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Combobox.ItemIndicator>
                  <Check className="h-4 w-4" />
                </Combobox.ItemIndicator>
              </span>
              <Combobox.ItemText>{trick.label}</Combobox.ItemText>
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
