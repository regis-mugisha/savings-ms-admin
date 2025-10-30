"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getUsers,
  verifyUserDevice,
  type User,
  type UserDetailResponse,
} from "@/lib/api";
import { Search, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUsers(page, 20, search);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleVerify = async () => {
    if (!selectedUser) return;

    try {
      setVerifying(true);
      await verifyUserDevice(selectedUser._id);
      // Reload users to show updated status
      await loadUsers();
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to verify user");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage customer accounts and verification
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "verified" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("verified")}
          >
            Verified
          </Button>
          <Button
            variant={statusFilter === "unverified" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("unverified")}
          >
            Unverified
          </Button>
        </div>
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
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No users found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">Full Name</TableHead>
                  <TableHead className="w-[32%]">Email</TableHead>
                  <TableHead className="text-right w-[15%]">Balance</TableHead>
                  <TableHead className="w-[15%]">Verification Status</TableHead>
                  <TableHead className="text-right w-[10%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter((u) =>
                    statusFilter === "all"
                      ? true
                      : statusFilter === "verified"
                      ? u.deviceVerified
                      : !u.deviceVerified
                  )
                  .map((user) => (
                    <TableRow key={user._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-right">
                        $
                        {user.balance.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.deviceVerified ? "default" : "destructive"
                          }
                          className="flex items-center gap-1 w-fit"
                        >
                          {user.deviceVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Unverified
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!user.deviceVerified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(user)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View & Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {users.length} of {total} users
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View user information and verify their device
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{selectedUser.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-medium">
                  $
                  {selectedUser.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Device ID</p>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {selectedUser.deviceId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Verification Status
                </p>
                <Badge
                  variant={
                    selectedUser.deviceVerified ? "default" : "destructive"
                  }
                >
                  {selectedUser.deviceVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={verifying}
            >
              Close
            </Button>
            {selectedUser && !selectedUser.deviceVerified && (
              <Button onClick={handleVerify} disabled={verifying}>
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Device"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
