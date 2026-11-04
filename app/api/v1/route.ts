import { API_VERSION, apiRoute } from "@/lib/cms/api";
import { SITE } from "@/lib/site";

/** GET /api/v1 — check a key and list the endpoints. */
export const GET = apiRoute(async (_req, key) =>
  Response.json({
    data: {
      api_version: API_VERSION,
      site: SITE.url,
      key: { name: key.name, prefix: key.prefix },
      endpoints: [
        "GET /api/v1/categories", "POST /api/v1/categories", "PATCH /api/v1/categories/{id}", "DELETE /api/v1/categories/{id}",
        "GET /api/v1/posts", "POST /api/v1/posts", "GET /api/v1/posts/{id|slug}", "PATCH /api/v1/posts/{id|slug}", "DELETE /api/v1/posts/{id|slug}",
        "GET /api/v1/media", "POST /api/v1/media",
      ],
      docs: "docs/cms/API.md",
    },
  }),
);
