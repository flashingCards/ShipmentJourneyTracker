
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppWindow, BarChart3, Home, Settings } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    href: "/",
    label: "Shipment Tracker",
    icon: Home,
  },
  {
    href: "/configure",
    label: "Configuration",
    icon: Settings,
  },
  {
    href: "https://flashingcards.github.io/ConsoleBenefit/",
    label: "Console Benefit",
    icon: AppWindow,
  },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex h-9 items-center gap-2 px-2">
            <BarChart3 className="size-6 text-primary" />
            <h1 className="font-bold text-lg group-data-[collapsible=icon]:hidden">
              ShipmentApp
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <SidebarTrigger />
          <h1 className="font-bold text-lg">Shipment Tracker</h1>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
