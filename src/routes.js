import { lazy } from 'solid-js';
import { stripBase } from './lib/base';

const page = (load) => {
  const component = lazy(load);
  return { component, preload: () => component.preload() };
};

export const routes = [
  { path: '/', label: 'Home', ...page(() => import('./pages/Home')) },
  { path: '/features', label: 'Features', ...page(() => import('./pages/Features')) },
  { path: '/compare', label: 'Compare', ...page(() => import('./pages/Compare')) },
  { path: '/download', label: 'Download', ...page(() => import('./pages/Download')) },
  { path: '*404', label: 'Not found', ...page(() => import('./pages/NotFound')) },
];

export const nav = routes.filter((r) => !r.path.startsWith('*'));

export function routeFor(pathname) {
  const clean = stripBase(pathname).replace(/\/+$/, '') || '/';
  return routes.find((r) => r.path === clean) || routes[routes.length - 1];
}
