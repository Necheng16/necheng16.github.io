const page = document.body.dataset.page;
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const scrollRule = document.querySelector(".scroll-rule");

const markSchoolEggs = () => {
  const skipTags = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "OPTION"]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || skipTags.has(parent.tagName) || parent.closest("[data-egg]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return /(University of Rochester|Rochester|Yale)/.test(node.nodeValue)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    const parts = node.nodeValue.split(/(University of Rochester|Rochester|Yale)/g);
    parts.forEach((part) => {
      if (!part) return;
      if (part === "University of Rochester" || part === "Rochester") {
        const span = document.createElement("span");
        span.dataset.egg = "rochester";
        span.textContent = part;
        fragment.append(span);
      } else if (part === "Yale") {
        const span = document.createElement("span");
        span.dataset.egg = "yale";
        span.textContent = part;
        fragment.append(span);
      } else {
        fragment.append(document.createTextNode(part));
      }
    });
    node.replaceWith(fragment);
  });
};

markSchoolEggs();

document.querySelectorAll("[data-nav]").forEach((link) => {
  if (link.dataset.nav === page) {
    link.classList.add("is-active");
  }
});

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const updateScrollRule = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  scrollRule.style.width = `${Math.min(progress * 100, 100)}%`;
};

window.addEventListener("scroll", updateScrollRule, { passive: true });
updateScrollRule();

const formatMonth = (value) => {
  if (!value) return "Undated";
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const renderUpdates = () => {
  const list = document.querySelector("#updates-list");
  if (!list) return;

  const updates = Array.isArray(window.siteData?.updates) ? window.siteData.updates : [];
  list.innerHTML = "";

  updates.forEach((update) => {
    const article = document.createElement("article");

    const time = document.createElement("time");
    time.dateTime = update.date || "";
    time.textContent = update.label || formatMonth(update.date);

    const content = document.createElement("div");

    const title = document.createElement("h2");
    title.textContent = update.title || "Untitled";

    const body = document.createElement("p");
    body.textContent = update.body || "";

    content.append(title, body);
    article.append(time, content);
    list.append(article);
  });
};

const renderPhotographyGallery = () => {
  const gallery = document.querySelector("#photography-gallery");
  if (!gallery) return;

  const sections = Array.isArray(window.siteData?.photographySections)
    ? window.siteData.photographySections
    : [];

  gallery.innerHTML = "";

  sections.forEach((section, index) => {
    const sectionTitle = section.title || section.label || `Series ${index + 1}`;
    const sectionLabel = section.label || sectionTitle;
    const photos = Array.isArray(section.photos) ? section.photos : [];
    const minimumSlots = Number.isFinite(section.minimumSlots) ? Math.max(0, section.minimumSlots) : 3;
    const emptySlots = Number.isFinite(section.emptySlots)
      ? Math.max(0, section.emptySlots)
      : Math.max(0, minimumSlots - photos.length);

    const sectionElement = document.createElement("section");
    sectionElement.className = "photo-section reveal";
    sectionElement.setAttribute("aria-label", `${sectionTitle} photography`);

    const sectionHead = document.createElement("div");
    sectionHead.className = "photo-section-head";

    const kicker = document.createElement("p");
    kicker.className = "kicker";
    kicker.textContent = sectionLabel;

    const title = document.createElement("h2");
    title.textContent = sectionTitle;

    sectionHead.append(kicker, title);

    const grid = document.createElement("div");
    grid.className = "gallery-grid";

    photos.forEach((photo) => {
      const source = photo?.src || (photo?.file && section.folder ? `${section.folder}${photo.file}` : "");
      if (!source) return;
      const figure = document.createElement("figure");
      figure.className = "gallery-slot";

      const image = document.createElement("img");
      image.src = source;
      image.alt = photo.alt || sectionTitle;
      image.loading = "lazy";

      figure.append(image);
      grid.append(figure);
    });

    for (let i = 0; i < emptySlots; i += 1) {
      const figure = document.createElement("figure");
      figure.className = "gallery-slot is-empty";
      figure.setAttribute("aria-hidden", "true");
      grid.append(figure);
    }

    sectionElement.append(sectionHead, grid);
    gallery.append(sectionElement);
  });
};

renderUpdates();
renderPhotographyGallery();
markSchoolEggs();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const eggPresets = {
  rochester: {
    className: "egg-rochester-pennant",
    image: "assets/rochester-pennant.png",
    count: 5,
  },
  yale: {
    className: "egg-yale-logo",
    image: "assets/yale-y.png",
    count: 26,
  },
};

Object.values(eggPresets).forEach((preset) => {
  const image = new Image();
  image.src = preset.image;
});

const rand = (min, max) => Math.random() * (max - min) + min;

const runEgg = (type, origin) => {
  const preset = eggPresets[type];
  if (!preset) return;

  const now = Date.now();
  if (origin && Number(origin.dataset.eggTime || 0) + 450 > now) return;
  if (origin) origin.dataset.eggTime = String(now);

  const layer = document.createElement("div");
  layer.className = "egg-layer";

  for (let i = 0; i < preset.count; i += 1) {
    const token = document.createElement("img");
    token.className = `egg-image ${preset.className}`;
    token.src = preset.image;
    token.alt = "";
    token.decoding = "async";
    token.loading = "eager";
    token.style.setProperty("--w", type === "rochester" ? `${rand(11.25, 18.75)}rem` : `${rand(2.2, 4.3)}rem`);
    token.style.setProperty("--s", `${rand(0.88, 1.08)}`);
    token.style.setProperty("--o", `${rand(0.72, 0.94)}`);
    token.style.setProperty("--r0", `${rand(-8, 8)}deg`);
    token.style.setProperty("--r3", `${rand(-18, 18)}deg`);
    token.style.setProperty("--start-x", `${rand(-16, -7)}vw`);
    token.style.setProperty("--end-x", `${rand(116, 150)}vw`);
    token.style.setProperty("--start-y", `${rand(8, 78)}vh`);
    token.style.setProperty("--end-y", `${rand(8, 78)}vh`);
    token.style.setProperty("--start-fall-y", `${rand(-18, -9)}vh`);
    token.style.setProperty("--end-fall-y", `${rand(116, 142)}vh`);
    token.style.setProperty("--fall-x", `${rand(-18, 18)}vw`);
    token.style.setProperty("--x", `${rand(4, 92)}vw`);
    token.style.setProperty("--delay", "0ms");
    token.style.setProperty("--duration", type === "rochester" ? `${rand(4400, 6400)}ms` : `${rand(4200, 6600)}ms`);
    layer.append(token);
  }

  document.body.append(layer);
  window.setTimeout(() => layer.remove(), 7200);
};

document.querySelectorAll("[data-egg]").forEach((item) => {
  item.addEventListener("pointerenter", () => runEgg(item.dataset.egg, item));
  item.addEventListener("click", () => {
    runEgg(item.dataset.egg, item);
  });
});
