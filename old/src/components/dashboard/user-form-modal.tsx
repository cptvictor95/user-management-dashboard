import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser, useUpdateUser } from "@/data/users/hooks";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
  type User,
} from "@/data/users/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  user?: User;
  onUserCreated?: () => void;
}

export const UserFormModal = ({
  isOpen,
  onClose,
  mode,
  user,
  onUserCreated,
}: UserFormModalProps) => {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isEdit = mode === "edit";
  const schema = isEdit ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues:
      isEdit && user
        ? {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
          }
        : {
            email: "",
            first_name: "",
            last_name: "",
          },
  });

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      reset(
        isEdit && user
          ? {
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
            }
          : {
              email: "",
              first_name: "",
              last_name: "",
            }
      );
    }
  }, [isOpen, isEdit, user, reset]);

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      if (isEdit && user) {
        await updateUserMutation.mutateAsync({
          id: user.id,
          userData: data as UpdateUserFormData,
        });
      } else {
        await createUserMutation.mutateAsync(data as CreateUserFormData);
        // Call the callback to navigate to first page after creating user
        onUserCreated?.();
      }
      onClose();
      reset();
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              type="text"
              {...register("first_name")}
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              type="text"
              {...register("last_name")}
              className={errors.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.last_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <DialogFooter className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update User"
                  : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
