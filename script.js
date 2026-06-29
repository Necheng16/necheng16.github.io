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

const formatUpdateDate = (value) => {
  if (!value) return "Undated";
  const [year, month, day] = String(value).split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day || 1));
  const options = day
    ? { month: "long", day: "numeric", year: "numeric" }
    : { month: "long", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

const getUpdateSortValue = (update) => {
  const value = String(update.date || "");
  const [year = "0", month = "1", day = "1"] = value.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime() || 0;
};

const renderUpdates = () => {
  const list = document.querySelector("#updates-list");
  if (!list) return;

  const updates = Array.isArray(window.siteData?.updates)
    ? [...window.siteData.updates].sort((a, b) => getUpdateSortValue(b) - getUpdateSortValue(a))
    : [];
  list.innerHTML = "";

  updates.forEach((update) => {
    const article = document.createElement("article");

    const time = document.createElement("time");
    time.dateTime = update.date || "";
    time.textContent = update.label || formatUpdateDate(update.date);

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

const normalizeTravelName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeTravelCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const getTravelRecords = () =>
  Array.isArray(window.siteData?.travel?.countries) ? window.siteData.travel.countries : [];

const getFeatureCode = (feature) =>
  normalizeTravelCode(
    [
      feature?.properties?.ISO_A3,
      feature?.properties?.ADM0_A3,
      feature?.properties?.ADM0_ISO,
      feature?.properties?.BRK_A3,
      feature?.properties?.SOV_A3,
    ].find((value) => value && String(value) !== "-99")
  );

const getFeatureName = (feature) =>
  feature?.properties?.ADMIN || feature?.properties?.NAME_LONG || feature?.properties?.NAME || "Country";

const getCityEntries = (record) => {
  if (!Array.isArray(record?.cities)) return [];

  return record.cities
    .map((city) => {
      if (typeof city === "string") return { name: city };

      const coordinates = Array.isArray(city?.coordinates)
        ? city.coordinates
        : Array.isArray(city?.coords)
          ? city.coords
          : null;
      const lng = Number(city?.lng);
      const lat = Number(city?.lat);
      const numericCoordinates = Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;

      return {
        name: city?.name || city?.label || "",
        coordinates: coordinates || numericCoordinates,
      };
    })
    .filter((city) => city.name);
};

const renderTravelMap = async () => {
  const svgNode = document.querySelector("#travel-map");
  if (!svgNode) return;

  const title = document.querySelector("#travel-country-title");
  const copy = document.querySelector("#travel-country-copy");
  const cityList = document.querySelector("#travel-city-list");
  const countryIndex = document.querySelector("#travel-country-index");
  const resetButton = document.querySelector("#travel-reset");
  const d3Map = window.d3;

  if (!d3Map) {
    if (copy) copy.textContent = "Map library unavailable.";
    return;
  }

  const records = getTravelRecords();
  const recordsByCode = new Map();
  const recordsByName = new Map();

  records.forEach((record) => {
    const code = normalizeTravelCode(record.iso3 || record.code);
    const name = normalizeTravelName(record.name || record.country);
    if (code) recordsByCode.set(code, record);
    if (name) recordsByName.set(name, record);
  });

  const getRecordForFeature = (feature) => {
    const code = getFeatureCode(feature);
    const name = normalizeTravelName(getFeatureName(feature));
    return recordsByCode.get(code) || recordsByName.get(name);
  };

  const width = 1200;
  const height = 680;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reducedMotion ? 0 : 850;

  const svg = d3Map
    .select(svgNode)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
  svg.selectAll("*").remove();

  if (copy) copy.textContent = "Loading map.";

  let world;
  try {
    const response = await fetch("assets/maps/world-countries.geojson");
    if (!response.ok) throw new Error("Map data unavailable");
    world = await response.json();
  } catch (error) {
    if (title) title.textContent = "Map unavailable";
    if (copy) copy.textContent = "Preview this page from a local server or the published site.";
    return;
  }

  const projection = d3Map.geoNaturalEarth1();
  const path = d3Map.geoPath(projection);
  const sphere = { type: "Sphere" };
  projection.fitExtent(
    [
      [24, 24],
      [width - 24, height - 24],
    ],
    sphere
  );

  const mapGroup = svg.append("g").attr("class", "travel-map-group");
  const spherePath = mapGroup
    .append("path")
    .datum(sphere)
    .attr("class", "travel-sphere")
    .attr("d", path);
  const countryLayer = mapGroup.append("g").attr("class", "travel-country-layer");
  const pinLayer = mapGroup.append("g").attr("class", "travel-pin-layer");

  const features = Array.isArray(world.features)
    ? world.features.filter((feature) => getFeatureName(feature) !== "Antarctica")
    : [];
  const featureByRecordKey = new Map();

  features.forEach((feature) => {
    const record = getRecordForFeature(feature);
    if (!record) return;
    const codeKey = normalizeTravelCode(record.iso3 || record.code);
    const nameKey = normalizeTravelName(record.name || record.country);
    if (codeKey) featureByRecordKey.set(codeKey, feature);
    if (nameKey) featureByRecordKey.set(nameKey, feature);
  });

  const renderCities = (cities) => {
    if (!cityList) return;
    cityList.innerHTML = "";
    cities.forEach((city) => {
      const item = document.createElement("li");
      item.textContent = city.name;
      cityList.append(item);
    });
  };

  const renderPins = (cities) => {
    const pins = cities
      .map((city) => ({
        ...city,
        point: Array.isArray(city.coordinates) ? projection(city.coordinates) : null,
      }))
      .filter((city) => Array.isArray(city.point));

    const pinSelection = pinLayer
      .selectAll("circle")
      .data(pins, (city) => city.name)
      .join("circle")
      .attr("class", "travel-city-pin")
      .attr("cx", (city) => city.point[0])
      .attr("cy", (city) => city.point[1])
      .attr("r", 4.8);

    pinSelection.selectAll("title").data((city) => [city]).join("title").text((city) => city.name);
  };

  const getRecordFeature = (record) => {
    const codeKey = normalizeTravelCode(record.iso3 || record.code);
    const nameKey = normalizeTravelName(record.name || record.country);
    return featureByRecordKey.get(codeKey) || featureByRecordKey.get(nameKey);
  };

  const renderCountryIndex = () => {
    if (!countryIndex) return;
    countryIndex.innerHTML = "";

    records.forEach((record) => {
      const feature = getRecordFeature(record);
      const button = document.createElement("button");
      button.type = "button";
      if (!feature) button.disabled = true;

      const name = document.createElement("span");
      name.textContent = record.name || record.country || "Country";

      const count = document.createElement("span");
      const cityCount = getCityEntries(record).length;
      count.textContent = `${cityCount} ${cityCount === 1 ? "place" : "places"}`;

      button.append(name, count);
      if (feature) {
        button.addEventListener("click", () => focusFeature(feature));
      }
      countryIndex.append(button);
    });
  };

  const resetMap = () => {
    countrySelection.classed("is-selected", false);
    pinLayer.selectAll("*").remove();
    mapGroup
      .transition()
      .duration(duration)
      .ease(d3Map.easeCubicOut)
      .attr("transform", "translate(0,0) scale(1)");

    if (title) title.textContent = "World";
    if (copy) {
      copy.textContent = records.length
        ? `${records.length} ${records.length === 1 ? "country / region" : "countries / regions"} saved.`
        : "No countries saved yet.";
    }
    renderCities([]);
    renderCountryIndex();
  };

  const zoomToFeature = (feature) => {
    const bounds = path.bounds(feature);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;

    if (!Number.isFinite(dx) || !Number.isFinite(dy) || dx <= 0 || dy <= 0) return;

    const scale = Math.min(9, Math.max(1.25, 0.72 / Math.max(dx / width, dy / height)));
    const translateX = width / 2 - scale * x;
    const translateY = height / 2 - scale * y;

    mapGroup
      .transition()
      .duration(duration)
      .ease(d3Map.easeCubicOut)
      .attr("transform", `translate(${translateX},${translateY}) scale(${scale})`);
  };

  function focusFeature(feature) {
    const record = getRecordForFeature(feature);
    const countryName = record?.name || record?.country || getFeatureName(feature);
    const cities = getCityEntries(record);

    countrySelection.classed("is-selected", (item) => item === feature);
    renderCities(cities);
    renderPins(cities);
    zoomToFeature(feature);

    if (title) title.textContent = countryName;
    if (copy) {
      copy.textContent = cities.length
        ? `${cities.length} ${cities.length === 1 ? "place" : "places"} saved.`
        : "No saved places yet.";
    }
  }

  const countrySelection = countryLayer
    .selectAll("path")
    .data(features)
    .join("path")
    .attr("class", (feature) =>
      getRecordForFeature(feature) ? "travel-country is-visited" : "travel-country"
    )
    .attr("d", path)
    .attr("tabindex", 0)
    .attr("role", "button")
    .attr("aria-label", getFeatureName)
    .on("click", (event, feature) => {
      event.stopPropagation();
      focusFeature(feature);
    })
    .on("keydown", (event, feature) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      focusFeature(feature);
    });

  countrySelection.append("title").text(getFeatureName);
  spherePath.on("click", resetMap);
  resetButton?.addEventListener("click", resetMap);
  renderCountryIndex();
  resetMap();
};

renderUpdates();
renderPhotographyGallery();
renderTravelMap();
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
