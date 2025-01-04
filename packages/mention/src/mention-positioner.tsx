import { Primitive, useComposedRefs, useScrollLock } from "@diceui/shared";
import { FloatingFocusManager } from "@floating-ui/react";
import * as React from "react";
import { MentionContentProvider } from "./mention-content";
import { getDataState, useMentionContext } from "./mention-root";
import type { UseMentionPositionerParams } from "./use-mention-positioner";
import { useMentionPositioner } from "./use-mention-positioner";

const POSITIONER_NAME = "MentionPositioner";

interface MentionPositionerProps
  extends Omit<
      UseMentionPositionerParams,
      "open" | "onOpenChange" | "triggerRef"
    >,
    React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * Whether the positioner should always be rendered.
   * @default false
   */
  forceMount?: boolean;
}

const MentionPositioner = React.forwardRef<
  HTMLDivElement,
  MentionPositionerProps
>((props, forwardedRef) => {
  const {
    forceMount = false,
    side = "bottom",
    sideOffset = 4,
    align = "start",
    alignOffset = 0,
    arrowPadding = 0,
    collisionBoundary,
    collisionPadding,
    sticky = "partial",
    strategy = "absolute",
    avoidCollisions = true,
    fitViewport = false,
    hideWhenDetached = false,
    trackAnchor = true,
    style,
    ...positionerProps
  } = props;

  const context = useMentionContext(POSITIONER_NAME);

  const positionerContext = useMentionPositioner({
    open: context.open,
    onOpenChange: context.onOpenChange,
    triggerRef: context.inputRef,
    side,
    sideOffset,
    align,
    alignOffset,
    arrowPadding,
    collisionBoundary,
    collisionPadding,
    sticky,
    strategy,
    avoidCollisions,
    fitViewport,
    hideWhenDetached,
    trackAnchor,
  });

  const composedRef = useComposedRefs<HTMLDivElement>(forwardedRef, (node) =>
    positionerContext.refs.setFloating(node),
  );

  useScrollLock({
    enabled: context.open && context.modal,
  });

  if (!forceMount && !context.open) return null;

  return (
    <FloatingFocusManager
      context={positionerContext.context}
      modal={false}
      initialFocus={context.inputRef}
      returnFocus={false}
      visuallyHiddenDismiss
    >
      <MentionContentProvider
        side={positionerContext.renderedSide}
        align={positionerContext.renderedAlign}
        arrowStyles={positionerContext.arrowStyles}
        arrowDisplaced={positionerContext.arrowDisplaced}
        onArrowChange={positionerContext.onArrowChange}
        forceMount={forceMount}
      >
        <Primitive.div
          ref={composedRef}
          role="listbox"
          aria-orientation="vertical"
          data-state={getDataState(context.open)}
          data-side={positionerContext.renderedSide}
          data-align={positionerContext.renderedAlign}
          style={{
            ...style,
            ...positionerContext.floatingStyles,
            position: strategy,
            top: context.triggerPoint?.top ?? 0,
            left: context.triggerPoint?.left ?? 0,
          }}
          {...positionerProps}
        />
      </MentionContentProvider>
    </FloatingFocusManager>
  );
});

MentionPositioner.displayName = POSITIONER_NAME;

export { MentionPositioner };
export type { MentionPositionerProps };
