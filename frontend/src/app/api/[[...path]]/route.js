import { proxyRequest } from "@/lib/apiProxy";

const staticRoutes = {
  "admin/bookings": { backendPath: "/api/admin/bookings", methods: ["GET", "PATCH"] },
  "admin/check-auth": { backendPath: "/api/admin/check-auth", methods: ["GET"] },
  "admin/login": { backendPath: "/api/admin/login", methods: ["POST"] },
  "admin/logout": { backendPath: "/api/admin/logout", methods: ["POST"] },
  "admin/nationality-rejections": {
    backendPath: "/api/admin/nationality-rejections",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
  "admin/users": { backendPath: "/api/admin/users", methods: ["GET", "POST", "DELETE"] },
  "admin/verify-otp": { backendPath: "/api/admin/verify-otp", methods: ["POST"] },
  bookings: { backendPath: "/api/bookings", methods: ["POST"] },
  contact: { backendPath: "/api/enquiries", methods: ["POST"] },
  health: { backendPath: "/api/health", methods: ["GET"] },
  properties: { backendPath: "/api/properties", methods: ["GET"] },
  sync: { backendPath: "/api/admin/sync", methods: ["POST"] },
  "upcoming-projects": { backendPath: "/api/upcoming-projects", methods: ["GET"] },
};

function resolveRoute(path) {
  const route = path.join("/");
  const staticRoute = staticRoutes[route];

  if (staticRoute) return staticRoute;

  if (path.length === 2 && path[0] === "properties") {
    return {
      backendPath: `/api/properties/${encodeURIComponent(path[1])}`,
      methods: ["GET"],
    };
  }

  if (path.length === 4 && path[0] === "admin" && path[1] === "bookings" && path[3] === "passport") {
    return {
      backendPath: `/api/admin/bookings/${encodeURIComponent(path[2])}/passport`,
      methods: ["GET"],
    };
  }

  if (path.length === 3 && path[0] === "properties" && path[2] === "units") {
    return {
      backendPath: `/api/properties/${encodeURIComponent(path[1])}/units`,
      methods: ["GET"],
    };
  }

  return null;
}

async function handleRequest(req, context) {
  const { path = [] } = await context.params;
  const route = resolveRoute(path);
  console.log("🟡 FRONTEND PROXY", {
    path,
    method: req.method,
    route,
  });
  if (!route) {
    return Response.json({ error: "API route not found" }, { status: 404 });
  }

  if (!route.methods.includes(req.method)) {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: { Allow: route.methods.join(", ") } },
    );
  }

  const query = new URL(req.url).search;
  return proxyRequest(req, `${route.backendPath}${query}`);
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
