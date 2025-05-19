const GetTitle = document.getElementById("GetTitle");

// Language Env
let selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';

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
    document.documentElement.lang = selectedLanguage;

    // Set contentLoaded styling
    try {
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

            const { initCursor } = await import('./Control/cursor.js');
            initCursor();
            const { initDropdown } = await import('./Control/Dropdown.js');
            initDropdown();
            applyCustomButtonLogic();

            document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
            const initialActiveButton = document.querySelector(`.language-btn[data-lang="${selectedLanguage}"]`);
            if (initialActiveButton) initialActiveButton.classList.add('active');

            setTimeout(() => {
                document.body.classList.add('js-loaded');
                initScrollSmoother();
            }, 100);
        }
    } catch (error) {
        console.error('Failed to load GSAP or initialize page:', error.message);
        // Fallback rendering
        createLandingPage();
        applyCustomButtonLogic();
        // Attempt to load dropdown in fallback as well, though it might fail if createLandingPage didn't complete
        try {
            const { initDropdown } = await import('./Control/Dropdown.js');
            initDropdown();
        } catch (dropdownError) {
            console.warn("Could not initialize dropdown in fallback:", dropdownError);
        }
        document.documentElement.lang = selectedLanguage;
        document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('active'));
        const initialActiveButtonFallback = document.querySelector(`.language-btn[data-lang="${selectedLanguage}"]`);
        if (initialActiveButtonFallback) initialActiveButtonFallback.classList.add('active');
    }
});

const titleEssentialApp = () => {
    return `
        <img src="./EssentialappLogo.svg" rel="Logo image">
    `;
}

const ContentData = {
    en: {
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
            },
        },
        Navigation: {
            Featured: "Featured",
            HowItWorks: "How it works",
            About: "About",
            Contact: "Contact"
        },
        CTA: {
            Download: "Download",
            CTAicon: '<span class="material-symbols-outlined">density_medium</span>'
        },
        HighlightAnimationWidth: "360px"
    },
    th: {
        Title: {
            PageTitle: "Essential App — แอปพลิเคชันที่ทำให้งานของคุณง่ายขึ้น",
            Name: "Essential app"
        },
        Heading: {
            HeadingIntroduce: {
                HeadersIntroduceContent1: "Essential app ออกแบบมา",
                HeadersIntroduceContent2: "เพื่อตอบโจทย์ชีวิตคุณ"
            },
            HeadingExplain: {
                HeadersExplainContent1: "แอพที่ถูกสร้างมาเพื่อรวมแอพที่จำเป็นให้คุณได้ใช้แบบ All-in-one",
                HeadersExplainContent2: "และคุณจะทำงานได้ดีขึ้นด้วยการรวมเครื่องมือหลักที่คุณต้องการไว้ในหนึ่งเดียว",
            },
            PrivateMintIntroduce: 'จาก Mint teams'
        },
        Featured: {
            FeatureName: "คุณสมบัติ",
            FrameFeaContent: {
                FrameCon1: ""
            },
        },
        Navigation: {
            Featured: "คุณสมบัติ",
            HowItWorks: "มันทำงานอย่างไร",
            About: "เกี่ยวกับ",
            Contact: "ติดต่อ"
        },
        CTA: {
            Download: "ดาวน์โหลด",
            CTAicon: '<span class="material-symbols-outlined">density_medium</span>'
        },
        HighlightAnimationWidth: "432px"
    }
};

