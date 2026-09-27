// ─────────────────────────────────────────────────────────────────────────
//  Everything the site says about getting Glance lives in this file.
//
//  When you publish a release:
//    1. bump `version`
//    2. set `ready: true` on each channel that now works
//    3. fill in any file URLs (`file.url`) and sizes you uploaded
//  Channels with `ready: false` still show, marked "coming soon".
//  The first ready channel in `featured` becomes the big button on the home page.
// ─────────────────────────────────────────────────────────────────────────

export const version = '1.0.0';
export const repo = 'https://github.com/ABHILESH1412/glance';
export const releases = `${repo}/releases`;

export const requirements = 'Linux with GTK 4.14 and libadwaita 1.5 or newer — Ubuntu 24.04, Fedora 40, current Arch, or anything as recent. Flatpak works on any distribution.';

export const channels = [
  {
    id: 'flatpak',
    name: 'Flatpak',
    for: 'Any distribution',
    ready: false,
    note: 'Sandboxed, updates with the rest of your Flatpaks. GTK and libheif come from the GNOME runtime, not your system.',
    command: `flatpak install flathub io.github.abhilesh1412.Glance`,
    run: `flatpak run io.github.abhilesh1412.Glance`,
    remove: `flatpak uninstall io.github.abhilesh1412.Glance`,
    link: { label: 'Flathub page', url: 'https://flathub.org/apps/io.github.abhilesh1412.Glance' },
  },
  {
    id: 'arch',
    name: 'Arch Linux',
    for: 'Arch, EndeavourOS, Manjaro',
    ready: false,
    note: 'From the AUR. The package is glance-image-viewer, because “glance” there is a different program.',
    command: `yay -S glance-image-viewer`,
    remove: `sudo pacman -R glance-image-viewer`,
    // A prebuilt package pacman can install straight from a URL.
    file: {
      label: `glance-image-viewer-${version}-1-x86_64.pkg.tar.zst`,
      url: `${repo}/releases/download/v${version}/glance-image-viewer-${version}-1-x86_64.pkg.tar.zst`,
      size: '',
      install: `sudo pacman -U ${repo}/releases/download/v${version}/glance-image-viewer-${version}-1-x86_64.pkg.tar.zst`,
    },
  },
  {
    id: 'fedora',
    name: 'Fedora',
    for: 'Fedora 40 and newer',
    ready: false,
    note: 'From COPR until it reaches the Fedora archive.',
    command: `sudo dnf copr enable abhilesh1412/glance\nsudo dnf install glance`,
    remove: `sudo dnf remove glance`,
  },
  {
    id: 'debian',
    name: 'Debian & Ubuntu',
    for: 'Ubuntu 24.04+, Debian 13+',
    ready: false,
    note: 'A .deb for amd64. apt pulls in GTK, libadwaita and libheif for you.',
    file: {
      label: `glance-image-viewer_${version}-1_amd64.deb`,
      url: `${repo}/releases/download/v${version}/glance-image-viewer_${version}-1_amd64.deb`,
      size: '',
      install: `sudo apt install ./glance-image-viewer_${version}-1_amd64.deb`,
    },
    remove: `sudo apt remove glance-image-viewer`,
  },
  {
    id: 'source',
    name: 'From source',
    for: 'Any distribution, a few minutes',
    ready: true,
    note: 'Needs Rust, make, and the GTK 4, libadwaita, libheif and glib development packages.',
    deps: {
      Arch: 'sudo pacman -S gtk4 libadwaita libheif glib2 rust make',
      Fedora: 'sudo dnf install gtk4-devel libadwaita-devel libheif-devel glib2-devel cargo make',
      'Debian, Ubuntu': 'sudo apt install libgtk-4-dev libadwaita-1-dev libheif-dev libglib2.0-dev cargo make',
    },
    command: `git clone ${repo}.git\ncd glance\nmake                 # the first build takes a few minutes\nsudo make install    # into /usr/local`,
    remove: `sudo make uninstall`,
    // The same source as a tarball, once a release is tagged.
    file: {
      label: `glance-${version}.tar.gz`,
      url: `${repo}/archive/refs/tags/v${version}.tar.gz`,
      size: '',
      ready: false,
    },
  },
];

// Which channel gets the big button, in order of preference.
export const featured = ['flatpak', 'arch', 'source'];

export const featuredChannel = () =>
  featured.map((id) => channels.find((c) => c.id === id)).find((c) => c?.ready) || channels.find((c) => c.ready);

// Best guess at the visitor's distribution, from what the browser admits to.
export function guessChannel() {
  const ua = navigator.userAgent || '';
  if (!/Linux/i.test(ua) || /Android/i.test(ua)) return null;
  if (/Ubuntu|Debian/i.test(ua)) return 'debian';
  if (/Fedora/i.test(ua)) return 'fedora';
  return null;
}

export const isLinux = () => /Linux/i.test(navigator.userAgent) && !/Android/i.test(navigator.userAgent);
