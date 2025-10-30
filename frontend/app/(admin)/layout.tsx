"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Receipt, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getToken, clearToken, clearAdmin } from "@/lib/api";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: Receipt,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 py-4">
                <span className="text-base font-semibold">Savings Admin</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-2 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.url || pathname === item.url + "/";
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="pl-4 pr-3"
                        >
                          <Link
                            href={item.url}
                            className="w-full flex items-center gap-3"
                          >
                            <Icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarFooter className="mt-auto">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      clearToken();
                      clearAdmin();
                      router.push("/");
                    }}
                    className="justify-center"
                  >
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 shadow-sm">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                S
              </div>
              <h1 className="text-lg font-semibold">Savings Management</h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-muted/30">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
