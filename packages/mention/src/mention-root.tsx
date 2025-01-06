import {
  BubbleInput,
  type CollectionItem,
  type Direction,
  type HighlightingDirection,
  Primitive,
  composeRefs,
  createContext,
  useCollectionContext,
  useControllableState,
  useDirection,
  useFilter,
  useFormControl,
  useId,
} from "@diceui/shared";
import type { VirtualElement } from "@floating-ui/react";
import * as React from "react";
import type { MentionContent } from "./mention-content";
import type { MentionInput } from "./mention-input";

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

const ROOT_NAME = "MentionRoot";

type CollectionElement = HTMLDivElement;
type InputElement = React.ElementRef<typeof MentionInput>;
type ListElement = React.ElementRef<typeof MentionContent>;

interface ItemData {
  label: string;
  value: string;
  disabled: boolean;
}

interface Mention extends Omit<ItemData, "disabled"> {
  start: number;
  end: number;
}

interface MentionContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputValue: string;
  onInputValueChange: (value: string) => void;
  virtualAnchor: VirtualElement | null;
  onVirtualAnchorChange: (element: VirtualElement | null) => void;
  trigger: string;
  onTriggerChange: (character: string) => void;
  onItemRegister: (item: CollectionItem<CollectionElement, ItemData>) => void;
  filterStore: {
    search: string;
    itemCount: number;
    items: Map<string, number>;
  };
  onFilter?: (options: string[], term: string) => string[];
  onFilterItems: () => void;
  highlightedItem: CollectionItem<CollectionElement, ItemData> | null;
  onHighlightedItemChange: (
    item: CollectionItem<CollectionElement, ItemData> | null,
  ) => void;
  onHighlightMove: (direction: HighlightingDirection) => void;
  mentions: Mention[];
  onMentionAdd: (value: string, triggerIndex: number) => void;
  dir: Direction;
  disabled: boolean;
  exactMatch: boolean;
  loop: boolean;
  modal: boolean;
  readonly: boolean;
  tokenized: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<ListElement | null>;
  inputId: string;
  labelId: string;
  listId: string;
}

const [MentionProvider, useMentionContext] =
  createContext<MentionContextValue>(ROOT_NAME);

interface MentionProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "value" | "defaultValue"
  > {
  /** The currently selected value. */
  value?: string[];

  /** The default selected value. */
  defaultValue?: string[];

  /** Event handler called when a mention item is selected. */
  onValueChange?: (value: string[]) => void;

  /** Whether the mention menu is open. */
  open?: boolean;

  /** The default open state. */
  defaultOpen?: boolean;

  /** Event handler called when the open state changes. */
  onOpenChange?: (open: boolean) => void;

  /** The current input value. */
  inputValue?: string;

  /** Event handler called when the input value changes. */
  onInputValueChange?: (value: string) => void;

  /** The character that activates the mention menu when typed. */
  trigger?: string;

  /** The direction the mention should open. */
  dir?: Direction;

  /** Whether the mention is disabled. */
  disabled?: boolean;

  /**
   * Event handler called when the filter is applied.
   * Can be used to prevent the default filtering behavior.
   */
  onFilter?: (options: string[], term: string) => string[];

  /**
   * Whether the mention uses exact string matching or fuzzy matching.
   * When onFilter is provided, this prop is ignored.
   * @default false
   */
  exactMatch?: boolean;

  /**
   * Whether the mention loops through items.
   * @default false
   */
  loop?: boolean;

  /**
   * Whether the mention is modal.
   * @default false
   */
  modal?: boolean;

  /**
   * Whether the mention is read-only.
   * @default false
   */
  readonly?: boolean;

  /**
   * Whether the mention is required in a form context.
   * @default false
   */
  required?: boolean;

  /** The name of the mention when used in a form. */
  name?: string;

  /**
   * Whether to use tokenized mode for mentions.
   * In tokenized mode, mentions are displayed as tokens that can be deleted with a single backspace.
   * In text mode (default), mentions are displayed as text with the trigger character.
   * @default false
   */
  tokenized?: boolean;
}

