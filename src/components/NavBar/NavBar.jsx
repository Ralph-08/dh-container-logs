import { useState } from "react";
import "./NavBar.scss";
import { NavLink } from "react-router-dom";

const NavBar = () => {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      <section className="nav">
        <button className="nav__button" onClick={() => setShowNav(true)}>
          Menu
        </button>
      </section>
      {showNav && (
        <section className="nav__menu nav__menu--in">
          <h3 className="nav__menu-button" onClick={() => setShowNav(false)}>
            Close
          </h3>
          <ul className="nav__list">
            <li className="nav__item">
              <NavLink className="nav__link" to="/track">
                Live Tracking
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink className="nav__link" to="/">
                Logs
              </NavLink>
            </li>
          </ul>
        </section>
      )}
    </>
  );
};

export default NavBar;
