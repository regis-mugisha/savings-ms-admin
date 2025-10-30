"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getTransactions,
  getUsers,
  type Transaction,
  type UsersResponse,
} from "@/lib/api";
import {
  BarChart3,
  Loader2,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [transactionsResponse, usersResponse] = await Promise.all([
          getTransactions(1, 1000),
          getUsers(1, 1000, ""),
        ]);
        setTransactions(transactionsResponse.transactions);
        setUsers(usersResponse);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const barChartData = useMemo(() => {
    if (transactions.length === 0) return [];
    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const last6Months = Array.from({ length: 6 })
      .map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return {
          month: monthLabels[d.getMonth()],
          deposits: 0,
          withdrawals: 0,
        };
      })
      .reverse();
    const monthMap = new Map(last6Months.map((m) => [m.month, m]));
    for (const t of transactions) {
      const month = monthLabels[new Date(t.createdAt).getMonth()];
      if (monthMap.has(month)) {
        const data = monthMap.get(month)!;
        if (t.type === "deposit") data.deposits += t.amount;
        else data.withdrawals += t.amount;
      }
    }
    return Array.from(monthMap.values());
  }, [transactions]);

  const pieChartData = useMemo(() => {
    if (!users) return [];
    const verified = users.users.filter((u) => u.deviceVerified).length;
    const unverified = users.total - verified;
    return [
      { name: "Verified", value: verified, fill: "var(--color-verified)" },
      {
        name: "Unverified",
        value: unverified,
        fill: "var(--color-unverified)",
      },
    ];
  }, [users]);

  const barChartConfig = {
    deposits: { label: "Deposits", color: "hsl(var(--chart-1))" },
    withdrawals: { label: "Withdrawals", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const pieChartConfig = {
    verified: { label: "Verified", color: "hsl(var(--chart-1))" },
    unverified: { label: "Unverified", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6" /> Analytics
        </h1>
        <p className="text-muted-foreground">
          Key insights across users and transactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Deposits vs Withdrawals</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={barChartConfig}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `$${value / 1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="deposits"
                    fill="var(--color-deposits)"
                    radius={4}
                  />
                  <Bar
                    dataKey="withdrawals"
                    fill="var(--color-withdrawals)"
                    radius={4}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground leading-none">
              Note: This is placeholder data for demonstration.
            </div>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5" /> Users Verification
            </CardTitle>
            <CardDescription>Current user status distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square h-full max-h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    activeIndex={activeIndex ?? undefined}
                    // FIX: Added explicit types for the function parameters
                    onMouseEnter={(_: object, index: number) =>
                      setActiveIndex(index)
                    }
                    onMouseLeave={() => setActiveIndex(null)}
                    activeShape={(props: {
                      cx: number;
                      cy: number;
                      innerRadius: number;
                      outerRadius: number;
                      startAngle: number;
                      endAngle: number;
                      fill: string;
                    }) => {
                      // Type props as any to resolve type issues
                      const {
                        cx,
                        cy,
                        innerRadius,
                        outerRadius,
                        startAngle,
                        endAngle,
                        fill,
                      } = props;
                      return (
                        <g>
                          <Sector
                            cx={cx}
                            cy={cy}
                            innerRadius={innerRadius}
                            outerRadius={(outerRadius ?? 0) + 4}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            fill={fill}
                          />
                        </g>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 leading-none font-medium">
              Total Users: {users?.total.toLocaleString()}
            </div>
            <div className="text-muted-foreground leading-none">
              Updated in real-time as users get verified.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
