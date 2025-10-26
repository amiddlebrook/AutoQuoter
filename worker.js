export default {
  async fetch(request, env, ctx) {
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    const url = new URL(request.url);
    if (request.method === "GET" && !url.pathname.includes(".")) {
      const indexRequest = new Request(`${url.origin}/index.html`, request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      if (indexResponse.status !== 404) {
        return indexResponse;
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
