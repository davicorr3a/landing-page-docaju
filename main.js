const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const nav = document.querySelector("[data-nav]");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const toggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
  menu.hidden = !open;
};
toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });

const navLinks = [...document.querySelectorAll(".nav__links a")];
const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const id = entry.target.id;
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  }
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-in");
    revealObserver.unobserve(entry.target);
  }
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

document.querySelectorAll("[data-foto]").forEach((person) => {
  const avatar = person.querySelector(".person__avatar");
  const name = person.querySelector(".person__name").textContent;
  const img = new Image();
  img.alt = name;
  img.decoding = "async";
  img.onload = () => avatar.append(img);
  img.src = `assets/equipe/${person.dataset.foto}.jpg`;
});

const carousel = document.querySelector("[data-carousel]");
if (carousel) {
  const track = carousel.querySelector("[data-car-track]");
  const slides = [...track.children];
  const prev = document.querySelector("[data-car-prev]");
  const next = document.querySelector("[data-car-next]");
  const current = document.querySelector("[data-car-current]");
  const dotsWrap = document.querySelector("[data-car-dots]");
  document.querySelector("[data-car-total]").textContent = String(slides.length).padStart(2, "0");

  const dots = slides.map((slide, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", slide.querySelector("h3").textContent);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.append(dot);
    return dot;
  });

  let index = -1;
  const setActive = (i) => {
    if (i === index) return;
    index = i;
    slides.forEach((s, j) => s.classList.toggle("is-active", j === i));
    dots.forEach((d, j) => d.setAttribute("aria-selected", String(j === i)));
    current.textContent = String(i + 1).padStart(2, "0");
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
  };

  let pending = null;
  const goTo = (i) => {
    const target = Math.max(0, Math.min(slides.length - 1, i));
    pending = target;
    track.scrollTo({ left: slides[target].offsetLeft - slides[0].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
  };
  const base = () => (pending ?? index);
  track.addEventListener("scrollend", () => { pending = null; });

  let ticking = false;
  track.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const step = slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : 1;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      setActive(atEnd ? slides.length - 1 : Math.round(track.scrollLeft / step));
      ticking = false;
    });
  }, { passive: true });

  prev.addEventListener("click", () => goTo(base() - 1));
  next.addEventListener("click", () => goTo(base() + 1));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(base() + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(base() - 1); }
  });
  setActive(0);
}

const video = document.querySelector("[data-video]");
if (video) {
  const id = video.dataset.youtube.trim();
  const play = video.querySelector("[data-video-play]");
  if (id) {
    video.classList.add("has-video");
    play.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      iframe.title = "Pitch do DocAju";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      video.append(iframe);
      play.remove();
    });
  } else {
    play.setAttribute("aria-disabled", "true");
    play.style.cursor = "default";
  }
}

