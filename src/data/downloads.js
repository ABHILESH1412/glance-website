// ─────────────────────────────────────────────────────────────────────────
//  Everything the site says about getting Glance lives in this file.
//  Commands are the ones in the Glance README, word for word.
//
//  The download links use GitHub's /releases/latest/download/<file>, which
//  always serves the newest release — so a new release needs no change here
//  unless a file is renamed. Do bump `version` and the file sizes.
// ─────────────────────────────────────────────────────────────────────────

export const version = '2.0.0';
export const repo = 'https://github.com/ABHILESH1412/glance';
export const releases = `${repo}/releases`;
export const latestRelease = `${repo}/releases/latest`;
const latest = (file) => `${repo}/releases/latest/download/${file}`;

export const APP_ID = 'io.github.abhilesh1412.Glance';
const FLATHUB = 'flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo';

// The files attached to every release.
export const files = {
  flatpak: { name: 'Glance-x86_64.flatpak', url: latest('Glance-x86_64.flatpak'), size: '8.9 MB', what: 'Flatpak bundle — any distribution' },
  appimage: { name: 'Glance-x86_64.AppImage', url: latest('Glance-x86_64.AppImage'), size: '49.3 MB', what: 'AppImage — one file, distributions from 2024 on' },
  arch: { name: 'glance-image-viewer-x86_64.pkg.tar.zst', url: latest('glance-image-viewer-x86_64.pkg.tar.zst'), size: '6.7 MB', what: 'Arch package — Arch, Manjaro, EndeavourOS' },
  sums: { name: 'SHA256SUMS', url: latest('SHA256SUMS'), size: '282 bytes', what: 'Checksums of the three files above' },
  source: { name: `glance-${version}.tar.gz`, url: `${repo}/archive/refs/tags/v${version}.tar.gz`, size: '', what: 'Source code' },
};

export const requirements =
  'A 64-bit Intel or AMD computer running Linux. The Flatpak works on any distribution, old or new; the AppImage needs one from 2024 on.';

const flatpakRun = `flatpak run ${APP_ID}`;
const flatpakRemove = `flatpak uninstall --user ${APP_ID}`;
const flatpakNote = 'The Flatpak brings its own GTK, libadwaita, Poppler and qpdf through GNOME’s shared runtime — about 1 GB the first time, shared with every other GNOME Flatpak — so it works the same everywhere.';

