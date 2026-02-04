import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static routes: prerender
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'tours', renderMode: RenderMode.Prerender },
  { path: 'tour-details', renderMode: RenderMode.Prerender },
  { path: 'contact-us', renderMode: RenderMode.Prerender },
  { path: 'gallery', renderMode: RenderMode.Prerender },
  { path: 'destination', renderMode: RenderMode.Prerender },
  // Param routes: server-render on demand (no getPrerenderParams)
  { path: 'tours/:slug', renderMode: RenderMode.Server },
  { path: 'tour-details/:slug', renderMode: RenderMode.Server },
  { path: 'destination/:countrySlug', renderMode: RenderMode.Server },
  { path: 'destination/:placeSlug', renderMode: RenderMode.Server },
  // Catch-all (e.g. redirects)
  { path: '**', renderMode: RenderMode.Server }
];
