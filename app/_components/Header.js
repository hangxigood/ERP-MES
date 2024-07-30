import React from 'react';

const Header = () => {
  return (
    <header className="flex gap-5 justify-between px-16 py-8 w-full text-2xl font-bold text-white bg-neutral-700 max-md:flex-wrap max-md:px-5 max-md:max-w-full">
      <div className="my-auto">HEADER</div>
      <div className="my-auto">BATCH RECORD SYSTEM</div>
    </header>
  );
};

export default Header;