const MentionRoot = React.forwardRef<CollectionElement, MentionProps>(
  (props, forwardedRef) => {
    const {
      children,
      open: openProp,
      defaultOpen = false,
      onOpenChange: onOpenChangeProp,
      inputValue: inputValueProp,
      onInputValueChange,
      value: valueProp,
      defaultValue,
      onValueChange,
      trigger: triggerProp = "@",
      dir: dirProp,
      disabled = false,
      onFilter,
      exactMatch = false,
      loop = false,
      modal = false,
      readonly = false,
      required = false,
      tokenized = false,
      name,
      ...rootProps
    } = props;

    const collectionRef = React.useRef<CollectionElement | null>(null);
    const listRef = React.useRef<ListElement | null>(null);
    const inputRef = React.useRef<InputElement | null>(null);
    const filterStore = React.useRef<MentionContextValue["filterStore"]>({
      search: "",
      itemCount: 0,
      items: new Map<string, number>(),
    }).current;

    const inputId = useId();
    const labelId = useId();
    const listId = useId();

    const { getItems, itemMap, onItemRegister } = useCollectionContext<
      CollectionElement,
      ItemData
    >({ collectionRef });
    const filter = useFilter({ sensitivity: "base", gapMatch: true });
    const currentFilter = React.useMemo(
      () => (exactMatch ? filter.contains : filter.fuzzy),
      [filter.fuzzy, filter.contains, exactMatch],
    );

    const { isFormControl, onTriggerChange } =
      useFormControl<CollectionElement>();
    const composedRef = composeRefs(forwardedRef, collectionRef, (node) =>
      onTriggerChange(node),
    );

    const getItemScore = React.useCallback(
      (value: string, searchTerm: string) => {
        if (!searchTerm) return 1;
        if (!value) return 0;

        if (searchTerm === "") return 1;
        if (value === searchTerm) return 2;
        if (value.startsWith(searchTerm)) return 1.5;

        return onFilter
          ? Number(onFilter([value], searchTerm).length > 0)
          : Number(currentFilter(value, searchTerm));
      },
      [currentFilter, onFilter],
    );

    const dir = useDirection(dirProp);
    const [open = false, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChangeProp,
    });
    const [inputValue = "", setInputValue] = useControllableState({
      prop: inputValueProp,
      defaultProp: "",
      onChange: onInputValueChange,
    });
    const [value = [], setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange,
    });
    const [trigger, setTrigger] =
      React.useState<MentionContextValue["trigger"]>(triggerProp);
    const [virtualAnchor, setVirtualAnchor] =
      React.useState<VirtualElement | null>(null);
    const [highlightedItem, setHighlightedItem] = React.useState<CollectionItem<
      CollectionElement,
      ItemData
    > | null>(null);
    const [mentions, setMentions] = React.useState<Mention[]>([]);

    const onOpenChange = React.useCallback(
      (open: boolean) => {
        if (open && filterStore.search && filterStore.itemCount === 0) {
          return;
        }
        setOpen(open);
        if (open) {
          requestAnimationFrame(() => {
            const items = getItems().filter((item) => !item.disabled);
            const firstItem = items[0] ?? null;
            setHighlightedItem(firstItem);
          });
        } else {
          setHighlightedItem(null);
          setVirtualAnchor(null);
        }
      },
      [setOpen, getItems, filterStore],
    );

    const onFilterItems = React.useCallback(() => {
      if (!filterStore.search) {
        filterStore.itemCount = itemMap.size;
        return;
      }

      filterStore.items.clear();

      const searchTerm = filterStore.search;
      let itemCount = 0;
      let pendingBatch: [
        React.RefObject<CollectionElement | null>,
        ItemData,
      ][] = [];
      const BATCH_SIZE = 250;

      function processBatch() {
        if (!pendingBatch.length) return;

        const scores = new Map<
          React.RefObject<CollectionElement | null>,
          number
        >();

        for (const [ref, data] of pendingBatch) {
          const score = getItemScore(data.value, searchTerm);
          if (score > 0) {
            scores.set(ref, score);
            itemCount++;
          }
        }

        // Sort by score in descending order and add to filterStore
        const sortedScores = Array.from(scores.entries()).sort(
          ([, a], [, b]) => b - a,
        );

        for (const [ref, score] of sortedScores) {
          filterStore.items.set(ref.current?.id ?? "", score);
        }

        pendingBatch = [];
      }

      // Process items in batches
      for (const [ref, data] of itemMap.entries()) {
        pendingBatch.push([ref, data]);

        if (pendingBatch.length >= BATCH_SIZE) {
          processBatch();
        }
      }

      // Process remaining items
      if (pendingBatch.length > 0) {
        processBatch();
      }

      filterStore.itemCount = itemCount;

      // Close the menu if no items match the filter
      if (itemCount === 0) {
        setOpen(false);
        setHighlightedItem(null);
        setVirtualAnchor(null);
      }
    }, [filterStore, itemMap, getItemScore, setOpen]);

    const onHighlightMove = React.useCallback(
      (direction: HighlightingDirection) => {
        const items = getItems().filter((item) => !item.disabled);
        if (items.length === 0) return;

        const currentIndex = items.findIndex(
          (item) => item.ref.current === highlightedItem?.ref.current,
        );
        let nextIndex: number;

        switch (direction) {
          case "next":
            nextIndex = currentIndex + 1;
            if (nextIndex >= items.length) {
              nextIndex = loop ? 0 : items.length - 1;
            }
            break;
          case "prev":
            nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
              nextIndex = loop ? items.length - 1 : 0;
            }
            break;
          case "first":
            nextIndex = 0;
            break;
          case "last":
            nextIndex = items.length - 1;
            break;
          case "selected":
            nextIndex = items.findIndex((item) => value.includes(item.value));
            if (nextIndex === -1) nextIndex = 0;
            break;
        }

        const nextItem = items[nextIndex];
        if (nextItem?.ref.current) {
          nextItem.ref.current.scrollIntoView({ block: "nearest" });
          setHighlightedItem(nextItem);
        }
      },
      [loop, highlightedItem, getItems, value],
    );

    const onMentionAdd = React.useCallback(
      (value: string, triggerIndex: number) => {
        const input = inputRef.current;
        if (!input) return;

        const item = getItems().find((item) => item.value === value);
        const label = item?.label ?? value;

        console.log({ item, value, label });

        const beforeTrigger = input.value.slice(0, triggerIndex);
        const afterSearchText = input.value.slice(
          input.selectionStart ?? triggerIndex,
        );

        let mentionText: string;
        let newValue: string;
        let end: number;

        if (tokenized) {
          // In tokenized mode, we just show the label without trigger
          mentionText = label;
          newValue = `${beforeTrigger}${mentionText} ${afterSearchText}`;
          end = triggerIndex + mentionText.length;
        } else {
          // In text mode, we show trigger + value
          mentionText = `${trigger}${value}`;
          newValue = `${beforeTrigger}${mentionText} ${afterSearchText}`;
          end = triggerIndex + mentionText.length;
        }

        const newMention: Mention = {
          label,
          value,
          start: triggerIndex,
          end,
        };

        setMentions((prev) => [...prev, newMention]);

        console.log({ newValue });

        input.value = newValue;
        setInputValue(newValue);
        setValue((prev = []) => [...prev, value]);

        const newCursorPosition = end + 1;
        input.setSelectionRange(newCursorPosition, newCursorPosition);

        setOpen(false);
        setHighlightedItem(null);
        filterStore.search = "";
      },
      [
        trigger,
        setInputValue,
        setValue,
        setOpen,
        filterStore,
        getItems,
        tokenized,
      ],
    );

    return (
      <MentionProvider
        open={open}
        onOpenChange={onOpenChange}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        value={value}
        onValueChange={setValue}
        virtualAnchor={virtualAnchor}
        onVirtualAnchorChange={setVirtualAnchor}
        trigger={trigger}
        onTriggerChange={setTrigger}
        onItemRegister={onItemRegister}
        filterStore={filterStore}
        onFilter={onFilter}
        onFilterItems={onFilterItems}
        highlightedItem={highlightedItem}
        onHighlightedItemChange={setHighlightedItem}
        onHighlightMove={onHighlightMove}
        mentions={mentions}
        onMentionAdd={onMentionAdd}
        dir={dir}
        disabled={disabled}
        exactMatch={exactMatch}
        loop={loop}
        modal={modal}
        readonly={readonly}
        tokenized={tokenized}
        inputRef={inputRef}
        listRef={listRef}
        inputId={inputId}
        labelId={labelId}
        listId={listId}
      >
        <Primitive.div ref={composedRef} {...rootProps}>
          {children}
          {isFormControl && name && (
            <BubbleInput
              type="hidden"
              control={collectionRef.current}
              name={name}
              value={value}
              disabled={disabled}
              required={required}
            />
          )}
        </Primitive.div>
      </MentionProvider>
    );
  },
);

MentionRoot.displayName = ROOT_NAME;

const Root = MentionRoot;

export { MentionRoot, Root, getDataState, useMentionContext };

export type { ItemData, MentionProps };
