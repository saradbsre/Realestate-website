export async function proxyRequest(req: Request, apiPath: string) {
const backendUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";
  const url = `${backendUrl}${apiPath}`;
  console.log("================================");
  console.log("🟡 NEXT.JS PROXY");
  console.log("Method:", req.method);
  console.log("API Path:", apiPath);
  console.log("Backend URL:", url);
  console.log("================================");
  const headers = new Headers();
  
  // Forward headers (e.g. cookies, content-type)
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k !== "host" && k !== "content-length") {
      if (k === "content-type" && value.includes("multipart/form-data")) {
        return; // Let fetch automatically generate the content-type with the correct boundary
      }
      headers.set(key, value);
    }
  });

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        // For multipart files, we forward the formData directly
        const formData = await req.formData();
        fetchOptions.body = formData;
      } else {
        // For JSON, we forward the raw body string
        const bodyText = await req.text();
        if (bodyText) {
          fetchOptions.body = bodyText;
        }
      }
    }

    const response = await fetch(url, fetchOptions);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`Proxy error for path ${apiPath}:`, error);
    return Response.json({ error: "Backend service unavailable" }, { status: 502 });
  }
}
