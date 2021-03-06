import { graphql } from "gatsby";
import React, { useEffect, useRef, useState } from "react";
import Footer from "../components/footer/Footer";
import { DefaultLayout } from "../components/layouts"
import Navbar from "../components/navbar/Navbar";
import Img, { FluidObject } from "gatsby-image"
import Hero from "../components/hero";
import Container from "../components/container";
import styled from "styled-components";
import SEO from "../components/seo";

import * as Pause from "../assets/pause.svg";
import * as Play from "../assets/play.svg";

interface IChildImageSharp {
    childImageSharp: {
        fluid: FluidObject,
    }
}

interface Edges<T> {
    edges: T[]
}

interface Node<T> {
    nodes: T[],
    totalCount?: number,
}

interface IPodcast {
    enclosure: {
        length: number,
        type: string,
        url: string,
    },
    isoDate: string,
    link: string,
    pubDate: string,
    title: string,
    guid: string,
    dc: {
        creator: string,
    },
    creator: string,
    contentSnippet: string,
    content: string,
    itunes: {
        duration: string,
        episode: string,
        explicit: string,
        image: string,
        season: string,
        summary: string,
    }
}

interface IProps {
    data: {
        site: {
            siteMetadata: {
                title: string,
                menuLinks: {
                    name: string,
                    slug: string,
                    footer: boolean,
                }[]
            }
        },
        header: IChildImageSharp,
        allFeedHackademicsPodcast: Node<IPodcast>,
        pagesJson: {
            title: string,
            description: string,
        }
    }
}

interface IPlayer {
    link: string,
}

const PodcastSection = styled.div`

`;

const GridContainer = styled.div`

`;

// const Player = ({ link }: IPlayer) => (

// )

interface ILink {
    url: string,
    text: string,
}

interface IAudio {
    src: string,
    seek: number,
    children: React.ReactNode,
}

const Time = ({ seconds }: { seconds: number }) => {
    let min: any = Math.floor(seconds / 60);
    let sec: any = Math.floor(seconds - min * 60);

    if (min < 10) { min = `0${min}` }
    if (sec < 10) { sec = `0${sec}` }
    return <span>{`${min}:${sec}`}</span>;
}

const AudioContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const AudioButton = styled.div`
    border-radius: 90px;
    height: 4rem;
    width: 4rem;
    margin: 1rem;
    background-color: ${props => props.theme.palette.uncommon.brightBlack};
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SeekContainer = styled.div`
    width: 100%;
    padding: 0rem 2rem;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
`;

const ProgressBar = styled.progress`
    width: 100%;
    padding: 0rem 1rem;
    box-sizing: border-box;
    appearance: none;
    cursor: pointer;

    &::-webkit-progress-bar {
        background-color: #eee;
        border-radius: 2px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
    }
`;

const PodcastDetails = styled.div`
    display: flex;
    /* flex-direction: column; */
    padding: 1rem; 
`;

const Audio = ({ src, seek, children }: IAudio) => {
    let [playing, setPlaying] = useState(false);
    let [loading, setLoading] = useState(true);
    let [currentTime, setCurrentTime] = useState(seek);
    let [length, setLength] = useState(0);
    let audio = useRef(null);

    useEffect(() => {
        let a: HTMLAudioElement = audio.current;
        if (playing) {
            a.play();
        } else {
            a.pause();
        }
    }, [audio, playing]);

    useEffect(() => {
        if (audio !== null) {
            audio.current.currentTime = seek;
        }
    }, [audio, seek]);

    const updateTime = (event: React.SyntheticEvent<HTMLAudioElement, Event>) => {
        setCurrentTime(event.currentTarget.currentTime);
    }

    const onReady = (event: React.SyntheticEvent<HTMLAudioElement, Event>) => {
        setLength(event.currentTarget.duration);
        setLoading(false);
    }

    const onSeek = (event: React.MouseEvent<HTMLProgressElement, MouseEvent>) => {
        let unit = length / event.currentTarget.clientWidth;
        let x = event.pageX - event.currentTarget.offsetLeft;
        let value = x * unit;
        if (audio !== null) {
            audio.current.currentTime = value;
        }
    }

    return <AudioContainer>
        <audio src={src} ref={audio} onTimeUpdate={updateTime} onLoadedMetadata={onReady} >Your browser does not support the <code>audio</code> element.</audio>
        {
            loading ? "Loading" :
                <>
                    <PodcastDetails>
                        <AudioButton onClick={() => setPlaying(!playing)}><img src={playing ? Pause : Play} /></AudioButton>
                        {children}
                    </PodcastDetails>
                    <SeekContainer>
                        <Time seconds={currentTime} />
                        <ProgressBar onClick={onSeek} value={currentTime} max={length} />
                        <Time seconds={length} />
                    </SeekContainer>
                </>
        }
    </AudioContainer >
}

const ContentContainer = styled.div`
    padding: 2rem;
    margin-left: 150px;

    @media (max-width: ${props => props.theme.breakpoints.tablet}) {
        margin-left: 0rem;
    }
