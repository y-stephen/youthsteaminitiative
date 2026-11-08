const homepage = "Youth STEAM Initiative";

class Nav extends HTMLElement {
  connectedCallback() {
    const pages = [
      { title: "About Us", href: "index.html#Mission" },
      { title: "Projects", href: "projects.html" },
      { title: "Activity", href: "activity.html" },
      { title: "Learning Center", href: "learning-center.html" },
      { title: "Donate", href: "donate.html" },
      { title: "Search", href: "search.html", icon: true },
    ];

    this.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-light fixed-top py-3" id="mainNav">
        <div class="container px-4 px-lg-5">
          <a class="navbar-brand d-flex align-items-center" href="index.html">
            <img src="./images/Team logo.png" alt="Logo" style="height: 48px; margin-right: 8px;">
            ${homepage}
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" 
                  aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav ms-auto my-2 my-lg-0">
              ${pages
                .map(
                  (page) => `
                <li class="nav-item">
                  <a class="nav-link" href="${page.href}" ${page.icon ? 'aria-label="Search"' : ""}>${page.icon ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg><span>Search</span>' : page.title}</a>
                </li>`,
                )
                .join("")}
            </ul>
          </div>
          <div class="nav-translate d-flex align-items-center">
            <i class="bi bi-translate"></i>
            <span id="google_translate_element"></span>
          </div>
        </div>
      </nav>
      <style>
        #mainNav .nav-link svg { width: 20px; height: 20px; vertical-align: middle; margin-right: 0.3rem; }

        .nav-translate {
          margin-left: 0.75rem;
          gap: 4px;
          color: #6c757d;
        }

        #google_translate_element {
          display: inline-block;
        }

        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }

        body {
          top: 0 !important;
        }

        .goog-te-gadget {
          font-family: inherit !important;
          font-size: 0 !important;
          color: transparent !important;
        }

        .goog-te-gadget .goog-te-combo {
          font-family: "Merriweather Sans", sans-serif !important;
          font-size: 0.85rem !important;
          color: #6c757d !important;
          border: 1px solid #ced4da;
          border-radius: 4px;
          padding: 2px 4px;
          margin: 0 !important;
        }

        .goog-te-gadget img {
          display: none !important;
        }

        @media (max-width: 991.98px) {
          #mainNav .container {
            flex-wrap: wrap;
          }
        }
      </style>
    `;
    this.querySelectorAll(".on-page").forEach((link) => {
      link.addEventListener("click", (e) => e.preventDefault());
    });

    this.loadGoogleTranslate();
  }

  loadGoogleTranslate() {
    if (window.__googleTranslateLoaded) return;
    window.__googleTranslateLoaded = true;

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "zh-CN,es,hi,fr,vi,pt,ko,ar",
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };
    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }
}

customElements.define("nav-component", Nav);
