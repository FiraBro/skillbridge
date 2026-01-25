// apps/web/src/app/router.jsx
import { ErrorBoundary } from "react-error-boundary";

export const router = createBrowserRouter([
  {
    path: "/profile/:id",
    element: (
      <ErrorBoundary fallback={<div>A critical error occurred.</div>}>
        <Suspense fallback={<PageLoader />}>
          <Profile />
        </Suspense>
      </ErrorBoundary>
    ),
  },
]);
