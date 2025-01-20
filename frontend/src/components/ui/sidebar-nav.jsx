

import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useSidebarNav } from "../../hooks/use-sidebar-nav";
import { useSidebar } from "./sidebar";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { useAuth } from "@/hooks/auth/useAuth";
import toast from "react-hot-toast";


export function SidebarNav({ items, secondary = false, role = "student", className }) {
  const { open } = useSidebar();
  const {
    isActiveItem,
    isGroupExpanded,
    isGroupActive,
    toggleGroup,
  } = useSidebarNav();
  const navigate = useNavigate();
  const { logout } = useAuth();


  // Filter items based on role
  const filteredItems = React.useMemo(() => {
    if (!items) return [];
    return items.filter((item) => !item.roles || item.roles.includes(role));
  }, [items, role]);

  const handleItemClick = (item) => {
    if (item.action) {
      item.action(navigate, logout);
      toast.success('Logged out successfully')
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const renderMenuItem = (item) => {
    const isActive = isActiveItem(item.path);
    const Icon = item.icon;

    const menuItem = (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          "hover:bg-accent hover:text-accent-foreground",
          isActive && "bg-accent text-accent-foreground",
          !open && "justify-center"
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "h-4 w-4",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}
        {open && (
          <>
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );

    return !open ? (
      <TooltipProvider key={item.title} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{menuItem}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      menuItem
    );
  };

  const renderMenuGroup = (item) => {
    const isExpanded = isGroupExpanded(item.title);
    const isActive = isGroupActive(item.items);
    const Icon = item.icon;

    const groupButton = (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-between gap-3 px-3 py-2",
          isActive && "text-accent-foreground",
          !open && "justify-center"
        )}
        onClick={() => toggleGroup(item.title)}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              className={cn(
                "h-4 w-4",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          )}
          {open && <span className="flex-1">{item.title}</span>}
        </div>
        {open && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </Button>
    );

    return (
      <div key={item.title} className="space-y-1">
        {!open ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{groupButton}</TooltipTrigger>
              <TooltipContent side="right">
                {item.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          groupButton
        )}
        {isExpanded && open && item.items && (
          <div className="ml-4 space-y-1">
            {item.items.map((subItem) => (
              <React.Fragment key={subItem.title}>
                {renderMenuItem(subItem)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn("flex flex-col gap-4", secondary && "mt-auto pt-4 border-t", className)}>
      {filteredItems.map((item) => (
        <React.Fragment key={item.title}>
          {item.items ? (
            renderMenuGroup(item)
          ) : (
            <Button
              variant={item.variant || "ghost"}
              className={cn(
                "w-full justify-start",
                item.className
              )}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              <span>{item.title}</span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className="ml-auto"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