const demo = document.querySelector("[data-demo]");
if (demo) {
  const stage = demo.querySelector("[data-demo-stage]");
  const cursor = demo.querySelector("[data-demo-cursor]");
  const ring = demo.querySelector("[data-demo-ring]");
  const typed = demo.querySelector("[data-demo-typed]");
  const list = demo.querySelector("[data-demo-steps]");
  const count = demo.querySelector("[data-demo-count]");
  const menuItem = demo.querySelector('[data-target="menu"]');
  const input = demo.querySelector('[data-target="input"]');
  const button = demo.querySelector('[data-target="button"]');

  const TIP_X = 5;
  const TIP_Y = 3;
  let cur = { x: 260, y: 240 };

  const centerOf = (el) => {
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - s.left + Math.min(r.width / 2, 48), y: r.top - s.top + r.height / 2 };
  };
  const visible = (el) => el.offsetParent !== null;

  let active = false;
  let resume = null;
  const gate = () => (active ? Promise.resolve() : new Promise((r) => { resume = r; }));
  const setActive = (v) => {
    active = v && !document.hidden;
    if (active && resume) { resume(); resume = null; }
  };
  new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.25 }).observe(demo);
  document.addEventListener("visibilitychange", () => setActive(!document.hidden && demo.getBoundingClientRect().top < innerHeight));

  const cursorTransform = (p, scale = 1) => `translate(${p.x - TIP_X}px, ${p.y - TIP_Y}px) scale(${scale})`;

  const moveTo = async (p, duration = 850) => {
    await gate();
    await cursor.animate(
      [{ transform: cursorTransform(cur) }, { transform: cursorTransform(p) }],
      { duration, easing: EASE_IN_OUT, fill: "forwards" }
    ).finished;
    cur = p;
  };

  const click = async (p) => {
    await gate();
    ring.style.left = `${p.x}px`;
    ring.style.top = `${p.y}px`;
    ring.animate(
      [
        { opacity: 0, transform: "scale(0.4)" },
        { opacity: 1, transform: "scale(1)", offset: 0.35 },
        { opacity: 0, transform: "scale(1.35)" },
      ],
      { duration: 800, easing: EASE_OUT }
    );
    await cursor.animate(
      [
        { transform: cursorTransform(cur) },
        { transform: cursorTransform(cur, 0.86), offset: 0.4 },
        { transform: cursorTransform(cur) },
      ],
      { duration: 220, easing: EASE_OUT, fill: "forwards" }
    ).finished;
  };

  const addStep = (html, p, animate = true) => {
    const s = stage.getBoundingClientRect();
    const li = document.createElement("li");
    li.className = "demo__step";
    li.innerHTML = `<span class="demo__thumb" style="--x:${((p.x / s.width) * 100).toFixed(1)}%;--y:${((p.y / s.height) * 100).toFixed(1)}%"></span><span>${html}</span>`;
    list.append(li);
    count.textContent = list.children.length;
    if (animate) {
      li.animate(
        [
          { opacity: 0, transform: "translateY(10px) scale(0.97)", filter: "blur(4px)" },
          { opacity: 1, transform: "none", filter: "blur(0)" },
        ],
        { duration: 480, easing: EASE_OUT }
      );
    }
  };

  const type = async (text) => {
    for (const ch of text) {
      await gate();
      typed.textContent += ch;
      await wait(85);
    }
  };

  const reset = async () => {
    const items = [...list.children];
    await Promise.all(items.map((li, i) => li.animate(
      [{ opacity: 1 }, { opacity: 0, transform: "translateY(-6px)" }],
      { duration: 260, delay: i * 40, easing: EASE_OUT, fill: "forwards" }
    ).finished));
    list.replaceChildren();
    count.textContent = "0";
    typed.textContent = "";
    menuItem.classList.remove("is-active");
    input.classList.remove("is-focused");
  };

  const STEP_MENU = 'Clique em <b>"Matrícula"</b>';
  const STEP_INPUT = 'Digite <b>"2026.1"</b> no campo <b>"Período"</b>';
  const STEP_BUTTON = 'Clique em <b>"Confirmar"</b>';

  const showStatic = () => {
    menuItem.classList.add("is-active");
    typed.textContent = "2026.1";
    cursor.style.display = "none";
    if (visible(menuItem)) addStep(STEP_MENU, centerOf(menuItem), false);
    addStep(STEP_INPUT, centerOf(input), false);
    addStep(STEP_BUTTON, centerOf(button), false);
  };

  const loop = async () => {
    cursor.style.transform = cursorTransform(cur);
    await wait(900);
    for (;;) {
      if (visible(menuItem)) {
        const p = centerOf(menuItem);
        await moveTo(p);
        await click(p);
        menuItem.classList.add("is-active");
        addStep(STEP_MENU, p);
        await wait(650);
      }

      const pi = centerOf(input);
      await moveTo(pi);
      await click(pi);
      input.classList.add("is-focused");
      await wait(200);
      await type("2026.1");
      addStep(STEP_INPUT, pi);
      await wait(550);

      const pb = centerOf(button);
      await moveTo(pb, 700);
      input.classList.remove("is-focused");
      button.classList.add("is-pressed");
      await click(pb);
      button.classList.remove("is-pressed");
      addStep(STEP_BUTTON, pb);

      await moveTo({ x: pb.x + 90, y: pb.y + 36 }, 900);
      await wait(2600);
      await gate();
      await reset();
      await wait(500);
    }
  };

  if (reduceMotion) showStatic();
  else loop();
}
