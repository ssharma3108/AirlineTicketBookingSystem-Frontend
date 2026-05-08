import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const raw =
    sessionStorage.getItem('skybooker_user') ||
    localStorage.getItem('skybooker_user');
  const token = raw ? JSON.parse(raw).token as string | undefined : undefined;

  return token
    ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
    : next(req);
};
