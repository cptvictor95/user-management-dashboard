import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const items = [
  {
    label: "Sign Up",
    to: "/sign-up",
  },
  {
    label: "Sign In",
    to: "/sign-in",
  },
];

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-4 flex gap-2 w-full">
        {items.map((item) => (
          <Link to={item.to} className="[&.active]:font-bold">
            {item.label}
          </Link>
        ))}
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
