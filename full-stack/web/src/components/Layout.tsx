import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Header } from './Header';
import { Nav } from './Nav';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';
import { SearchModal } from './SearchModal';

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
