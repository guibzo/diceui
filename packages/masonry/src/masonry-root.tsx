import { Primitive, composeRefs, createContext } from "@diceui/shared";
import * as React from "react";

const ROOT_NAME = "MasonryRoot";

interface MasonryItem {
  id: string | number;
  height?: number;
  [key: string]: unknown;
}

interface MasonryContextValue {
  columnCount: number;
  columnWidth: number;
  columnGutter: number;
  rowGutter: number;
  items: MasonryItem[];
  containerWidth: number;
  containerHeight: number;
  onItemResize: (index: number, height: number) => void;
}

const [MasonryProvider, useMasonryContext] =
  createContext<MasonryContextValue>(ROOT_NAME);

interface MasonryRootProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /** The number of columns in the grid */
  columnCount?: number;
  /** The minimum width of each column */
  columnWidth?: number;
  /** The horizontal gap between columns */
  columnGutter?: number;
  /** The vertical gap between items */
  rowGutter?: number;
  /** The items to render in the grid */
  items: MasonryItem[];
  /** The container width override */
  width?: number;
  /** The container height override */
  height?: number;
}

const MasonryRoot = React.forwardRef<HTMLDivElement, MasonryRootProps>(
  (props, forwardedRef) => {
    const {
      columnCount: columnCountProp,
      columnWidth: columnWidthProp = 300,
      columnGutter = 16,
      rowGutter = 16,
      items = [],
      width: widthProp,
      height: heightProp,
      children,
      ...rootProps
    } = props;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = React.useState(0);
    const [containerHeight, setContainerHeight] = React.useState(0);
    const [itemHeights, setItemHeights] = React.useState<number[]>([]);

    // Update container dimensions on mount and window resize
    React.useLayoutEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerWidth(rect.width);
          setContainerHeight(rect.height);
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Calculate column dimensions
    const width =
      widthProp ||
      containerWidth ||
      (typeof window !== "undefined" ? window.innerWidth : 0);
    const columnCount =
      columnCountProp ||
      Math.floor((width + columnGutter) / (columnWidthProp + columnGutter));
    const columnWidth = Math.floor(
      (width - (columnCount - 1) * columnGutter) / columnCount,
    );

    // Handle item resize
    const onItemResize = React.useCallback((index: number, height: number) => {
      setItemHeights((prev) => {
        const next = [...prev];
        next[index] = height;
        return next;
      });
    }, []);

    // Calculate total height
    const totalHeight = React.useMemo(() => {
      const columnHeights = new Array(columnCount).fill(0);
      itemHeights.forEach((height, i) => {
        const shortestColumn = columnHeights.indexOf(
          Math.min(...columnHeights),
        );
        columnHeights[shortestColumn] += height + rowGutter;
      });
      return Math.max(...columnHeights) - rowGutter;
    }, [columnCount, itemHeights, rowGutter]);

    const contextValue = React.useMemo(
      () => ({
        columnCount,
        columnWidth,
        columnGutter,
        rowGutter,
        items,
        containerWidth: width,
        containerHeight: heightProp || containerHeight,
        onItemResize,
      }),
      [
        columnCount,
        columnWidth,
        columnGutter,
        rowGutter,
        items,
        width,
        heightProp,
        containerHeight,
        onItemResize,
      ],
    );

    return (
      <MasonryProvider {...contextValue}>
        <Primitive.div
          ref={composeRefs(containerRef, forwardedRef)}
          style={{
            position: "relative",
            width: "100%",
            height: totalHeight || "auto",
            minHeight: heightProp,
          }}
          {...rootProps}
        >
          {children}
        </Primitive.div>
      </MasonryProvider>
    );
  },
);

MasonryRoot.displayName = ROOT_NAME;

export { MasonryRoot, useMasonryContext };
export type { MasonryRootProps, MasonryItem };
