"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useDeleteUser } from "@/data/users/hooks";
import { UserFormModal } from "./user-form-modal";
import type { User } from "@/data/users/schemas";
import Image from "next/image";

interface UserCardProps {
  user: User;
}

export const UserCard = ({ user }: UserCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const deleteUserMutation = useDeleteUser();

  const handleDelete = () => {
    deleteUserMutation.mutate(user.id);
  };

  return (
    <>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Image
              src={user.avatar}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-12 h-12 rounded-full object-cover"
              width={48}
              height={48}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-col space-y-2">
            <div className="text-xs text-gray-500">ID: {user.id}</div>

            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1"
              >
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={deleteUserMutation.isPending}
                  >
                    {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {user.first_name}{" "}
                      {user.last_name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        user={user}
      />
    </>
  );
};
