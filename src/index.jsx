import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './styles/global.css';
import Layout from './Layout';
import { routes } from './routes';
import { checkLatest } from './data/release';

render(
  () => (
    <Router root={Layout} base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      {routes.map((r) => (
        <Route path={r.path} component={r.component} />
      ))}
    </Router>
  ),
  document.getElementById('app'),
);

// Once the page is up, ask GitHub whether a release newer than the built-in one is out.
(window.requestIdleCallback || ((f) => setTimeout(f, 1500)))(checkLatest);
