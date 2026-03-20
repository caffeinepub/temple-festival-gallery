import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree";

const router = createRouter({ routeTree });

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.02 55)",
            border: "1px solid oklch(0.78 0.15 75 / 0.3)",
            color: "oklch(0.95 0.02 80)",
          },
        }}
      />
    </>
  );
}
