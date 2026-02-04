import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const API = environment.apiUrl ?? '';

/**
 * Prevents caching of API responses: adds no-cache request headers and
 * a cache-busting query param so the browser doesn't reuse stale data
 * (e.g. home page sliders, tours, hotels).
 */
export const noCacheApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!API || !req.url.startsWith(API)) {
    return next(req);
  }
  const params = req.params.has('_') ? req.params : req.params.set('_', Date.now().toString());
  const cloned = req.clone({
    setHeaders: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    params,
  });
  return next(cloned);
};
