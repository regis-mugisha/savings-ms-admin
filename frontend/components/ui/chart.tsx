"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Tooltip as RechartsTooltip } from "recharts";

export type ChartConfig = {
  [key in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ children, config, className, ...props }, ref) => {
    const chartConfig = React.useMemo(() => {
      return Object.entries(config).reduce((acc, [key, value]) => {
        acc[key] = {
          ...value,
          color: value.color ?? "hsl(var(--primary))",
        };
        return acc;
      }, {} as ChartConfig);
    }, [config]);

    return (
      <div
        data-chart
        ref={ref}
        style={
          Object.entries(chartConfig).reduce(
            (acc, [key, itemConfig]) => ({
              ...acc,
              [`--color-${key}`]: itemConfig.color,
            }),
            {}
          ) as React.CSSProperties
        }
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-legend-item_text]:text-muted-foreground [&_.recharts-surface]:overflow-visible",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChartContainer.displayName = "Chart";

const ChartTooltip = RechartsTooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    React.ComponentProps<typeof RechartsTooltip> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
    }
>(
  (
    {
      active,
      payload,
      label,
      className,
      hideLabel = false,
      hideIndicator = false,
    },
    ref
  ) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel && (
          <div className="font-medium text-foreground">{label}</div>
        )}
        <div className="grid gap-1.5">
          {payload.map(
            (item: {
              dataKey: string;
              color?: string;
              name?: string;
              value: number;
            }) => (
              <div
                key={item.dataKey}
                className="flex items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
              >
                {!hideIndicator && (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                <div className="flex flex-1 justify-between leading-none">
                  <p className="text-muted-foreground">{item.name}</p>
                  <p className="font-medium text-foreground">
                    {item.value.toLocaleString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };
