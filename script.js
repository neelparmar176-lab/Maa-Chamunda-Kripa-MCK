/**
 * MCK BHOJAN - FULL WEBSITE ANIMATED SCROLL ENGINE
 * Multi-device responsive: Mobile Phones, Tablets & Laptops
 * 
 * Features:
 * - 240-Frame Canvas Scrollytelling adaptive for portrait & landscape viewports
 * - 60-120 FPS Lerp (Linear Interpolation) physics
 * - Touch-optimized scrub track & play toggle
 * - Responsive Mobile Drawer navigation
 * - Dynamic WhatsApp links for 98819353450
 */

document.addEventListener("DOMContentLoaded", () => {
  initGlobalScrollytelling();
  initResponsiveNavigation();
});

const WHATSAPP_NUMBER = "98819353450";

/* ==========================================================================
   GLOBAL SCROLLYTELLING CANVAS ENGINE (WHOLE PAGE SCROLL)
   ========================================================================== */
function initGlobalScrollytelling() {
  const canvas = document.getElementById("bowlCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const hudScrubberFill = document.getElementById("hudScrubberFill");
  const hudScrubberTrack = document.getElementById("hudScrubberTrack");
  const hudFrameReadout = document.getElementById("hudFrameReadout");
  const hudPlayBtn = document.getElementById("hudPlayBtn");

  const totalFrames = 240;
  const frames = new Array(totalFrames + 1);
  const loadedStatus = new Array(totalFrames + 1).fill(false);
  let loadedCount = 0;

  // Animation states
  let currentFrame = 1;
  let targetFrame = 1;
  let isPlaying = false;
  let playAnimationId = null;

  // Format frame filename: ezgif-frame-001.jpg -> ezgif-frame-240.jpg
  function getFrameSrc(index) {
    const padded = String(index).padStart(3, "0");
    return `images/frames/ezgif-frame-${padded}.jpg`;
  }

  // Preload frame 1 immediately and draw
  const firstImage = new Image();
  firstImage.src = getFrameSrc(1);
  firstImage.onload = () => {
    frames[1] = firstImage;
    loadedStatus[1] = true;
    loadedCount++;
    renderFrame(1);
    startBackgroundPreload();
  };

  // Progressive background loading queue
  function startBackgroundPreload() {
    let queueIndex = 2;
    const concurrentLimit = 6;
    let inFlight = 0;

    function loadNext() {
      if (queueIndex > totalFrames && inFlight === 0) {
        return;
      }

      while (inFlight < concurrentLimit && queueIndex <= totalFrames) {
        const i = queueIndex++;
        inFlight++;
        const img = new Image();
        img.src = getFrameSrc(i);
        img.onload = () => {
          frames[i] = img;
          loadedStatus[i] = true;
          loadedCount++;
          inFlight--;
          loadNext();
        };
        img.onerror = () => {
          inFlight--;
          loadNext();
        };
      }
    }

    loadNext();
  }

  // Resize canvas with High-DPI & Mobile Safe Viewport
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance on ultra-high retina phones
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    renderFrame(Math.round(currentFrame));
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Nearest cached frame lookup
  function getNearestLoadedImage(targetIdx) {
    targetIdx = Math.max(1, Math.min(totalFrames, Math.round(targetIdx)));
    if (loadedStatus[targetIdx] && frames[targetIdx]) {
      return frames[targetIdx];
    }
    for (let offset = 1; offset < totalFrames; offset++) {
      const lower = targetIdx - offset;
      if (lower >= 1 && loadedStatus[lower] && frames[lower]) {
        return frames[lower];
      }
      const upper = targetIdx + offset;
      if (upper <= totalFrames && loadedStatus[upper] && frames[upper]) {
        return frames[upper];
      }
    }
    return frames[1];
  }

  // Render Frame on 2D context (Adaptive for Mobile Phones, Tablets & Desktops)
  function renderFrame(index) {
    const img = getNearestLoadedImage(index);
    if (!img) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayW = window.innerWidth;
    const displayH = window.innerHeight;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayW, displayH);

    const imgW = img.naturalWidth || 1280;
    const imgH = img.naturalHeight || 720;
    const imgAspect = imgW / imgH;
    const screenAspect = displayW / displayH;

    let drawW, drawH, drawX, drawY;

    if (displayW <= 768 && screenAspect < 1) {
      // Mobile Portrait View:
      // Give the exploding bowl an optical focus and prominent scale
      // so it fills the phone's center beautifully without being tiny
      const fillScale = Math.max(displayW / imgW, (displayH * 0.58) / imgH) * 1.15;
      drawW = imgW * fillScale;
      drawH = imgH * fillScale;
      drawX = (displayW - drawW) / 2;
      drawY = (displayH - drawH) / 2 - (displayH * 0.04);
    } else {
      // Tablets & Laptops (Landscape / Widescreen)
      if (screenAspect > imgAspect) {
        drawH = displayH;
        drawW = displayH * imgAspect;
        drawX = (displayW - drawW) / 2;
        drawY = 0;
      } else {
        drawW = displayW;
        drawH = displayW / imgAspect;
        drawX = 0;
        drawY = (displayH - drawH) / 2;
      }
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Update Floating HUD Scrubber UI
    const progress = (index - 1) / (totalFrames - 1);
    const pct = Math.min(100, Math.max(0, progress * 100));
    if (hudScrubberFill) hudScrubberFill.style.width = `${pct}%`;
    if (hudFrameReadout) {
      hudFrameReadout.textContent = `BOWL: ${String(Math.round(index)).padStart(3, "0")} / 240`;
    }
  }

  // GLOBAL SCROLL TRACKER: Smooth scroll-to-frame mapping
  function updateGlobalScroll() {
    if (isPlaying) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

    const scrollRatio = Math.max(0, Math.min(1, scrollY / docHeight));
    targetFrame = 1 + scrollRatio * (totalFrames - 1);
  }

  window.addEventListener("scroll", updateGlobalScroll, { passive: true });
  window.addEventListener("touchmove", updateGlobalScroll, { passive: true });
  updateGlobalScroll();

  // 60-120 FPS Lerp Loop
  function animLoop() {
    if (!isPlaying) {
      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) > 0.04) {
        currentFrame += diff * 0.16;
        renderFrame(Math.round(currentFrame));
      }
    }
    requestAnimationFrame(animLoop);
  }
  requestAnimationFrame(animLoop);

  // Play / Pause auto playback toggle
  if (hudPlayBtn) {
    hudPlayBtn.addEventListener("click", () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        hudPlayBtn.innerHTML = "❚❚";
        startAutoPlay();
      } else {
        hudPlayBtn.innerHTML = "▶";
        stopAutoPlay();
      }
    });
  }

  function startAutoPlay() {
    function step() {
      if (!isPlaying) return;
      currentFrame += 0.8;
      if (currentFrame > totalFrames) {
        currentFrame = 1;
      }
      targetFrame = currentFrame;
      renderFrame(Math.round(currentFrame));

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (currentFrame - 1) / (totalFrames - 1);
      window.scrollTo({ top: progress * docHeight, behavior: "auto" });

      playAnimationId = requestAnimationFrame(step);
    }
    playAnimationId = requestAnimationFrame(step);
  }

  function stopAutoPlay() {
    if (playAnimationId) {
      cancelAnimationFrame(playAnimationId);
      playAnimationId = null;
    }
  }

  // Touch and Click support for Scrubber
  if (hudScrubberTrack) {
    function seekFromEvent(e) {
      const rect = hudScrubberTrack.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      window.scrollTo({
        top: pct * docHeight,
        behavior: "smooth"
      });
    }

    hudScrubberTrack.addEventListener("click", seekFromEvent);
    hudScrubberTrack.addEventListener("touchmove", seekFromEvent, { passive: true });
  }
}

/* ==========================================================================
   MULTI-DEVICE RESPONSIVE NAVIGATION & DRAWER
   ========================================================================== */
function initResponsiveNavigation() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const drawerClose = document.getElementById("drawerClose");
  const drawerLinks = document.querySelectorAll(".drawer-link");

  function openDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add("open");
    if (drawerBackdrop) drawerBackdrop.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scroll when menu is open
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove("open");
    if (drawerBackdrop) drawerBackdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  // Dynamic WhatsApp ordering for menu cards
  const menuOrderBtns = document.querySelectorAll(".menu-order-btn");
  menuOrderBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const bowlTitle = btn.getAttribute("data-bowl-title") || "Protein Bowl";
      const bowlPrice = btn.getAttribute("data-bowl-price") || "₹210";
      const msg = 
        `Hello MCK Bhojan! 👋\n\n` +
        `I would like to order the *${bowlTitle}* (${bowlPrice}).\n\n` +
        `Please confirm delivery time to my location!`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  });

  // Dynamic WhatsApp ordering for Subscription Plans
  const planBtns = document.querySelectorAll(".plan-select-btn");
  planBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const planName = btn.getAttribute("data-plan-name") || "Meal Subscription";
      const planPrice = btn.getAttribute("data-plan-price") || "";
      const msg = 
        `Hello MCK Bhojan! 🌿\n\n` +
        `I want to subscribe to the *${planName}* (${planPrice}).\n\n` +
        `Please share the upcoming weekly rotation menu and delivery slots!`;

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    });
  });
}