function applyCustomButtonLogic() {
    const navLinks = document.querySelectorAll('.Navigation a');
    const HeaderIntroduceTitle = document.querySelectorAll('.HeaderText h1');
    const HeaderTextHighLight = document.getElementById('PrivateHeaderTextHighLight');

    function configElements() {
        if (!navLinks.length) {
            return;
        }
        if (!HeaderIntroduceTitle.length) {
            return;
        }
    }

    configElements();

    function ClearProperty() {
        navLinks.forEach(link => {
            link.style.lineHeight = '';
        });
        HeaderIntroduceTitle.forEach(title => {
            title.style.fontFamily = '';
        })
    }

    ClearProperty();

    const currentLangData = ContentData[selectedLanguage];
    if (!currentLangData || !HeaderTextHighLight) {
        console.warn("applyCustomButtonLogic: Missing currentLangData or HeaderTextHighLight element.");
        return;
    }

    if (selectedLanguage === 'th') {
        HeaderIntroduceTitle.forEach(title => {
            title.style.fontFamily = '"Anuphan", sans-serif';
        });
        HeaderTextHighLight.style.left = "42.1%";
        gsap.to(HeaderTextHighLight, {
            width: currentLangData.HighlightAnimationWidth,
            duration: 0.3,
            ease: "power1.out"
        });
    } else if (selectedLanguage === 'en') {
        HeaderIntroduceTitle.forEach(title => {
            title.style.fontFamily = '"Manrope", sans-serif';
        });
        HeaderTextHighLight.style.left = "48.75%";
        gsap.to(HeaderTextHighLight, {
            width: currentLangData.HighlightAnimationWidth,
            duration: 0.3,
            ease: "power1.out"
        });
    }
}

let headerExplainSplit = null;

function setupHeaderExplainAnimation(isInitialLoad = false) {
    if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
        return;
    }

    const element = document.getElementById("HeaderExplainContent");
    if (!element) {
        return;
    }

    if (headerExplainSplit && typeof headerExplainSplit.revert === 'function') {
        headerExplainSplit.revert();
        headerExplainSplit = null; // Clear the reference
    }

    if (!element.textContent || !element.textContent.trim()) {
        return;
    }

    headerExplainSplit = new SplitText(element, { type: "lines" });

    if (!headerExplainSplit.lines || headerExplainSplit.lines.length === 0) {
        gsap.set(element, { visibility: "visible", opacity: 1, y: "0%" });
        return;
    }

    gsap.set(headerExplainSplit.lines, { visibility: "hidden", y: "50%" });

    const animationDelay = isInitialLoad ? 4.5 : 0.2;

    gsap.to(headerExplainSplit.lines, {
        visibility: "visible",
        y: "0%",
        duration: isInitialLoad ? 2 : 1.2,
        ease: "back.out(0.7)",
        stagger: 0.1,
        delay: animationDelay,
        overwrite: "auto"
    });
}

window.changeLanguage = function (lang) {
    if (selectedLanguage === lang) return;

    selectedLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.lang = lang;

    updateContentUI();
    applyCustomButtonLogic();

    const languageButtons = document.querySelectorAll('.language-btn');
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
};

function updateContentUI() {
    const langData = ContentData[selectedLanguage];
    if (!langData) {
        console.error(`Language data for "${selectedLanguage}" not found.`);
        return;
    }

    // Set Page Title
    document.title = langData.Title.PageTitle;
    if (GetTitle) {
        GetTitle.setAttribute('title', langData.Title.Name);
    }

    navigation.forEach(navItem => {
        const navLink = document.querySelector(`.Navigation a[data-nav-key="${navItem.key}"]`);
        if (navLink && langData.Navigation && langData.Navigation[navItem.key]) {
            navLink.textContent = langData.Navigation[navItem.key];
        }
    });

    const ctaButton = document.getElementById('CTA_Navbar');
    if (ctaButton && langData.CTA && langData.Title) {
        ctaButton.textContent = `${langData.CTA.Download} ${langData.Title.Name}`;
    }

    const mintIntroText = document.querySelector('.MINT_HeaderText span');
    if (mintIntroText && langData.Heading) {
        mintIntroText.textContent = langData.Heading.PrivateMintIntroduce;
    }

    // Header => Main (ScrambleText animation won't re-run automatically)
    const headerText1Elem = document.getElementById('HeaderTextContent1');
    if (headerText1Elem && langData.Heading && langData.Heading.HeadingIntroduce) {
        headerText1Elem.textContent = langData.Heading.HeadingIntroduce.HeadersIntroduceContent1;
    }
    const headerText2Elem = document.getElementById('HeaderTextContent2');
    if (headerText2Elem && langData.Heading && langData.Heading.HeadingIntroduce) {
        headerText2Elem.textContent = langData.Heading.HeadingIntroduce.HeadersIntroduceContent2;
    }

    const headerExplainElem = document.getElementById('HeaderExplainContent');
    if (headerExplainElem && langData.Heading && langData.Heading.HeadingExplain) {
        headerExplainElem.innerHTML = `${langData.Heading.HeadingExplain.HeadersExplainContent1} <br> ${langData.Heading.HeadingExplain.HeadersExplainContent2}`;
    }

    // Re-initialize SplitText
    setupHeaderExplainAnimation(false);

    const featuredTitleElem = document.querySelector('.FeaturedText h1');
    if (featuredTitleElem && langData.Featured) {
        featuredTitleElem.textContent = langData.Featured.FeatureName;
    }
}

