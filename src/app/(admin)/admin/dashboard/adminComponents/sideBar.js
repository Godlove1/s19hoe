"use client"
import {
  X,
  AppWindow,
  Globe2,
  ListFilter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRightIcon,
  HomeIcon,
} from "lucide-react";
import { useState } from "react";
import { Medicine01Icon,ShippingCenterIcon } from "hugeicons-react";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    items: [
      { name: "visit Website", icon: Globe2, link: "../" },
      { name: "Overview", icon: HomeIcon, link: "/admin/dashboard" },
      {
        name: "Products",
        icon: Medicine01Icon,
        link: "/admin/dashboard/products",
      },

      {
        name: "Categories",
        icon: ListFilter,
        link: "/admin/dashboard/categories",
      },
      {
        name: "Shipping Prices",
        icon: ShippingCenterIcon,
        link: "/admin/dashboard/shipping",
      },
    ],
  },
];


export default function SideBar({ toggleSidebar, sidebarOpen }) {

    const [openMenus, setOpenMenus] = useState({});
    const pathname = usePathname();

  
 const toggleMenu = (menuName) => {
   setOpenMenus((prevState) => ({
     ...prevState,
     [menuName]: !prevState[menuName],
   }));
    };
    
    const isLinkActive = (link, item) => {
      if (pathname === link) return true;
      if (item.children) {
        return item.children.some((child) => pathname.startsWith(child.link));
      }
      return false;
    };

 const MenuItem = ({ item, depth = 0 }) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.name];
        const isActive = isLinkActive(item.link, item);

   return (
     <>
       <Link
         href={item.link}
         className={cn(
           "flex items-center w-full px-3 py-2 transition-colors rounded-md",
           depth > 0 && "pl-8 mt-0",
           isActive
             ? "bg-green-600 text-white"
             : "hover:bg-green-600 hover:text-white"
         )}
         onClick={(e) => {
           if (hasChildren) {
             e.preventDefault();
             toggleMenu(item.name);
           } else {
             toggleSidebar() // Close the sidebar when a link is clicked
           }
         }}
       >
         {item.icon && <item.icon className="mr-2 h-4 w-4" />}
         <span className="flex-grow">{item.name}</span>
         {hasChildren && (
           <ChevronRightIcon
             className={cn(
               "h-4 w-4 transition-transform",
               isOpen && "rotate-90"
             )}
           />
         )}
       </Link>
       {hasChildren && isOpen && (
         <div className="ml-4 text-sm mt-1">
           {item.children.map((child) => (
             <MenuItem key={child.name} item={child} depth={depth + 1} />
           ))}
         </div>
       )}
     </>
   );
 };

 const Sidebar = ({ className }) => (
   <div className={cn("pb-12", className)}>
     <div className="space-y-4 py-4">
       {menuItems.map((section) => (
         <div key={section.title} className="px-3 py-2">
           <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
             {section.title}
           </h2>
           <div className="space-y-1">
             {section.items.map((item) => (
               <MenuItem key={item.name} item={item} />
             ))}
           </div>
         </div>
       ))}
     </div>
   </div>
 );
      
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-24 mb-2 items-center justify-between ">
            <div className="image-logo flex justify-center items-center w-full mt-6">
              <Image
                src={"/icons/logo.png"}
                width={200}
                height={200}
                priority
                alt="logo"
                className="w-36"
              />
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden rounded-full mr-2 flex-shrink-0 shadow-md "
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Sidebar content */}
          <ScrollArea className="flex-1 px-3">
            <Sidebar />
          </ScrollArea>

          {/* Sidebar footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-green-600"
            >
              <AppWindow className="mr-2 h-4 w-4" />
              S19 Hoe 2024
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
