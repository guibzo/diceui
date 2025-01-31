"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";

const TAILWIND_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type TailwindBreakpoint = keyof typeof TAILWIND_BREAKPOINTS;
type BreakpointValue = TailwindBreakpoint | number;

type ResponsiveObject = {
  [K in BreakpointValue]?: number;
};

type ResponsiveValue = number | ResponsiveObject;

function parseBreakpoint(breakpoint: BreakpointValue): number {
  if (typeof breakpoint === "number") return breakpoint;
  return TAILWIND_BREAKPOINTS[breakpoint];
}

function useResponsiveValue(
  value: ResponsiveValue,
  defaultValue: number,
): number {
  const [currentValue, setCurrentValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (typeof value === "number") {
      setCurrentValue(value);
      return;
    }

    function updateValue() {
      const width = window.innerWidth;
      const breakpoints = Object.entries(value)
        .map(([key, val]) => ({
          breakpoint: parseBreakpoint(key as BreakpointValue),
          value: val,
        }))
        .sort((a, b) => a.breakpoint - b.breakpoint);

      // Default to 1 column for smallest screens
      let newValue = 1;

      for (const { breakpoint, value } of breakpoints) {
        if (width >= breakpoint) {
          newValue = value;
        } else {
          break;
        }
      }

      setCurrentValue(newValue);
    }

    updateValue();
    window.addEventListener("resize", updateValue);
    return () => window.removeEventListener("resize", updateValue);
  }, [value]);

  return currentValue;
}

function parseAsNumber(
  value: ResponsiveValue | undefined,
  defaultValue: number,
): number {
  if (typeof value === "number") return value;
  if (typeof value === "undefined") return defaultValue;
  return defaultValue;
}

interface MasonryProps extends React.ComponentPropsWithoutRef<"div"> {
  columnCount?: ResponsiveValue;
  spacing?: ResponsiveValue;
  sequential?: boolean;
  initialHeight?: number;
  initialColumnCount?: number;
  initialSpacing?: number;
  asChild?: boolean;
}

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  (props, forwardedRef) => {
    const {
      children,
      columnCount = 4,
      spacing = 16,
      sequential = false,
      asChild,
      initialHeight,
      initialColumnCount = parseAsNumber(columnCount, 4),
      initialSpacing = parseAsNumber(spacing, 16),
      className,
      ...rootProps
    } = props;

    const currentColumnCount = useResponsiveValue(
      columnCount,
      initialColumnCount,
    );
    const currentSpacing = useResponsiveValue(spacing, initialSpacing);

    const collectionRef = React.useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, collectionRef);
    const [maxColumnHeight, setMaxColumnHeight] = React.useState<
      number | undefined
    >(initialHeight);

    const [mounted, setMounted] = React.useState(false);
    React.useLayoutEffect(() => {
      setMounted(true);
    }, []);

    const isSSR =
      !mounted &&
      initialHeight !== undefined &&
      initialColumnCount !== undefined;
    const [lineBreakCount, setLineBreakCount] = React.useState(
      isSSR ? initialColumnCount - 1 : 0,
    );

    const onResize = React.useCallback(() => {
      if (!collectionRef.current) return;

      const items = Array.from(collectionRef.current.children) as HTMLElement[];
      const columnHeights = new Array(currentColumnCount).fill(0);
      let skip = false;
      let nextOrder = 1;

      // Reset all items
      for (const item of items) {
        if (item.dataset.class === "line-break") continue;

        item.style.removeProperty("position");
        item.style.removeProperty("top");
        item.style.removeProperty("left");
        item.style.width = `calc(${100 / currentColumnCount}% - ${(currentSpacing * (currentColumnCount - 1)) / currentColumnCount}px)`;
        item.style.margin = `${currentSpacing / 2}px`;
      }

      // Position items
      for (const item of items) {
        if (item.dataset.class === "line-break" || skip) continue;

        const itemStyle = window.getComputedStyle(item);
        const spacingValue = Number(currentSpacing);
        const marginTop = itemStyle?.marginTop
          ? Number.parseFloat(itemStyle.marginTop)
          : spacingValue / 2;
        const marginBottom = itemStyle?.marginBottom
          ? Number.parseFloat(itemStyle.marginBottom)
          : spacingValue / 2;
        const itemHeight = item.offsetHeight + marginTop + marginBottom;

        if (itemHeight === 0) {
          skip = true;
          continue;
        }

        // Check for unloaded images
        const images = item.getElementsByTagName("img");
        for (let i = 0; i < images.length; i++) {
          if (images[i]?.clientHeight === 0) {
            skip = true;
            break;
          }
        }

        if (!skip) {
          if (sequential) {
            const yPos = columnHeights[nextOrder - 1];
            item.style.position = "absolute";
            item.style.top = `${yPos}px`;
            item.style.left = `${(nextOrder - 1) * (item.offsetWidth + spacingValue)}px`;

            columnHeights[nextOrder - 1] = yPos + itemHeight;
            nextOrder += 1;
            if (nextOrder > currentColumnCount) {
              nextOrder = 1;
            }
          } else {
            const minColumnIndex = columnHeights.indexOf(
              Math.min(...columnHeights),
            );
            const xPos = minColumnIndex * (item.offsetWidth + spacingValue);
            const yPos = columnHeights[minColumnIndex];

            item.style.position = "absolute";
            item.style.top = `${yPos}px`;
            item.style.left = `${xPos}px`;

            columnHeights[minColumnIndex] = yPos + itemHeight;
          }
        }
      }

      if (!skip) {
        // Use flushSync to prevent layout thrashing
        ReactDOM.flushSync(() => {
          setMaxColumnHeight(Math.max(...columnHeights));
          setLineBreakCount(
            currentColumnCount > 0 ? currentColumnCount - 1 : 0,
          );
        });
      }
    }, [currentColumnCount, currentSpacing, sequential]);

    React.useEffect(() => {
      if (typeof ResizeObserver === "undefined") return;

      let animationFrame: number;
      const resizeObserver = new ResizeObserver(() => {
        animationFrame = requestAnimationFrame(onResize);
      });

      if (collectionRef.current) {
        const content = collectionRef.current;
        resizeObserver.observe(content);
        for (const child of Array.from(content.children)) {
          resizeObserver.observe(child);
        }
      }

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        resizeObserver.disconnect();
      };
    }, [onResize]);

    // Add line breaks to prevent columns from merging
    const lineBreaks = React.useMemo(
      () =>
        Array.from({ length: lineBreakCount }, (_, i) => (
          <span
            key={`masonry-break-${currentColumnCount}-${i.toString()}`}
            data-class="line-break"
            style={{
              flexBasis: "100%",
              width: 0,
              margin: 0,
              padding: 0,
              order: i + 1,
            }}
          />
        )),
      [lineBreakCount, currentColumnCount],
    );

    const RootSlot = asChild ? Slot : "div";

    return (
      <RootSlot
        {...rootProps}
        ref={composedRef}
        className={cn(
          "relative w-full",
          maxColumnHeight && {
            height: maxColumnHeight,
          },
          className,
        )}
      >
        {children}
        {lineBreaks}
      </RootSlot>
    );
  },
);
Masonry.displayName = "MasonryRoot";

const Root = Masonry;

export {
  Masonry,
  //
  Root,
};