const navigation = [
    { key: "Featured", href: "#features" },
    { key: "HowItWorks", href: "#how-it-works" },
    { key: "About", href: "#about" },
    { key: "Contact", href: "#contact" }
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
    font-family: "DM Sans", sans-serif;
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
    const langData = ContentData[selectedLanguage]; // Use selected language
    const configHeadtag = () => {
        return `<title>${langData.Title.PageTitle}</title>`;
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
                background-color: #e5f4ff !important;
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
                --PrimaryAccentButtons: #ac9393;
                --PrimaryButtonsHoverlabel: #f0eee6;

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

            .call_in_action {
                display: flex;
                align-items: center;
            }

            .language-btn {
                padding: 0.5rem 0.5rem;
                border: none;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 14.5px;
                width: 72.5px;
                border-radius: var(--RoundedConners);
                font-family: 'Manrope', 'Anuphan', sans-serif;
            }
                
            .language-btn.active {
                background-color: var(--PrimaryAccentButtons);
                color: var(--PrimaryButtonsColorText);
            }

            .language-btn:not(.active) {
                background-color: var(--PrimaryNavbarBackgroundColor, #fff);
            }

            .language-btn:not(.active):hover {
                background-color: var(--PrimaryButtonsHoverlabel);
            }

            .language-switcher {
                position: fixed;
                top: calc(75px + 10px);
                right: 20px; 
                background: var(--PrimaryNavbarBackgroundColor, #fff);
                border-radius: var(--RoundedConners);
                box-shadow: 0 5px 15px rgba(0,0,0,0.15);
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out, visibility 0s linear 0.2s;
                z-index: 1000;
                padding: 6px;
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

            #CTA_Navbar .material-symbols-outlined {
                vertical-align: middle; 
                margin-right: 0.3em;   
            }

            .call_in_action { /* Make this a positioning context for the dropdown */
                position: relative; 
                display: flex;
                align-items: center;
            }

            .LanguageToggle {
                padding: 0.7rem;
                background-color: var(--PrimaryButtonsColors);
                border-radius: var(--RoundedConners);
                margin-left: 1rem;
                display: flex; /* To center icon if needed */
                align-items: center;
                justify-content: center;
                text-decoration: none;
            }

            .LanguageToggle:hover {
                background-color: var(--PrimaryButtonsColorsHover);
            }

            .LanguageToggle:hover .material-symbols-outlined {
                color: var(--PrimaryInvertButtonsColorText);
            }

            .LanguageToggle .material-symbols-outlined {
                font-size: 24px; 
                vertical-align: middle;
                color: var(--PrimaryTextColor);
            }

            .language-switcher.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
                transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out, visibility 0s linear 0s;
            }
        `
}

const createNavigation = () => {
    const langData = ContentData[selectedLanguage]; // Selected language for initial text

    return `
        <nav>
            <div class="navbarContent">
                <div class="Title">
                    ${titleEssentialApp()}
                </div>
                <ul class="Navigation">
                    ${navigation.map(item => `
                        <li><a href="${item.href}" data-nav-key="${item.key}">${langData.Navigation[item.key]}</a></li>
                    `).join('')}
                </ul>
                <div class="call_in_action">
                    <a href="${DownloadEssentialApp.href}" id="CTA_Navbar" class="hoverable">${langData.CTA.Download} ${langData.Title.Name}</a>
                    <a href="javascript:void(0)" class="LanguageToggle">
                        ${langData.CTA.CTAicon}
                    </a>
                </div>
            </div>
        </nav>
        <div class="language-switcher">
            <button class="language-btn ${selectedLanguage === 'th' ? 'active' : ''}" data-lang="th" onclick="changeLanguage('th')" id="lang-btn-th">ภาษาไทย</button>
            <button class="language-btn ${selectedLanguage === 'en' ? 'active' : ''}" data-lang="en" onclick="changeLanguage('en')" id="lang-btn-en">English</button>
        </div>
    `;
};

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
        </div>
    `
}

const NativeCursor = () => {
    return `
            <style>
                * {
                    cursor: url('data:image/png;base64,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') 16 16, auto;
                }
            </style>
        `
}

const createHeader = () => {
    const langData = ContentData[selectedLanguage]; // Use selected language for initial text

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
                            <span>${langData.Heading.PrivateMintIntroduce}</span>
                        </div>
                        <h1 id="HeaderTextContent1">${langData.Heading.HeadingIntroduce.HeadersIntroduceContent1}</h1>
                        <h1 id="HeaderTextContent2">${langData.Heading.HeadingIntroduce.HeadersIntroduceContent2}</h1>
                        <br>
                        <p id="HeaderExplainContent">
                            ${langData.Heading.HeadingExplain.HeadersExplainContent1} <br>
                            ${langData.Heading.HeadingExplain.HeadersExplainContent2}
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
    const langData = ContentData[selectedLanguage]; // Use selected language for initial text

    return `
        <style>
            .Featured {
                width: 100%;
                height: 800px;
                background-color: var(--PrimaryFullyContractColor);'
            }

            .FeaturedContent {
                // max-width: var(--ElementMaxWidth);
                margin: auto;
            }                
        </style>
        <section class="Featured">
                <iframe src="./IntroduceContent/Video_EssentialSlide/LightmodeVideoEssential_English.html" name="EssentialIntroducevideo1"
                style="pointer-events: none" scrolling="no" frameborder="0" marginheight="0px"
                marginwidth="0px" width="100%" height="800px" allowfullscreen></iframe>
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
            ${NativeCursor()}
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
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Anuphan:wght@100..700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter+Tight:ital,wght@0,100..900;1,100..900&family=Manrope:wght@200..800&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Trirong:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    head.appendChild(fontLink);

    // (Icons)
    const materialSymbolsLink = document.createElement('link');
    materialSymbolsLink.rel = 'stylesheet';
    materialSymbolsLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
    head.appendChild(materialSymbolsLink);

    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        const headerText1 = document.getElementById('HeaderTextContent1');
        const headerText2 = document.getElementById('HeaderTextContent2');
        // const HeaderExplainContent = document.getElementById('HeaderExplainContent'); // Element will be fetched in setupHeaderExplainAnimation

        if (headerText2) headerText2.style.visibility = "hidden";

        const mintHeaderTextElement = document.getElementById('MINT_HeaderText');
        if (mintHeaderTextElement) mintHeaderTextElement.style.visibility = "hidden";

        if (headerText1 && headerText2) {
            const langDataForAnimation = ContentData[selectedLanguage]; // Get current language data for animation

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
                    text: langDataForAnimation.Heading.HeadingIntroduce.HeadersIntroduceContent1, // Use text from langData
                    chars: "lowerCase",
                    revealDelay: 0.5,
                    tweenLength: false
                }
            })
                .to(headerText2, {
                    duration: 1.5,
                    visibility: 'visible',
                    scrambleText: {
                        text: langDataForAnimation.Heading.HeadingIntroduce.HeadersIntroduceContent2, // Use text from langData
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
                    width: langDataForAnimation.HighlightAnimationWidth,
                    duration: 0.8,
                    ease: "power1.out"
                })
                .to('#MINT_HeaderText', {
                    filter: "blur(0px)",
                    y: "0%", // Using string "0%" for consistency with other y transforms
                    visibility: 'visible',
                    duration: 0.8,
                    ease: "back.out(1.4)"
                });
            setupHeaderExplainAnimation(true); // Call for initial load
        }

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