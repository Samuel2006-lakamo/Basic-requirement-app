function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js')
    ]).then(() => {
        createLandingPage();
    }).catch(error => {
        console.error('Error loading scripts:', error);
    });
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
    }
};

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
    }
};

const PublicVariable = () => {
    const configHeadtag = () => {
        return `<title>${ContentData.Title.PageTitle}</title>`;
    };

    const createStyles = () => {
        return `
        <style>
            :root {
                --PrimaryBackgroundcolor: #faf9f5;
                --PrimaryNavbarBackgroundColor: #ffffff;
                --PublicBorder: solid 1px #e6e6e6;
                --NavbarMaskDepth: 120px;
                --RoundedConners: 100vmax;
                
                /* Buttons Theme */
                --PrimaryButtonsColors: ${ButtonsTheme.default.background};
                --PrimaryButtonsColorsHover: ${ButtonsTheme.default.backgroundHover};
                --PrimaryButtonsColorText: ${ButtonsTheme.default.text};
                --PrimaryInvertButtonsColorText: ${ButtonsTheme.default.textInvert};

                /* Text & Logo colors */
                --PrimaryTextColor: #050505;
            }

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Inter Tight', 'Anuphan', sans-serif;
                transition: 0.4s cubic-bezier(0.19, 1, 0.22, 1) all;
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
            nav {
                position: fixed;
                width: 100%;
                height: var(--NavbarMaskDepth);
                background-color: var(--PrimaryBackgroundcolor);
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
                padding: 0.75rem;
                color: var(--LogoColor);
            }

            .Title img {
                width: 32.5px;
                height: 32.5px;
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
                max-width: 1100px;
                margin: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: calc(var(--NavbarMaskDepth) - 40px);
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
    </style>
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
                <a href="${DownloadEssentialApp.href}" id="CTA_Navbar">Download ${ContentData.Title.Name}</a>
            </div>
        </nav>
    `;
};

const createHeader = () => {

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
        </head>
        <body>
            ${createNavigation()}
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
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Anuphan:wght@100..700&family=Inter+Tight:ital,wght@0,100..900;1,100..900&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Trirong:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    head.appendChild(fontLink);

    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }
}