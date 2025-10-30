"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTransactions, type Transaction } from "@/lib/api";
import { ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "withdraw">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getTransactions(page, 20);
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">View all customer transactions</p>
      </div>

      <div className="mb-4 flex items-center justify-end gap-2">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("all")}
        >
          All
        </Button>
        <Button
          variant={typeFilter === "deposit" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("deposit")}
        >
          Deposits
        </Button>
        <Button
          variant={typeFilter === "withdraw" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("withdraw")}
        >
          Withdrawals
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      <div className="border rounded-lg bg-card">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[18%]">Date</TableHead>
                  <TableHead className="w-[26%]">Customer</TableHead>
                  <TableHead className="w-[14%]">Type</TableHead>
                  <TableHead className="text-right w-[14%]">Amount</TableHead>
                  <TableHead className="text-right w-[14%]">
                    Balance After
                  </TableHead>
                  <TableHead className="w-[24%]">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .filter((t) =>
                    typeFilter === "all" ? true : t.type === typeFilter
                  )
                  .map((transaction) => (
                    <TableRow
                      key={transaction._id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {transaction.userId.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.userId.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === "deposit"
                              ? "default"
                              : "destructive"
                          }
                          className="flex items-center gap-1 w-fit"
                        >
                          {transaction.type === "deposit" ? (
                            <>
                              <ArrowUpCircle className="h-3 w-3" />
                              Deposit
                            </>
                          ) : (
                            <>
                              <ArrowDownCircle className="h-3 w-3" />
                              Withdrawal
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        $
                        {transaction.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        $
                        {transaction.balanceAfter.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {transactions.length} of {total} transactions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
