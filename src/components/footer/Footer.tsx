import React from "react"
import styled from "styled-components"
import { Link, useStaticQuery, graphql } from "gatsby"

import FooterLogo from "./FooterLogo"

const FooterHolder = styled.footer`
  position: sticky;
  height: 30vh;
  background-color: #212121;
  bottom: 0px;
  display: flex;
  padding-left: 70px;
`

const LinksHolder = styled.div`
`

const Footer = ({ menuLinks }) => (
  <FooterHolder>
      <FooterLogo />
      <LinksHolder>
      </LinksHolder>
  </FooterHolder>
)

export default Footer