`;

const ContentList = styled.ul`
    margin-left: 1rem; 
`;

const ContentParagraph = styled.p`
    margin: 1rem 0rem;
`;

const ExtraContent = styled.div`
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
        display: none;
    }
`;

const Content = ({ content, seekTo }: { content: string, seekTo: (time: number) => void }) => {
    let [state, setState] = useState(false);

    /**
     * 
     * Hi, so you are reading this and you don't know why this is here. I'd love
     * to give you some helpful context as too why. This data is grabbed from
     * anchors rss feed from the podcasts we've done.
     * 
     * We need to be able to decode the information stored in them, so we try
     * and parse the html content they return and OMG IS IT HARD.
     * 
     * Please just let me (Alec) deal with it. I'll come back and clean it up
     * after i get the final spec for the podcast player but for now, it's 12:23
     * On a tuesday night and i want to go to bed.
     * 
     * Message me if you hate this too <3
     */

    let timeTest = new RegExp(/^[0-9]*:[0-9][0-9] - /);
    let minuteRegex = new RegExp(/^[0-9]*/);
    let secondRegex = new RegExp(/:[0-9]{2}/);
    let showLinksTest = new RegExp(/(?:<p>)?<a (.+?)<\/a>(?:<\/p>)?/);
    let showUrlRegex = new RegExp(/^href="(.+?)"/);
    let showTextRegex = new RegExp(/^(?:<p>)?(?:<a )?href="(.+?)">(?:<strong>)?(.+?)(?:<\/strong>)?(?:<\/a>)?(?:<\/p>)?$/);
    let splitRegex;
    if (content.startsWith("<p><strong>")) {
        splitRegex = new RegExp(/<p><strong>(.+?)<\/strong><\/p>(\n|<br>)/);
    } else {
        splitRegex = new RegExp(/<p>(.+?)<\/p>(\n|<br>)/);
    }
    let b = content.split(splitRegex).filter(s => s.length !== 0).filter(s => s !== '\n').map((s, i) => {
        if (i === 0) {
            return { type: 'description', content: s };
        } else if (showLinksTest.test(s)) {
            let links = s.split(showLinksTest).filter(s => s.startsWith("href"));
            let meta = links.map(s => {
                let ex = showTextRegex.exec(s);
                console.log(ex);
                let text = ex.pop();
                let url = ex.pop();
                return { url, text }
            });
            return { type: 'links', content: s, meta };
        } else if (timeTest.test(s)) {
            let text = s.replace(timeTest, '');
            let minute = parseInt(minuteRegex.exec(s).pop());
            let second = parseInt(secondRegex.exec(s).pop().replace(':', ''));
            let timestamp = (minute * 60) + second;
            return { type: 'time', content: s, meta: { text, timestamp, minute, second } };
        } else {
            return { type: 'long', content: s };
        }
    }).reduce((acc, item) => {
        switch (item.type) {
            case 'description': if (!acc.description) { acc.description = ""; } acc.description = item.content; break;
            case 'links': if (!acc.links) { acc.links = []; } (item.meta as any[]).forEach(m => acc.links.push(m)); break;
            case 'time': if (!acc.time) { acc.time = []; } acc.time.push(item.meta); break;
            case 'long': if (!acc.long) { acc.long = ""; } acc.long += item.content; break;
        };
        return acc;
    }, { description: "", time: [], links: [], long: "" });
    return <ContentContainer>
        <ContentParagraph>{b.description}</ContentParagraph>
        <ExtraContent>
            {
                (!state) ? <a href="javascript:void(0);" rel="nofollow" onClick={() => setState(!state)}>Read More...</a> :
                    <>
                        <h2>Show Notes</h2>
                        <ContentList>
                            {b.links.map(l => <li key={l.url}><a href={l.url} rel="nofollow">{l.text.replace(/<\/?[^>]+(>|$)/g, "")}</a></li>)}
                        </ContentList>
                        <h2>Time Links</h2>
                        <ContentList>
                            {b.time.map(t => <li key={t.timestamp}><a href="javascript:;" onClick={() => seekTo(t.timestamp)}><Time seconds={t.timestamp} /></a> - {t.text.replace(/<\/?[^>]+(>|$)/g, "")}</li>)}
                        </ContentList>
                        <h2>Long Description</h2>
                        <p>{b.long.replace(/<\/?[^>]+(>|$)/g, "")}</p>
                        <a href="javascript:void(0);" rel="nofollow" onClick={() => setState(!state)}>Collapse...</a>
                    </>
            }
        </ExtraContent>
    </ContentContainer >
}

const PodcastImg = styled.img`
    width: 150px;
    height: 150px;

    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
        margin: auto;
    }
