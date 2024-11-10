"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

const ActionButtonComponent = ({ data, onDelete }) => {
  const pathname = usePathname();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="destructive" size="sm" className=" ml-4">
          <span className="sr-only">Open menu</span>
          Actions
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[160px]">
        <Link
          href={`${pathname}/edit/${data?.id}`}
          className="w-full flex items-center  px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
        >
          Edit <Pencil size={12} className="ml-2" />
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full flex items-center justify-start text-red-600 hover:text-red-600 hover:bg-red-100"
              variant="ghost"
            >
              Delete <Trash size={12} className="ml-2" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                selected item and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(data?.id);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PopoverContent>
    </Popover>
  );
};

export default ActionButtonComponent;
