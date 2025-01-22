"use client";

import * as Sortable from "@/registry/default/ui/sortable";
import * as React from "react";

interface Trick {
  id: string;
  title: string;
  points: number;
}

export default function SortableDemo() {
  const [tricks, setTricks] = React.useState<Trick[]>([
    { id: "1", title: "The 900", points: 9000 },
    { id: "2", title: "Indy Backflip", points: 4000 },
    { id: "3", title: "Pizza Guy", points: 1500 },
    { id: "4", title: "Rocket Air", points: 5000 },
    { id: "5", title: "Kickflip Backflip", points: 3000 },
    { id: "6", title: "FS 540", points: 4500 },
  ]);

  return (
    <Sortable.Root
      value={tricks}
      onValueChange={setTricks}
      getItemValue={(item) => item.id}
      orientation="mixed"
    >
      <Sortable.Content className="grid grid-cols-3 gap-2.5">
        {tricks.map((trick) => (
          <TrickCard key={trick.id} trick={trick} asHandle />
        ))}
      </Sortable.Content>
      <Sortable.Overlay>
        {(activeItem) => {
          const trick = tricks.find((trick) => trick.id === activeItem.value);
          if (!trick) return null;

          return <TrickCard trick={trick} />;
        }}
      </Sortable.Overlay>
    </Sortable.Root>
  );
}

interface TrickCardProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Sortable.Item>, "value"> {
  trick: Trick;
}

function TrickCard({ trick, ...props }: TrickCardProps) {
  return (
    <Sortable.Item key={trick.id} value={trick.id} asChild {...props}>
      <div className="flex size-full flex-col items-center justify-center rounded-md border bg-zinc-100 p-6 text-center text-foreground shadow dark:bg-zinc-900">
        <div className="font-medium text-sm leading-tight sm:text-base">
          {trick.title}
        </div>
        <div className="hidden text-muted-foreground text-sm sm:block">
          {trick.points} points
        </div>
      </div>
    </Sortable.Item>
  );
}
