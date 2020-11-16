import React from "react";
import styled from "styled-components";
import { Link } from "gatsby";

const NavItem = styled(Link)<{ color: string }>`
  font-size: 18px;
  font-weight: 800;
  color: ${props => props.color};
  transition: all 0.3s ease 0s;
  text-decoration: none;
  margin-left: 2.5rem;
  text-transform: uppercase;

  :hover {
    color: #ddd;
  }

  @media (max-width: 1100px) {
    color: #111;
    padding: 20px 0;
    font-size: 1.5rem;
    z-index: 6;
  }
`

const NavbarLinks = ({ menuLinks, useDark }) => {
  return (
    <>
      {menuLinks.map((link: { name: string; slug: string }) => (
        <NavItem key={link.name} color={ useDark ? "#0F0F11" : "#f7f7ff" } to={link.slug}>{link.name}</NavItem>
      ))}
    </>
  )
}

export default NavbarLinks
