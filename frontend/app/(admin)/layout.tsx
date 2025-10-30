"use client";

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
import { clearAdmin, clearToken, getToken } from "@/lib/api";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Receipt,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

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
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
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
              <SidebarGroupLabel className="px-6 py-6 border-b hover:bg-muted/50 transition-colors cursor-pointer">
                <Link href="/dashboard" className="block">
                  <span className="text-base font-semibold tracking-tight">
                    Savings Admin
                  </span>
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-2 space-y-2 mt-4">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.url || pathname === item.url + "/";
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`pl-4 pr-3 rounded-md transition-all duration-200 ${
                            isActive
                              ? "bg-muted border border-border shadow-sm"
                              : "hover:bg-accent hover:text-accent-foreground  hover:shadow-sm hover:scale-[1.02]"
                          }`}
                        >
                          <Link
                            href={item.url}
                            className="w-full flex items-center gap-3 py-2.5 group"
                          >
                            <Icon
                              className={`transition-colors ${
                                isActive
                                  ? "text-primary"
                                  : "group-hover:text-primary/80"
                              }`}
                            />
                            <span className="group-hover:text-foreground/90">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarFooter className="mt-auto mb-4">
              <div className="px-2 pt-4 border-t mx-4">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        clearToken();
                        clearAdmin();
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-3 py-2.5 px-4 rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive/90 transition-all duration-200"
                    >
                      <LogOut />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
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
