// TODO: Implement MainLayout wrapper with Header, Sidebar, Footer
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  // TODO: Layout structure with sidebar and content area
  return (
    <div>
      <Header />
      <div>
        <Sidebar />
        <main>
          {/* TODO: Build layout structure */}
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
