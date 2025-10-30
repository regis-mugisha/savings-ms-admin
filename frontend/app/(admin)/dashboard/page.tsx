"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardStats,
  type DashboardStats,
  getAdmin,
  getTransactions,
  type TransactionsResponse,
  getUsers,
  type UsersResponse,
  verifyUserDevice,
  getUser,
} from "@/lib/api";
import { Users, UserCheck, UserX, Receipt, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [adminName, setAdminName] = useState<string>("");
  const [recentTx, setRecentTx] = useState<TransactionsResponse | null>(null);
  const [pendingUsers, setPendingUsers] = useState<UsersResponse | null>(null);
  const [reviewUserId, setReviewUserId] = useState<string | null>(null);
  const [reviewUser, setReviewUser] = useState<
    UsersResponse["users"][number] | null
  >(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const admin = getAdmin();
    setAdminName(admin?.fullName ?? "");
    loadStats();
    loadRecent();
    loadPending();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const loadRecent = async () => {
    try {
      const data = await getTransactions(1, 6);
      setRecentTx(data);
    } catch {}
  };

  const loadPending = async () => {
    try {
      const data = await getUsers(1, 10, "");
      data.users = data.users.filter((u) => !u.deviceVerified);
      setPendingUsers(data);
    } catch {}
  };

  const openReview = async (userId: string) => {
    setReviewUserId(userId);
    try {
      const details = await getUser(userId);
      setReviewUser(details.user);
    } catch {}
  };

  const activateDevice = async (userId: string) => {
    try {
      setVerifying(true);
      await verifyUserDevice(userId);
      setReviewUserId(null);
      setReviewUser(null);
      await loadPending();
    } catch (e) {
      // surface minimal error on page banner
      setError(e instanceof Error ? e.message : "Failed to verify user");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your savings system
          </p>
          {adminName && (
            <p className="mt-1 text-sm text-foreground">
              Welcome back, {adminName}.
            </p>
          )}
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : stats?.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : stats?.verifiedUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verifications
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading || !stats
                ? "-"
                : (stats.totalUsers - stats.verifiedUsers).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Users awaiting device verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "-" : stats?.totalTransactions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">User</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentTx?.transactions ?? []).slice(0, 6).map((t) => {
                    const dt = new Date(t.createdAt);
                    return (
                      <tr key={t._id} className="border-b last:border-0">
                        <td className="py-2">{t.userId.fullName}</td>
                        <td className="py-2 capitalize">{t.type}</td>
                        <td className="py-2 tabular-nums">{`$${t.amount.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}`}</td>
                        <td className="py-2">{dt.toLocaleDateString()}</td>
                        <td className="py-2">
                          {dt.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                  {(!recentTx || recentTx.transactions.length === 0) && (
                    <tr>
                      <td
                        className="py-6 text-center text-muted-foreground"
                        colSpan={5}
                      >
                        {loading ? "Loading..." : "No transactions"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Device Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Device ID</th>
                    <th className="py-2">Created</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(pendingUsers?.users ?? []).slice(0, 6).map((u) => (
                    <tr key={u._id} className="border-b last:border-0">
                      <td className="py-2">{u.fullName}</td>
                      <td className="py-2">{u.email}</td>
                      <td className="py-2">{u.deviceId}</td>
                      <td className="py-2">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <Button size="sm" onClick={() => openReview(u._id)}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!pendingUsers || pendingUsers.users.length === 0) && (
                    <tr>
                      <td
                        className="py-6 text-center text-muted-foreground"
                        colSpan={5}
                      >
                        No pending requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!reviewUserId}
        onOpenChange={(o) => !o && setReviewUserId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>{" "}
              {reviewUser?.fullName}
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              {reviewUser?.email}
            </div>
            <div>
              <span className="text-muted-foreground">Device ID:</span>{" "}
              {reviewUser?.deviceId}
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>{" "}
              {reviewUser
                ? new Date(reviewUser.createdAt).toLocaleString()
                : ""}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="default"
              onClick={() => reviewUserId && activateDevice(reviewUserId)}
              disabled={verifying}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {verifying ? "Activating..." : "Activate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
