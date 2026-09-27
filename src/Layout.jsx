import { Suspense } from 'solid-js';
import Header from './components/Header';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import './styles/chrome.css';

export default function Layout(props) {
  return (
    <>
      <a class="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Suspense>{props.children}</Suspense>
      </main>
      <Footer />
      <PageTransition />
    </>
  );
}