`;

const PodcastContainer = styled.div`
    width: 100%;
    box-sizing: border-box;
    padding: 1rem;
    border-radius: 15px;
    border: 1px solid black;
    display: flex;
    flex-direction: column;

    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
        padding: 0rem;
        border: none;
    }
`;

const PodcastPlayer = styled.div`
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column; 
    justify-content: space-between;
`;

const PodcastTitle = styled.h2`
    font-family: "Open Sans", sans-serif;
    font-weight: bold;
    padding-left: 1rem;

    @media (max-width: ${props => props.theme.breakpoints.tablet}) {
        font-size: 1.15em
    }
`;

const PodcastSubTitle = styled.h4`
    font-family: "Open Sans", sans-serif;
    font-weight: 300;
    padding-left: 1rem;

    @media (max-width: ${props => props.theme.breakpoints.tablet}) {
        font-size: 1em
    }
`;

const PodcastHeader = styled.div`
    display: flex;
    flex-direction: column;
`;

const Flex = styled.div`
    width: 100%;
    display: flex;

    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
        flex-direction: column;
    }
`;

const Podcast = ({ title, imageSrc, pubDate, enclosure, content }: any) => {
    let [seek, setSeek] = useState(0);
    let date = new Date(pubDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let postedDate = date.toLocaleDateString(undefined, options);
    return <PodcastContainer>
        <Flex>
            <PodcastImg src={imageSrc} />
            <PodcastPlayer>
                <Audio seek={seek} src={enclosure.url}>
                    <PodcastHeader>
                        <PodcastTitle>{title}</PodcastTitle>
                        <PodcastSubTitle>{postedDate}</PodcastSubTitle>
                    </PodcastHeader>
                </Audio>
            </PodcastPlayer>
        </Flex>
        <Content content={content} seekTo={(time) => setSeek(time)} />
    </PodcastContainer>
}

const SectionHeader = styled.h1` 
    font-family: "Open Sans", sans-serif;
    color: ${props => props.theme.palette.uncommon.lightBlack};
    letter-spacing: 1.8px;
    text-transform: uppercase;
    font-size: 2.25em;
    margin-bottom: 1rem;
    height: 75px;
    text-align: center;

`;

const Section = styled.section`
    margin: 6rem 0rem 8rem;
    width: 100%;
`;

const PodcastsContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    grid-row-gap: 4rem;
`;

const List = styled.ul`
    display: flex;
    flex-direction: row;
    justify-content: center;
    list-style-type: none;
`;

const Item = styled.li`
    padding: 1rem;
`;

const Link = styled.div` 
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
    align-items: center;
`;

const ImageLogo = styled.img`
    width: 64px;
    height: 64px;
`;

