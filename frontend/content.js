const GetTitle = document.getElementById("GetTitle");

function loadScript(url, id) {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.id = id;
        script.src = url;
        script.crossOrigin = 'anonymous';
        script.onload = resolve;
        script.onerror = (e) => reject(new Error(`Script load error for ${url}`));
        document.head.appendChild(script);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Hide content initially
        document.body.classList.remove('js-loaded');

        // Load GSAP and plugins
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js', 'gsap-core');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js', 'gsap-scrolltrigger');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollSmoother.min.js', 'gsap-scrollsmoother');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrambleTextPlugin.min.js', 'gsap-scrambletext');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js', 'gsap-splittext');

        if (window.gsap) {
            gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrambleTextPlugin, SplitText);
            createLandingPage();
            // Import Cursor
            const { initCursor } = await import('./cursor.js');
            initCursor();

            // Show content when everything is ready
            setTimeout(() => {
                document.body.classList.add('js-loaded');
                initScrollSmoother();
            }, 100);
        }
    } catch (error) {
        console.error('Failed to load GSAP:', error.message);
        createLandingPage();
    }
});

const titleEssentialApp = () => {
    return `
        <img src="./EssentialappLogo.svg" rel="Logo image">
    `;
}

const ContentData = {
    Title: {
        PageTitle: "Essential App — All-in-one Utility Toolkit",
        Name: "Essential app"
    },
    Heading: {
        HeadingIntroduce: {
            HeadersIntroduceContent1: "Essential app, made for you",
            HeadersIntroduceContent2: "All-in-one, built to help."
        },
        HeadingExplain: {
            HeadersExplainContent1: "All-in-one utility application that make you life",
            HeadersExplainContent2: "And you work better combining the core tools you need into one compact.",
        },
        PrivateMintIntroduce: 'From Mint teams'
    },
    Featured: {
        FeatureName: "Featured",
        FrameFeaContent: {
            FrameCon1: ""
        }
    }
};

GetTitle.title = ContentData.Title.Name;

if (GetTitle) {
    if ('title' in GetTitle) {
        GetTitle.title = ContentData.Title.Name;
    } else {
        document.title = ContentData.Title.Name;
    }
}

