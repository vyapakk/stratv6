import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, User, Check, X, BarChart3, Database, Lock, BellRing, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import stratviewLogo from "@/assets/stratview-logo.png";
import { categories } from "@/data/datasets";
import { activeDashboardRoutes } from "@/data/dashboardRoutes";

interface SearchResult {
  type: "dataset" | "dashboard";
  name: string;
  category: string;
  datasetId: string;
  dashboardId?: string;
  purchased?: boolean;
  route?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "update" | "alert" | "info";
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New Dataset Available",
    message: "Carbon Fiber Market Q4 2024 data has been updated.",
    time: "2 hours ago",
    read: false,
    type: "update",
  },
  {
    id: "2",
    title: "Subscription Expiring",
    message: "Your Aircraft Interiors subscription expires in 7 days.",
    time: "1 day ago",
    read: false,
    type: "alert",
  },
  {
    id: "3",
    title: "New Dashboard Added",
    message: "EV Battery Market dashboard now includes regional forecasts.",
    time: "3 days ago",
    read: true,
    type: "info",
  },
];

const DashboardHeader = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const results: SearchResult[] = [];

    for (const cat of categories) {
      for (const ds of cat.datasets) {
        // Match dataset name
        if (ds.name.toLowerCase().includes(q)) {
          results.push({
            type: "dataset",
            name: ds.name,
            category: cat.title,
            datasetId: ds.id,
          });
        }
        // Match individual dashboards
        for (const db of ds.dashboards) {
          if (db.name.toLowerCase().includes(q)) {
            results.push({
              type: "dashboard",
              name: db.name,
              category: cat.title,
              datasetId: ds.id,
              dashboardId: db.id,
              purchased: db.purchased,
              route: activeDashboardRoutes[db.id],
            });
          }
        }
      }
    }
    return results.slice(0, 10); // cap at 10 results
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(`/dataset/${result.datasetId}`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "update":
        return <BellRing className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "update":
        return "bg-primary/10 text-primary";
      case "alert":
        return "bg-destructive/10 text-destructive";
      case "info":
        return "bg-muted text-muted-foreground";
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={stratviewLogo}
            alt="Stratview Research"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search datasets, dashboards..."
              className="pl-10 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-card transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
            />
            {searchOpen && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <ScrollArea className="max-h-[320px]">
                    <div className="py-1">
                      {searchResults.map((result, i) => (
                        <button
                          key={`${result.type}-${result.dashboardId || result.datasetId}-${i}`}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground">
                            {result.type === "dataset" ? (
                              <Database className="h-4 w-4" />
                            ) : (
                              <BarChart3 className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {result.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.category} · {result.type === "dataset" ? "Dataset" : "Dashboard"}
                            </p>
                          </div>
                          {result.type === "dashboard" && !result.purchased && (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0">
              <DialogHeader className="px-6 py-4 pr-12 border-b border-border shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-lg font-semibold">Notifications</DialogTitle>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground h-auto py-1.5 px-3"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 min-h-0">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Bell className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">No notifications to show</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`group relative px-6 py-4 hover:bg-muted/40 transition-colors ${
                          !notification.read ? "bg-primary/[0.03]" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-0.5 rounded-full p-2 shrink-0 ${getTypeStyles(notification.type)}`}>
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={() => markAsRead(notification.id)}
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => dismissNotification(notification.id)}
                              title="Dismiss"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden md:inline text-sm font-medium">John Doe</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/my-account")}>
                <User className="h-4 w-4 mr-2" />
                My Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
