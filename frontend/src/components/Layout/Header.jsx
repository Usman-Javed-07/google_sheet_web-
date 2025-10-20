import React from "react";
import { Menu, Search, Plus, LogOut, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

function initials(name = "") {
  const p = name.trim().split(/\s+/);
  if (!p.length) return "AD";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function Header({
  brand = "Mars Capital",
  admin = {
    name: "System Admin",
    email: "admin@example.com",
    username: "admin",
    role: "admin",
    department: "IT",
    imageUrl: "",
  },
  onOpenSidebar = () => {},
  onSearchChange = () => {},
  onSearchSubmit = () => {},
  onAddUser = () => {},
  onUpdateProfile = () => {},
  onLogout = () => {},
}) {
  const searchRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [hoverOpen, setHoverOpen] = React.useState(false);

  // Ctrl/Cmd+K focus search
  React.useEffect(() => {
    const key = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <div className="flex h-14 w-full items-center gap-3 px-4 md:gap-4">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold sm:text-lg">{brand}</span>
          <Separator orientation="vertical" className="hidden h-5 md:block" />
          <span className="hidden text-sm text-muted-foreground md:block">
            Admin
          </span>
        </div>

        {/* Search (takes full remaining width) */}
        <div className="ml-2 flex flex-1 min-w-0 items-center">
          <div className="relative w-full">
            {/* <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />*/}
            <Input
              ref={searchRef}
              placeholder="Search users, email, department…"
              className="h-10 w-full rounded-xl pl-9 pr-14"
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchSubmit(e.currentTarget.value);
              }}
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              ⌘/Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-2 flex items-center gap-2">
          <Button
            onClick={onAddUser}
            className="hidden gap-2 rounded-xl sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>

          {/* Avatar: HoverCard for details, Dropdown for actions */}
          <HoverCard
            open={hoverOpen && !menuOpen}
            onOpenChange={(open) => setHoverOpen(open)}
            openDelay={150}
            closeDelay={100}
          >
            <HoverCardTrigger asChild>
              <DropdownMenu onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 rounded-full px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={admin.imageUrl} alt={admin.name} />
                      <AvatarFallback>{initials(admin.name)}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 hidden text-sm md:inline">
                      {admin.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <div className="px-2 pb-2 text-xs text-muted-foreground">
                    {admin.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onUpdateProfile}>
                    <UserCog className="mr-2 h-4 w-4" />
                    Update profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </HoverCardTrigger>

            <HoverCardContent
              side="bottom"
              align="end"
              className="hidden w-72 p-4 md:block"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={admin.imageUrl} alt={admin.name} />
                  <AvatarFallback>{initials(admin.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate font-medium">{admin.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    @{admin.username} • {admin.role}
                  </div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-1 text-sm">
                <div className="truncate">Email: {admin.email}</div>
                {admin.department ? (
                  <div className="truncate">Dept: {admin.department}</div>
                ) : null}
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </header>
  );
}