const PodcastPage = ({ data }: IProps) => {
    const { nodes } = data.allFeedHackademicsPodcast;
    const latest = nodes[0];
    let podcasts = nodes.slice(1, nodes.length);
    return (
        <DefaultLayout>
            <SEO title="Podcast" />
            <Navbar useDark={true} menuLinks={data.site.siteMetadata.menuLinks} />
            <Img fluid={data.header.childImageSharp.fluid} alt="header" />
            <Container>
                <Hero title={data.pagesJson.title} description={data.pagesJson.description} />
                <Section>
                    <SectionHeader>Listen to our podcast on your favorite platform</SectionHeader>
                    <List>
                        <Item>
                            <a target="_blank" rel="nofollow" href="https://open.spotify.com/show/7c5I7T5vKH4TanlNTVVTkB">
                                <Link>
                                    <ImageLogo src="/podcasts/spotify.png" alt="spotify logo" />
                                    <div>Spotify</div>
                                </Link>
                            </a>
                        </Item>
                        <Item>
                            <a target="_blank" rel="nofollow" href="https://podcasts.apple.com/ca/podcast/the-hackademics-podcast/id1536146311">
                                <Link>
                                    <ImageLogo src="/podcasts/apple.png" alt="apply podcasts logo" />
                                    <div>Apple Podcast</div>
                                </Link>
                            </a>
                        </Item>
                        <Item>
                            <a target="_blank" rel="nofollow" href="https://www.breaker.audio/the-hackademics-podcast">
                                <Link>
                                    <ImageLogo src="/podcasts/breaker.png" alt="breaker logo" />
                                    <div>Breaker</div>
                                </Link>
                            </a>
                        </Item>
                        <Item>
                            <a target="_blank" rel="nofollow" href="https://www.google.com/podcasts?feed=aHR0cHM6Ly9hbmNob3IuZm0vcy8zNWY4OTFjYy9wb2RjYXN0L3Jzcw==">
                                <Link>
                                    <ImageLogo src="/podcasts/google.png" alt="google podcast logo" />
                                    <div>Google Podcast</div>
                                </Link>
                            </a>
                        </Item>
                        <Item>
                            <a target="_blank" rel="nofollow" href="https://pca.st/ci46c18k">
                                <Link>
                                    <ImageLogo src="/podcasts/pocketcasts.png" alt="Pocket Cast logo" />
                                    <div>Pocket Cast</div>
                                </Link>
                            </a>
                        </Item>
                        <Item>
                            <a target="_blank" rel="nofollow" href="https://radiopublic.com/the-hackademics-podcast-WPKYdw">
                                <Link>
                                    <ImageLogo src="/podcasts/radiopublic.png" alt="Radio public logo" />
                                    <div>Radio Public</div>
                                </Link>
                            </a>
                        </Item>
                        <Item>
                            <a target="_blank" rel="nofollow" href="https://anchor.fm/hackademics">
                                <Link>
                                    <ImageLogo src="/podcasts/anchor.png" alt="Anchor logo" />
                                    <div>Anchor.fm</div>
                                </Link>
                            </a>
                        </Item>
                    </List>
                </Section>
                <Section>
                    <SectionHeader>Our Latest Podcast</SectionHeader>
                    <Podcast imageSrc={latest.itunes.image} title={latest.title} pubDate={latest.isoDate} enclosure={latest.enclosure} content={latest.content} />
                </Section>
                <Section>
                    <SectionHeader>Our Past Podcasts</SectionHeader>
                    <PodcastsContainer>
                        {podcasts.map(p => <Podcast key={p.guid} imageSrc={p.itunes.image} title={p.title} pubDate={p.isoDate} enclosure={p.enclosure} content={p.content} />)}
                    </PodcastsContainer>
                </Section>
            </Container>
            <Footer menuLinks={data.site.siteMetadata.menuLinks} />
        </DefaultLayout>
    )
}

export const query = graphql`
query PodcastPage {
    site {
      siteMetadata {
        title
        menuLinks {
          name
          slug
          footer
        }
      }
    }
    header: file(name: {eq: "Blue-Header"}, extension: {eq: "png"}) {
      childImageSharp {
        fluid(pngQuality: 100) {
          ...GatsbyImageSharpFluid
        }
      }
    }
    allFeedHackademicsPodcast(sort: {order: DESC, fields: isoDate}) {
      totalCount
      nodes {
        enclosure {
          length
          type
          url
        }
        isoDate
        link
        pubDate
        title
        guid
        dc {
          creator
        }
        creator
        contentSnippet
        content
        itunes {
          duration
          episode
          explicit
          image
          season
          summary
        }
      }
    }
    pagesJson {
      title
      description
    }
  }
`

export default PodcastPage;