import { A } from '@solidjs/router';
import { REPO } from './Header';
import { asset } from '../lib/base';

export default function Footer() {
  return (
    <footer class="ftr">
      <div class="wrap">
        <div class="ftr__top">
          <p class="ftr__big">
            It opens a file, shows it properly, <em>and gets out of the way.</em>
          </p>
          <div class="ftr__cols">
            <div>
              <h2 class="ftr__h">Site</h2>
              <A href="/">Home</A>
              <A href="/features">Features</A>
              <A href="/compare">Compare</A>
              <A href="/download">Download</A>
            </div>
            <div>
              <h2 class="ftr__h">Project</h2>
              <a href={REPO} target="_blank" rel="noopener">Source</a>
              <a href={`${REPO}/issues`} target="_blank" rel="noopener">Report a bug</a>
              <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noopener">GPL-3.0-or-later</a>
            </div>
          </div>
        </div>
        <div class="ftr__bottom">
          <span class="ftr__brand">
            <img src={asset('img/logo.webp')} alt="" width="22" height="22" loading="lazy" /> Glance
          </span>
          <span>© 2026 Abhilesh Singh</span>
          <span class="faint">Free software. Written in Rust, drawn with GTK 4.</span>
        </div>
      </div>
    </footer>
  );
}
