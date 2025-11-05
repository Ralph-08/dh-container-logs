import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./NavBar.scss";

// Hamburger SVG Icon
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

// Close SVG Icon
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const NavBar = () => {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      <section className="nav">
        {/* Replaced 'Menu' text with an icon */}
        <button 
            className="nav__button" 
            aria-label="Toggle navigation menu" 
            onClick={() => setShowNav(true)}
        >
            <MenuIcon />
        </button>
      </section>
      
      {/* 💡 NEW: Backdrop overlay for closing the menu */}
      {showNav && (
          <div 
              className="nav__backdrop nav__backdrop--in" 
              onClick={() => setShowNav(false)}
              aria-hidden="true"
          ></div>
      )}

      {showNav && (
        // Added 'nav__menu--in' class for the slide-in animation
        <section className="nav__menu nav__menu--in">
          <button 
              className="nav__menu-close-button" 
              onClick={() => setShowNav(false)}
              aria-label="Close navigation menu"
          >
            <XIcon />
          </button>
          <ul className="nav__list">
            <li className="nav__item">
              <NavLink className="nav__link" to="/" onClick={() => setShowNav(false)}>
                Logs
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink className="nav__link" to="/track" onClick={() => setShowNav(false)}>
                Live Tracking
              </NavLink>
            </li>
          </ul>
        </section>
      )}
    </>
  );
};

export default NavBar;