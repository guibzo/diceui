import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tricks } from "@/lib/data";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/registry/default/ui/combobox";
import { ChevronDown } from "lucide-react";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Combobox className="w-[15rem]">
        <ComboboxAnchor>
          <ComboboxInput placeholder="Search tricks..." />
          <ComboboxTrigger>
            <ChevronDown className="h-4 w-4" />
          </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxContent>
          <ComboboxEmpty>No tricks found</ComboboxEmpty>
          {tricks.map((trick) => (
            <ComboboxItem key={trick.value} value={trick.value}>
              {trick.label}
            </ComboboxItem>
          ))}
        </ComboboxContent>
      </Combobox>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit">
            Open
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Apple</DropdownMenuItem>
          <DropdownMenuItem>Banana</DropdownMenuItem>
          <DropdownMenuItem>Blueberry</DropdownMenuItem>
          <DropdownMenuItem>Grapes</DropdownMenuItem>
          <DropdownMenuItem>Pineapple</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Select>
        <SelectTrigger className="w-[11.25rem]">
          <SelectValue placeholder="Select a trick" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tricks</SelectLabel>
            {tricks.map((trick) => (
              <SelectItem key={trick.value} value={trick.value}>
                {trick.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Shell>
  );
}
