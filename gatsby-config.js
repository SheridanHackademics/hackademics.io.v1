require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
})

module.exports = {
  siteMetadata: {
    title: `Hackademics`,
    description: `Homepage for the Sheridan Hackademics club`,
    menuLinks: [
      {
        name: "About",
        slug: "/about",
        footer: true,
      },
      {
        name: "Team",
        slug: "/team",
        footer: true,
      },
      {
        name: "Podcast",
        slug: "/podcast",
        footer: true,
      },
      {
        name: "Hackville",
        slug: "https://hackville.io",
        footer: true,
      },
      {
        name: "Contact",
        slug: "mailto:sheridanhackademics@gmail.com",
        footer: true,
      },
      // {
      //   name: "Sponsorship",
      //   slug: "/sponsor",
      //   footer: true,
      // },
    ]
  },
  plugins: [
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-json`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `lit3mu9wj9wq`,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/data/pages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        rule: {
          include: /data/
        }
      }
    },
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Hackademics Website`,
        short_name: `www.hackademics.club`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#EC4564`,
        display: `minimal-ui`,
        icon: `src/images/favicon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {},
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `open sans\:300,300i,400,400i,600,600i,700,700i,800,800i`,
        ],
      },
    },
    {
      resolve: `gatsby-source-rss-feed`,
      options: {
        url: `https://anchor.fm/s/35f891cc/podcast/rss`,
        name: `HackademicsPodcast`
      }
    }
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