// `steps`: numbered blocks. A step has `code`, or `blocks` (several titled
// alternatives, one per distribution). `after`: a line under the steps.
export const channels = [
  {
    id: 'ubuntu',
    name: 'Ubuntu & friends',
    for: 'Ubuntu, Linux Mint, Pop!_OS, Zorin, elementary OS',
    method: 'Flatpak',
    file: 'flatpak',
    also: 'appimage',
    note: `Works on Ubuntu 22.04 and newer, Linux Mint 21 and newer, Pop!_OS, Zorin and elementary OS. ${flatpakNote}`,
    steps: [
      { title: 'Flatpak itself', hint: 'Linux Mint and Pop!_OS already have it; this does no harm', code: 'sudo apt update\nsudo apt install -y flatpak' },
      { title: 'Flathub, where Glance’s runtime comes from', code: FLATHUB },
      { title: 'Download and install Glance', code: `wget ${files.flatpak.url}\nflatpak install --user -y ./${files.flatpak.name}` },
    ],
    after: 'If Glance does not appear in the applications menu straight away, log out and back in once: that is when a desktop first learns about Flatpak’s applications.',
    run: flatpakRun,
    remove: flatpakRemove,
  },
  {
    id: 'debian',
    name: 'Debian',
    for: 'Debian 12 and 13',
    method: 'Flatpak',
    file: 'flatpak',
    also: 'appimage',
    note: `${flatpakNote} The AppImage also works on Debian 13.`,
    steps: [
      { title: 'Flatpak and wget', code: 'sudo apt update\nsudo apt install -y flatpak wget' },
      { title: 'Flathub, where Glance’s runtime comes from', code: FLATHUB },
      { title: 'Download and install Glance', code: `wget ${files.flatpak.url}\nflatpak install --user -y ./${files.flatpak.name}` },
    ],
    after: 'Log out and back in once if Glance is not in the applications menu yet.',
    run: flatpakRun,
    remove: flatpakRemove,
  },
  {
    id: 'fedora',
    name: 'Fedora',
    for: 'Fedora 40 and newer',
    method: 'Flatpak',
    file: 'flatpak',
    also: 'appimage',
    note: `Fedora has Flatpak already. ${flatpakNote}`,
    steps: [
      { title: 'Flathub, where Glance’s runtime comes from', code: FLATHUB },
      { title: 'Download and install Glance', code: `curl -LO ${files.flatpak.url}\nflatpak install --user -y ./${files.flatpak.name}` },
    ],
    run: flatpakRun,
    remove: flatpakRemove,
  },
  {
    id: 'opensuse',
    name: 'openSUSE',
    for: 'Tumbleweed, Leap 16',
    method: 'Flatpak',
    file: 'flatpak',
    also: 'appimage',
    note: flatpakNote,
    steps: [
      { title: 'Flatpak itself', code: 'sudo zypper install -y flatpak' },
      { title: 'Flathub, where Glance’s runtime comes from', code: FLATHUB },
      { title: 'Download and install Glance', code: `curl -LO ${files.flatpak.url}\nflatpak install --user -y ./${files.flatpak.name}` },
    ],
    run: flatpakRun,
    remove: flatpakRemove,
  },
  {
    id: 'arch',
    name: 'Arch',
    for: 'Arch, Manjaro, EndeavourOS, Garuda, CachyOS',
    method: 'Arch package',
    file: 'arch',
    also: 'other',
    note: 'A native package, installed with pacman, which also installs everything it needs. It is called glance-image-viewer because Arch already has an unrelated “glance”; the two cannot be installed together.',
    steps: [
      { title: 'Download the package', code: `curl -LO ${files.arch.url}` },
      { title: 'Install it', code: `sudo pacman -U ./${files.arch.name}` },
    ],
    after: 'Download it first, as above, rather than giving pacman the web address: from a web address pacman also looks for a signature file beside the package, and stops when there is none.',
    run: 'glance',
    remove: 'sudo pacman -R glance-image-viewer',
  },
  {
    id: 'other',
    name: 'Any other',
    for: 'Every other distribution',
    method: 'Flatpak',
    file: 'flatpak',
    also: 'appimage',
    note: `Install Flatpak with your distribution’s package manager first — the Flatpak setup page has the command for each one. ${flatpakNote}`,
    link: { label: 'Flatpak setup page', url: 'https://flatpak.org/setup/' },
    steps: [
      { title: 'Flathub, where Glance’s runtime comes from', code: FLATHUB },
      { title: 'Download and install Glance', code: `curl -LO ${files.flatpak.url}\nflatpak install --user -y ./${files.flatpak.name}` },
    ],
    run: flatpakRun,
    remove: flatpakRemove,
  },
  {
    id: 'appimage',
    name: 'AppImage',
    for: 'Any distribution from 2024 on',
    method: 'AppImage',
    file: 'appimage',
    note: 'One file, nothing to install: Ubuntu 24.04 or newer, Linux Mint 22+, Debian 13, Fedora 40+, openSUSE Tumbleweed, Arch and others as new. It does not run on older systems such as Ubuntu 22.04 or Debian 12 — use the Flatpak there.',
    steps: [
      { title: 'Download it into a folder of its own', code: `mkdir -p ~/Applications\ncd ~/Applications\ncurl -LO ${files.appimage.url}` },
      { title: 'Make it runnable', code: `chmod +x ${files.appimage.name}` },
    ],
    trouble: {
      title: 'If it says no fusermount was found',
      text: 'An AppImage mounts itself with FUSE, which almost every desktop already has. If yours does not, install it once:',
      blocks: {
        'Ubuntu, Linux Mint, Debian': 'sudo apt install -y fuse3',
        Fedora: 'sudo dnf install -y fuse3',
        openSUSE: 'sudo zypper install -y fuse3',
        Arch: 'sudo pacman -S fuse3',
      },
      or: { text: 'Or start it without FUSE, which unpacks it to a temporary folder first:', code: `./${files.appimage.name} --appimage-extract-and-run` },
    },
    after: 'An AppImage does not add itself to the applications menu. To have it there, and to open pictures with it from the file manager, use Gear Lever or AppImageLauncher.',
    links: [
      { label: 'Gear Lever', url: 'https://flathub.org/apps/it.mijorus.gearlever' },
      { label: 'AppImageLauncher', url: 'https://github.com/TheAssassin/AppImageLauncher' },
    ],
    run: `~/Applications/${files.appimage.name}`,
    remove: `rm ~/Applications/${files.appimage.name}`,
  },
  {
    id: 'source',
    name: 'From source',
    for: 'Build it yourself, a few minutes',
    method: 'Build',
    file: 'source',
    note: 'Natively needs GTK 4.14 and libadwaita 1.5 or newer — the versions in Ubuntu 24.04 — plus libheif, Poppler’s GLib library and qpdf for PDFs, libsoup 3, Rust 1.92 or newer, make and a C compiler. Drawing on PDFs needs Poppler 25.06.',
    steps: [
      {
        title: 'Install what it builds against',
        blocks: {
          Arch: 'sudo pacman -S gtk4 libadwaita libheif poppler-glib qpdf libsoup3 glib2 rust make',
          Fedora: 'sudo dnf install gtk4-devel libadwaita-devel libheif-devel poppler-glib-devel qpdf-devel libsoup3-devel glib2-devel cargo make',
          'Debian, Ubuntu': 'sudo apt install libgtk-4-dev libadwaita-1-dev libheif-dev libpoppler-glib-dev libqpdf-dev libsoup-3.0-dev libglib2.0-dev cargo make',
        },
      },
      { title: 'Get the source', code: `git clone ${repo}.git\ncd glance` },
      { title: 'Build and install', hint: 'the first build takes a few minutes', code: 'make                       # cargo build --release\nsudo make install          # into /usr/local' },
    ],
    after: 'Use sudo make install PREFIX=/usr if you would rather it went where your package manager puts things. Glance is then in your launcher and in “Open With” for pictures and PDFs.',
    flatpakBuild: {
      title: 'Or build the Flatpak yourself',
      text: 'Works anywhere, because GTK, libadwaita and libheif come from the GNOME runtime instead of from your system. The runtime is about a gigabyte.',
      blocks: {
        Arch: 'sudo pacman -S flatpak flatpak-builder',
        Fedora: 'sudo dnf install flatpak flatpak-builder',
        'Debian, Ubuntu': 'sudo apt install flatpak flatpak-builder',
      },
      runtime: `flatpak remote-add --if-not-exists --user \\\n    flathub https://dl.flathub.org/repo/flathub.flatpakrepo\nflatpak install --user flathub \\\n    org.gnome.Platform//49 \\\n    org.gnome.Sdk//49 \\\n    org.freedesktop.Sdk.Extension.rust-stable//25.08`,
      build: `git clone ${repo}.git\ncd glance\nflatpak-builder --user --install --force-clean build-dir \\\n    build-aux/${APP_ID}.yaml`,
      run: `flatpak run ${APP_ID} path/to/image.jpg`,
    },
    run: 'glance path/to/image.jpg',
    remove: 'sudo make uninstall',
  },
];

// Which channel the home page shows: the one that works on any distribution.
export const featuredChannel = () => channels.find((c) => c.id === 'other');

/** Best guess at the visitor's distribution, from what the browser admits to (rarely much). */
export function guessChannel() {
  const ua = navigator.userAgent || '';
  if (!/Linux/i.test(ua) || /Android/i.test(ua)) return null;
  if (/Ubuntu/i.test(ua)) return 'ubuntu';
  if (/Debian/i.test(ua)) return 'debian';
  if (/Fedora/i.test(ua)) return 'fedora';
  return null;
}

export const isLinux = () => /Linux/i.test(navigator.userAgent) && !/Android/i.test(navigator.userAgent);

export const checkSums = `curl -LO ${files.sums.url}\nsha256sum -c --ignore-missing SHA256SUMS`;