const navigation = [
    { name: "Featured", href: "#features" },
    { name: "How it works", href: "#how-it-works" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" }
];

const DownloadEssentialApp = {
    href: "#EssentialDownload"
}

/* 
    font-family: "Inter Tight", sans-serif;
    font-family: "Manrope", sans-serif;
    font-family: "Merriweather", serif; 
    font-family: "Trirong", serif;
    font-family: "Anuphan", sans-serif;
*/

const ButtonsTheme = {
    default: {
        background: '#f0eee6',
        backgroundHover: '#1a1a19',
        text: '#000000',
        textInvert: 'var(--PrimaryNavbarBackgroundColor)',
        ButtonsLebal: {
            background: '#000000',
            text: '#FFFFFF'
        }
    }
};

const PublicVariable = () => {
    const configHeadtag = () => {
        return `<title>${ContentData.Title.PageTitle}</title>`;
    };

    const createStyles = () => {
        return `
        <style>
            /* Loading state styling */
            body:not(.js-loaded) {
                background-color: #000000;
            }
            
            body:not(.js-loaded) .smooth-wrapper,
            body:not(.js-loaded) nav {
                opacity: 0;
                visibility: hidden;
            }
            
            body.js-loaded {
                background-color: var(--PrimaryBackgroundcolor);
            }

            body.js-loaded .smooth-wrapper,
                opacity: 1;
                visibility: visible;
                transition: opacity 0.5s ease-out;
            }

            ::selection {
                background-color: #e5f4ff;
            }

            /* Scrollbar Styling */
            ::-webkit-scrollbar {
                width: 5px;
            }
            
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            
            ::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 100vmax;
                border: 3px solid var(--PrimaryBackgroundcolor);
            }

            ::-webkit-scrollbar-thumb:hover {
                background-color: rgba(0, 0, 0, 0.3);
            }

            :root {
                --PrimaryBackgroundcolor: #faf9f5;
                --PrimaryNavbarBackgroundColor: #ffffff;
                --PrimaryFullyContractColor: #ffffff;
                --PublicBorder: solid 1px #e6e6e6;
                --PublicDarkBorder: solid 1px #d4d4d4;
                --NavbarMaskDepth: 140px;
                --RoundedConners: 100vmax;
                --RoundedSurfaceConners: 30px;
                --ElementMaxWidth: 1200px;
                
                /* Buttons Theme */
                --PrimaryButtonsColors: ${ButtonsTheme.default.background};
                --PrimaryButtonsColorsHover: ${ButtonsTheme.default.backgroundHover};
                --PrimaryButtonsColorText: ${ButtonsTheme.default.text};
                --PrimaryInvertButtonsColorText: ${ButtonsTheme.default.textInvert};

                --PrivateMintLebal: ${ButtonsTheme.default.ButtonsLebal.background};
                --PrivateMintLebalTextColor: ${ButtonsTheme.default.ButtonsLebal.text};
                --PrivateMintHeaderHighlightColor: #96b0c096;
                --PrivateFeaturedBorder: solid 1px #C1C1C1;

                /* Text & Logo colors */
                --PrimaryTextColor: #050505;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Inter Tight', 'Anuphan', sans-serif;
                transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1) all;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                scrollbar-width: thin;
                scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
            }

            body.js-loaded * {
                cursor: none;
            }

            body {
                background-color: var(--PrimaryBackgroundcolor);
            }
        </style>
        `;
    };

    return `
        ${configHeadtag()}
        ${createStyles()}
    `;
};

const stylePageProperties = () => {
    return `
    <style>
            ${StylePageNavbar()}

            .smooth-wrapper {
                overflow: hidden;
                position: relative;
            }

            .smooth-content {
                min-height: 100vh;
                padding-top: var(--NavbarMaskDepth);
            }
    </style>
    `
}

const StylePageNavbar = () => {
    return `
            nav {
                position: fixed;
                width: 100%;
                height: var(--NavbarMaskDepth);
                background-color: var(--PrimaryBackgroundcolor);
                top: 0;
                left: 0;
                z-index: 1000;
                -webkit-mask-image: linear-gradient(
                    to bottom,
                    black 60%,
                    rgba(0, 0, 0, 0.5) 80%,
                    transparent 100%
                );
                mask-image: linear-gradient(
                    to bottom,
                    black 60%,
                    rgba(0, 0, 0, 0.5) 80%,
                    transparent 100%
                );
            }

            .Title {
                display: flex;
                align-items: center;
                color: var(--LogoColor);
            }

            .Title img {
                width: 32px;
                height: 32px;
                display: block;
            }

            .Title svg path,
            .Title svg g {
                fill: currentColor;
                color: var(--PrimaryTextColor);
            }

            .Title svg g {
                transform-origin: center;
                transform: scale(0.98);
            }

            .navbarContent {
                max-width: 100%;
                margin: 0rem 1rem !important;
                margin: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: calc(var(--NavbarMaskDepth) - 60px);
                position: relative;
            }

            .Title h1 {
                font-weight: 600;
            }

            .Navigation {
                display: flex;
                align-items: center;
                border-radius: var(--RoundedConners);
                padding: 0rem 0.15rem;
                border: var(--PublicBorder);
                background-color: var(--PrimaryButtonsColors);
                position: fixed;
                left: 50%;
                transform: translateX(-50%);
            }

            .Navigation li {
                list-style: none;
                padding: 0rem 1rem;
            }

            .Navigation a {
                color: var(--PrimaryButtonsColorText);
                text-decoration: none;
                font-size: 16px;
                line-height: 42.5px;
                height: 42.5px;
                display: block;
                border-bottom: solid 2px transparent;
            }

            .Navigation a:hover {
                border-bottom: solid 2px #000;
            }

            #CTA_Navbar {
                padding: 0.7rem 1.35rem;
                background-color: var(--PrimaryButtonsColors);
                border-radius: var(--RoundedConners);
                border: var(--PublicBorder);
                color: var(--PrimaryButtonsColorText);
                text-decoration: none;
            }

            #CTA_Navbar:hover {
                background-color: var(--PrimaryButtonsColorsHover);
                color: var(--PrimaryInvertButtonsColorText);
            }
        `
}

const createCursor = () => {
    return `
        <style>
            body .cursor {
                pointer-events: none;
            }
            body .cursor__ball {
                position: absolute;
                top: 0;
                left: 0;
                mix-blend-mode: difference;
                z-index: 1001;
            }
            body .cursor__ball circle {
                fill: #f7f8fa;
            }
        </style>

        <div class="cursor">
            <div class="cursor__ball cursor__ball--big ">
                <svg height="30" width="30">
                <circle cx="15" cy="15" r="12" stroke-width="0"></circle>
                </svg>
            </div>
            
            <div class="cursor__ball cursor__ball--small">
                <svg height="10" width="10">
                <circle cx="5" cy="5" r="4" stroke-width="0"></circle>
                </svg>
            </div>
        </div>
    `
}

const createNavigation = () => {
    return `
        <nav>
            <div class="navbarContent">
                <div class="Title">
                    ${titleEssentialApp()}
                </div>
                <ul class="Navigation">
                    ${navigation.map(item => `
                        <li><a href="${item.href}">${item.name}</a></li>
                    `).join('')}
                </ul>
                <a href="${DownloadEssentialApp.href}" id="CTA_Navbar" class="hoverable">Download ${ContentData.Title.Name}</a>
            </div>
        </nav>
    `;
};

const createHeader = () => {
    return `
        <style>
            .HeaderWrapper {
                position: relative;
                border-bottom: var(--PublicDarkBorder);
            }

            header {
                width: 100%;
                height: calc(var(--NavbarMaskDepth) - 100vh);
                min-height: 1080px;
            }

            .HeaderText {
                text-align: center;
                margin-top: 6rem;
            }

            #PrivateHeaderTextHighLight {
                position: absolute;
                width: 0px;
                height: 30px;
                background-color: var(--PrivateMintHeaderHighlightColor);
                left: 48.75%;
                top: 220px;
                z-index: 2;
                opacity: 0;
            }

            .MINT_HeaderText {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.7rem 1.25rem;
                background-color: var(--PrivateMintLebal);
                width: fit-content;
                margin: auto;
                border-radius: var(--RoundedConners);
                margin-bottom: 2.25rem;
                /* Transition */
                transform: translateY(20px);
                filter: blur(5px);
            }

            .MINT_HeaderText img {
                height: auto;
                width: 20px;
                margin-right: 0.5rem;
            }

            .HeaderText span {
                color: var(--PrivateMintLebalTextColor);
                font-size: 18px;
            }

            .HeaderText h1 {
                font-size: 62px;
                font-family: "Manrope", sans-serif;
                font-weight: 780;
                letter-spacing: -2.5px;
                line-height: 1.5;
                z-index: 3;
                position: relative;
            }

            .HeaderText p {
                margin: 1.5rem 0rem;
                margin-bottom: 5rem;
                font-size: 20px;
                line-height: 1.6;
            }

            .HeaderImage img {
                width: 1200px;
                height: auto;
                display: block;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: 0;
            }
        </style>
        <div class="HeaderWrapper">
            <header>
                <div class="HeaderContent">
                    <div class="HeaderText">
                        <div class="MINT_HeaderText" id="MINT_HeaderText">
                            <img src="./MintTeamsLogoSVG.svg" rel="Mint teams logo introduce">
                            <span>${ContentData.Heading.PrivateMintIntroduce}</span>
                        </div>
                        <h1 id="HeaderTextContent1">${ContentData.Heading.HeadingIntroduce.HeadersIntroduceContent1}</h1>
                        <h1 id="HeaderTextContent2">${ContentData.Heading.HeadingIntroduce.HeadersIntroduceContent2}</h1>
                        <br>
                        <p id="HeaderExplainContent">
                            ${ContentData.Heading.HeadingExplain.HeadersExplainContent1} <br>
                            ${ContentData.Heading.HeadingExplain.HeadersExplainContent2}
                        </p>
                        <div id="PrivateHeaderTextHighLight"></div>
                    </div>
                </div>
            </header>
            <div class="HeaderImage">
                <img src="./EssentialAppPresent.png" rel="Essential app interface">
            </div>
        </div>
    `
}

const createFeaturedSection = () => {
    return `
        <style>
            .Featured {
                width: 100%;
                height: 800px;
                background-color: var(--PrimaryFullyContractColor);'
            }

            .FeaturedContent {
                max-width: var(--ElementMaxWidth);
                margin: auto;
            }

            .FeaturedText {
                padding-top: 5rem;
            }

            .FeaturedText h1 {
                margin-bottom: 1.5rem;
                font-size: 42px;
            }

            .FeaturedWrapperBOX {
                display: flex;
                gap: 20px;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                -webkit-overflow-scrolling: touch;
                padding: 20px;
                scroll-behavior: smooth;
            }

            .FeaturedContentBox {
                flex: 0 0 auto;
                width: 800px;
                height: 500px;
                border: var(--PrivateFeaturedBorder);
                border-radius: var(--RoundedSurfaceConners);
                scroll-snap-align: start;
                position: relative;
            }

            .FrameIntroduce {
                width: fit-content;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%,-50%);
            }

            @media (max-width: 768px) {
                .FeaturedContentBox {
                    width: 90%;
                }
                .FeaturedText,
                .FeaturedWrapperBOX {
                    padding-left: 10px;
                }
            }
        </style>
        <section class="Featured">
            <div class="FeaturedContent">
                <div class="FeaturedText">
                    <h1>${ContentData.Featured.FeatureName}</h1>
                </div>
                <div class="FeaturedWrapperBOX">
                    <div class="FeaturedContentBox">
                        <div class="FrameIntroduce">
                            <iframe src="./IntroduceContent/VideoInject1.html" name="EssentialIntroducevideo1" style="pointer-events: none" scrolling="no" frameborder="0" marginheight="0px" marginwidth="0px" width="777.6px" height="477.6px" allowfullscreen></iframe>
                        </div>
                    </div>
                    <div class="FeaturedContentBox">
                    <!-- Content ของ box 2 -->
                    </div>
                    <div class="FeaturedContentBox">
                    <!-- Content ของ box 3 -->
                    </div>
                    <div class="FeaturedContentBox">
                    <!-- Content ของ box 4 -->
                    </div>
                </div>
            </div>
        </section>
    `
}

function createLandingPage() {
    if (typeof gsap === 'undefined') {
        console.error('GSAP is not loaded');
        return;
    }

    document.documentElement.innerHTML = `
        <head>
            ${PublicVariable()}
            ${stylePageProperties()}
            ${createCursor()}
        </head>
        <body>
            ${createNavigation()}
            <div class="smooth-wrapper">
                <div class="smooth-content">
                    ${createHeader()}
                    ${createFeaturedSection()}
                </div>
            </div>
        </body>
    `;

    const head = document.head;

    const preconnectGoogle = document.createElement('link');
    preconnectGoogle.rel = 'preconnect';
    preconnectGoogle.href = 'https://fonts.googleapis.com';
    head.appendChild(preconnectGoogle);

    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.crossOrigin = 'anonymous';
    head.appendChild(preconnectGstatic);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Anuphan:wght@100..700&family=Inter+Tight:ital,wght@0,100..900;1,100..900&family=Manrope:wght@200..800&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Trirong:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    head.appendChild(fontLink);

    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        const headerText1 = document.getElementById('HeaderTextContent1');
        const headerText2 = document.getElementById('HeaderTextContent2');
        const HeaderExplainContent = document.getElementById('HeaderExplainContent');
        const HeaderExplainContentsplit = new SplitText("#HeaderExplainContent", { type: "lines" });

        headerText2.style.visibility = "hidden";
        MINT_HeaderText.style.visibility = "hidden";
        HeaderExplainContent.style.visibility = "hidden";
        gsap.set(HeaderExplainContentsplit.lines, { visibility: "hidden", y: "50%" });

        if (headerText1 && headerText2) {
            // Set initial state
            gsap.set(headerText2, { visibility: 'hidden' });
            gsap.set('#PrivateHeaderTextHighLight', {
                opacity: 0,
                width: 0
            });

            var Texts = gsap.timeline({ defaults: { duration: 0, ease: "none" } });

            Texts.to(headerText1, {
                duration: 1.5,
                scrambleText: {
                    text: headerText1.innerHTML,
                    chars: "lowerCase",
                    revealDelay: 0.5,
                    tweenLength: false
                }
            })
                .to(headerText2, {
                    duration: 1.5,
                    visibility: 'visible',
                    scrambleText: {
                        text: headerText2.innerHTML,
                        chars: "lowerCase",
                        revealDelay: 0.5,
                        tweenLength: false
                    }
                })
                .to('#PrivateHeaderTextHighLight', {
                    opacity: 1,
                    duration: 0.3
                })
                .to('#PrivateHeaderTextHighLight', {
                    width: 360,
                    duration: 0.8,
                    ease: "power1.out"
                })
                .to('#MINT_HeaderText', {
                    filter: "blur(0px)",
                    y: 0,
                    visibility: 'visible',
                    duration: 0.8,
                    ease: "back.out(1.4)"
                });
        }

        setTimeout(() => {
            gsap.to(HeaderExplainContentsplit.lines, {
                visibility: "visible",
                y: "0%",
                duration: 2,
                ease: "back.out(0.7)",
                stagger: 0.1
            });
        }, 4500);

    }
}

function initScrollSmoother() {
    if (!window.ScrollSmoother) {
        console.warn('ScrollSmoother not available - falling back to normal scroll');
        return;
    }

    try {
        ScrollSmoother.create({
            wrapper: '.smooth-wrapper',
            content: '.smooth-content',
            smooth: 0.7,
            effects: true,
            normalizeScroll: true,
            ignoreMobileResize: true
        });

    } catch (error) {
        console.error('Error initializing ScrollSmoother:', error);
    }
}