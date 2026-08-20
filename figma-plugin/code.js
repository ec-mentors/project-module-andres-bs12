// NutritionTracker Design System & Screens Sync Plugin for Figma
// Generates the exact Design System, Atomic Components, Mobile (390px) & Desktop (1440px) Screens

(async function main() {
  console.log("Starting NutritionTracker Figma Sync...");

  try {
    // 1. Load Fonts
    const fonts = [
      { family: "Inter", style: "Regular" },
      { family: "Inter", style: "Medium" },
      { family: "Inter", style: "Semi Bold" },
      { family: "Inter", style: "Bold" },
      { family: "Inter", style: "Black" },
    ];

    for (const font of fonts) {
      try {
        await figma.loadFontAsync(font);
      } catch (e) {
        console.warn("Could not load font:", font, e);
      }
    }

    // 2. Color & Geometry Helpers
    function hexToRgb(hex) {
      let clean = hex.replace("#", "");
      if (clean.length === 3) {
        clean = clean.split("").map(c => c + c).join("");
      }
      const num = parseInt(clean, 16);
      return {
        r: ((num >> 16) & 255) / 255,
        g: ((num >> 8) & 255) / 255,
        b: (num & 255) / 255,
      };
    }

    function solidPaint(hex, opacity = 1) {
      return [{ type: "SOLID", color: hexToRgb(hex), opacity }];
    }

    // Helper to create styled text
    function createText(text, size = 14, weight = "Regular", colorHex = "#ffffff", opacity = 1) {
      const t = figma.createText();
      t.fontName = { family: "Inter", style: weight };
      t.fontSize = size;
      t.characters = String(text);
      t.fills = solidPaint(colorHex, opacity);
      t.textAutoResize = "WIDTH_AND_HEIGHT";
      return t;
    }

    // Helper to create wrapping paragraph text
    function createParagraph(text, width = 400, size = 13, weight = "Regular", colorHex = "#ffffff", opacity = 1) {
      const t = figma.createText();
      t.fontName = { family: "Inter", style: weight };
      t.fontSize = size;
      t.characters = String(text);
      t.fills = solidPaint(colorHex, opacity);
      t.resize(width, 10);
      t.textAutoResize = "HEIGHT";
      return t;
    }

    // 3. Find or Create Target Page
    let page = figma.root.children.find(p => p.name === "✨ CaloriesTrack v4.0 (Sync)");
    if (!page) {
      page = figma.createPage();
      page.name = "✨ CaloriesTrack v4.0 (Sync)";
    }
    figma.currentPage = page;

    // Clear previous sync elements on this page if re-running
    for (const child of [...page.children]) {
      child.remove();
    }

    console.log("Building Design System & Screens on page:", page.name);

    let currentX = 0;
    const SECTION_GAP = 100;

    // ----------------------------------------------------
    // SECTION 1: FOUNDATIONS & DESIGN TOKENS
    // ----------------------------------------------------
    const secFoundations = figma.createFrame();
    secFoundations.name = "00. Foundations & Design Tokens";
    secFoundations.x = currentX;
    secFoundations.y = 0;
    secFoundations.layoutMode = "VERTICAL";
    secFoundations.itemSpacing = 32;
    secFoundations.paddingLeft = 48;
    secFoundations.paddingRight = 48;
    secFoundations.paddingTop = 48;
    secFoundations.paddingBottom = 48;
    secFoundations.fills = solidPaint("#0a0614");
    secFoundations.cornerRadius = 24;
    secFoundations.counterAxisSizingMode = "AUTO";

    // Section Header
    secFoundations.appendChild(createText("00. Foundations & Tokens", 28, "Bold", "#ffffff"));
    secFoundations.appendChild(createText("Color Palette, Typography Hierarchy, Radii, Shadows & Macro Colors", 14, "Medium", "#94a3b8"));

    // Color Swatches Row
    const swatchesRow = figma.createFrame();
    swatchesRow.name = "Color Tokens Grid";
    swatchesRow.layoutMode = "HORIZONTAL";
    swatchesRow.itemSpacing = 16;
    swatchesRow.fills = [];

    const tokenList = [
      { name: "Brand Primary (Light)", hex: "#000000", desc: "Monochrome Black Primary" },
      { name: "Brand Primary (Dark)", hex: "#ffffff", desc: "Monochrome White Primary" },
      { name: "Dark Canvas", hex: "#080808", desc: "Dark Mode Background" },
      { name: "Dark Panel", hex: "#121214", desc: "Dark Mode Card Surface" },
      { name: "Light Canvas", hex: "#f8fafc", desc: "Light Mode Background" },
      { name: "Light Panel", hex: "#ffffff", desc: "Light Mode Card Surface" },
      { name: "Protein (Violet)", hex: "#8b5cf6", desc: "Protein Macro" },
      { name: "Carbs (Amber)", hex: "#f59e0b", desc: "Carbs Macro" },
      { name: "Fat (Cyan)", hex: "#06b6d4", desc: "Fat Macro" },
      { name: "Calories (Orange)", hex: "#f97316", desc: "Calories Macro" }
    ];

    for (const tok of tokenList) {
      const card = figma.createFrame();
      card.name = tok.name;
      card.layoutMode = "VERTICAL";
      card.itemSpacing = 8;
      card.paddingLeft = 12;
      card.paddingRight = 12;
      card.paddingTop = 12;
      card.paddingBottom = 12;
      card.fills = solidPaint("#161024");
      card.cornerRadius = 16;
      card.strokes = solidPaint("#ffffff", 0.1);
      card.strokeWeight = 1;

      const swatch = figma.createFrame();
      swatch.resize(100, 56);
      swatch.fills = solidPaint(tok.hex);
      swatch.cornerRadius = 10;
      card.appendChild(swatch);

      card.appendChild(createText(tok.name, 12, "Bold", "#ffffff"));
      card.appendChild(createText(tok.hex, 11, "Medium", "#94a3b8"));
      swatchesRow.appendChild(card);
    }
    secFoundations.appendChild(swatchesRow);
    page.appendChild(secFoundations);

    currentX += secFoundations.width + SECTION_GAP;

    // ----------------------------------------------------
    // SECTION 2: ATOMIC DESIGN SYSTEM COMPONENTS
    // ----------------------------------------------------
    const secComponents = figma.createFrame();
    secComponents.name = "01. Component Library (Atoms, Molecules, Organisms)";
    secComponents.x = currentX;
    secComponents.y = 0;
    secComponents.layoutMode = "VERTICAL";
    secComponents.itemSpacing = 32;
    secComponents.paddingLeft = 48;
    secComponents.paddingRight = 48;
    secComponents.paddingTop = 48;
    secComponents.paddingBottom = 48;
    secComponents.fills = solidPaint("#0a0614");
    secComponents.cornerRadius = 24;
    secComponents.counterAxisSizingMode = "AUTO";

    secComponents.appendChild(createText("01. Component Library & Variants", 28, "Bold", "#ffffff"));
    secComponents.appendChild(createText("Ready-to-use AutoLayout components with Dark/Light & State variants", 14, "Medium", "#94a3b8"));

    // COMPONENT 1: Header Nav
    function buildHeaderNav(theme = "dark", activeTab = "today", isComponent = false, width = 1344) {
      const isLight = theme === "light";
      const header = isComponent ? figma.createComponent() : figma.createFrame();
      header.name = `Header / Nav (${theme.toUpperCase()}, Tab=${activeTab})`;
      header.layoutMode = "HORIZONTAL";
      header.primaryAxisAlignItems = "SPACE_BETWEEN";
      header.counterAxisAlignItems = "CENTER";
      header.paddingLeft = 24;
      header.paddingRight = 24;
      header.paddingTop = 10;
      header.paddingBottom = 10;
      header.cornerRadius = 9999;
      header.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      header.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.12);
      header.strokeWeight = 1;
      header.resize(width, 60);
      header.effects = [
        {
          type: "DROP_SHADOW",
          color: { r: 0, g: 0, b: 0, a: isLight ? 0.05 : 0.4 },
          offset: { x: 0, y: 4 },
          radius: 16,
          spread: 0,
          visible: true,
          blendMode: "NORMAL"
        }
      ];

      // Left: Logo & Brand
      const logoRow = figma.createFrame();
      logoRow.layoutMode = "HORIZONTAL";
      logoRow.itemSpacing = 10;
      logoRow.counterAxisAlignItems = "CENTER";
      logoRow.fills = [];
      
      const logoIcon = figma.createFrame();
      logoIcon.resize(34, 34);
      logoIcon.cornerRadius = 12;
      logoIcon.fills = solidPaint(isLight ? "#000000" : "#ffffff");
      logoIcon.layoutMode = "HORIZONTAL";
      logoIcon.primaryAxisAlignItems = "CENTER";
      logoIcon.counterAxisAlignItems = "CENTER";
      logoIcon.appendChild(createText("⚡", 15, "Bold", isLight ? "#ffffff" : "#000000"));
      logoRow.appendChild(logoIcon);

      const brandCol = figma.createFrame();
      brandCol.layoutMode = "VERTICAL";
      brandCol.itemSpacing = 1;
      brandCol.fills = [];
      brandCol.appendChild(createText("NutritionTracker", 15, "Black", isLight ? "#0f172a" : "#ffffff"));
      brandCol.appendChild(createText("AI PERSONAL COACH", 9, "Bold", isLight ? "#475569" : "#94a3b8"));
      logoRow.appendChild(brandCol);
      header.appendChild(logoRow);

      // Center: Segmented Track
      const track = figma.createFrame();
      track.layoutMode = "HORIZONTAL";
      track.itemSpacing = 4;
      track.paddingLeft = 4;
      track.paddingRight = 4;
      track.paddingTop = 4;
      track.paddingBottom = 4;
      track.cornerRadius = 9999;
      track.fills = solidPaint(isLight ? "#f1f5f9" : "#0a0714");
      track.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", isLight ? 0.7 : 0.15);
      track.strokeWeight = 1;

      // Today Button
      const todayBtn = figma.createFrame();
      todayBtn.layoutMode = "HORIZONTAL";
      todayBtn.primaryAxisAlignItems = "CENTER";
      todayBtn.counterAxisAlignItems = "CENTER";
      todayBtn.paddingLeft = 18;
      todayBtn.paddingRight = 18;
      todayBtn.paddingTop = 8;
      todayBtn.paddingBottom = 8;
      todayBtn.cornerRadius = 9999;
      todayBtn.fills = activeTab === "today" ? solidPaint(isLight ? "#000000" : "#ffffff") : [];
      todayBtn.appendChild(createText("✨ Today (Chat)", 13, "Bold", activeTab === "today" ? (isLight ? "#ffffff" : "#000000") : (isLight ? "#475569" : "#94a3b8")));
      track.appendChild(todayBtn);

      // Overview Button
      const overviewBtn = figma.createFrame();
      overviewBtn.layoutMode = "HORIZONTAL";
      overviewBtn.primaryAxisAlignItems = "CENTER";
      overviewBtn.counterAxisAlignItems = "CENTER";
      overviewBtn.paddingLeft = 18;
      overviewBtn.paddingRight = 18;
      overviewBtn.paddingTop = 8;
      overviewBtn.paddingBottom = 8;
      overviewBtn.cornerRadius = 9999;
      overviewBtn.fills = activeTab === "overview" ? solidPaint(isLight ? "#000000" : "#ffffff") : [];
      overviewBtn.appendChild(createText("📊 Overview", 13, "Bold", activeTab === "overview" ? (isLight ? "#ffffff" : "#000000") : (isLight ? "#475569" : "#94a3b8")));
      track.appendChild(overviewBtn);

      header.appendChild(track);

      // Right: Action buttons (Set Goals + Theme Toggle + Profile Avatar)
      const rightActions = figma.createFrame();
      rightActions.layoutMode = "HORIZONTAL";
      rightActions.itemSpacing = 8;
      rightActions.counterAxisAlignItems = "CENTER";
      rightActions.fills = [];

      // Set Goals Button
      const goalsBtn = figma.createFrame();
      goalsBtn.layoutMode = "HORIZONTAL";
      goalsBtn.primaryAxisAlignItems = "CENTER";
      goalsBtn.counterAxisAlignItems = "CENTER";
      goalsBtn.itemSpacing = 6;
      goalsBtn.paddingLeft = 14;
      goalsBtn.paddingRight = 14;
      goalsBtn.paddingTop = 8;
      goalsBtn.paddingBottom = 8;
      goalsBtn.cornerRadius = 9999;
      goalsBtn.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      goalsBtn.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", isLight ? 0.8 : 0.15);
      goalsBtn.strokeWeight = 1;
      goalsBtn.appendChild(createText("Set goals", 12, "Bold", isLight ? "#0f172a" : "#ffffff"));
      rightActions.appendChild(goalsBtn);

      // Theme Toggle
      const themeBtn = figma.createFrame();
      themeBtn.resize(36, 36);
      themeBtn.layoutMode = "HORIZONTAL";
      themeBtn.primaryAxisAlignItems = "CENTER";
      themeBtn.counterAxisAlignItems = "CENTER";
      themeBtn.cornerRadius = 9999;
      themeBtn.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      themeBtn.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", isLight ? 0.8 : 0.15);
      themeBtn.strokeWeight = 1;
      themeBtn.appendChild(createText(isLight ? "☀️" : "🌙", 14, "Regular", isLight ? "#0f172a" : "#ffffff"));
      rightActions.appendChild(themeBtn);

      // Profile Button
      const profileBtn = figma.createFrame();
      profileBtn.resize(36, 36);
      profileBtn.layoutMode = "HORIZONTAL";
      profileBtn.primaryAxisAlignItems = "CENTER";
      profileBtn.counterAxisAlignItems = "CENTER";
      profileBtn.cornerRadius = 9999;
      profileBtn.fills = solidPaint(isLight ? "#000000" : "#ffffff");
      profileBtn.appendChild(createText("AB", 12, "Bold", isLight ? "#ffffff" : "#000000"));
      rightActions.appendChild(profileBtn);

      header.appendChild(rightActions);

      return header;
    }

    // COMPONENT 2: Donut Macro Ring
    function buildMacroDonut(label, percent, value, unit, status = "met", theme = "dark", isComponent = false) {
      const isLight = theme === "light";
      const box = isComponent ? figma.createComponent() : figma.createFrame();
      box.name = `Macro Donut / ${label} (${status.toUpperCase()})`;
      box.layoutMode = "VERTICAL";
      box.primaryAxisAlignItems = "CENTER";
      box.counterAxisAlignItems = "CENTER";
      box.itemSpacing = 6;
      box.paddingLeft = 12;
      box.paddingRight = 12;
      box.paddingTop = 12;
      box.paddingBottom = 12;
      box.cornerRadius = 18;
      box.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      box.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      box.strokeWeight = 1;
      box.resize(100, 140);

      // Label
      box.appendChild(createText(label, 11, "Bold", isLight ? "#0f172a" : "#f1f5f9"));

      // Donut Visual Ring
      const donutFrame = figma.createFrame();
      donutFrame.resize(48, 48);
      donutFrame.fills = [];
      
      const bgCircle = figma.createEllipse();
      bgCircle.resize(44, 44);
      bgCircle.x = 2;
      bgCircle.y = 2;
      bgCircle.fills = [];
      bgCircle.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", 0.15);
      bgCircle.strokeWeight = 4;
      donutFrame.appendChild(bgCircle);

      let ringColor = isLight ? "#000000" : "#ffffff";
      if (status === "exceeded") ringColor = "#ef233c";
      else if (status === "inprogress") ringColor = isLight ? "#94a3b8" : "#475569";

      const activeRing = figma.createEllipse();
      activeRing.resize(44, 44);
      activeRing.x = 2;
      activeRing.y = 2;
      activeRing.fills = [];
      activeRing.strokes = solidPaint(ringColor);
      activeRing.strokeWeight = 4;
      donutFrame.appendChild(activeRing);

      box.appendChild(donutFrame);

      // Percentage & Amount
      box.appendChild(createText(`${percent}%`, 13, "Black", isLight ? "#0f172a" : "#ffffff"));
      box.appendChild(createText(`${value}${unit}`, 11, "Bold", isLight ? "#475569" : "#94a3b8"));

      return box;
    }

    // COMPONENT 3: Meal Card
    function buildMealCard(name, kcal, prot, carbs, fat, source = "Manual", theme = "dark", isComponent = false) {
      const isLight = theme === "light";
      const card = isComponent ? figma.createComponent() : figma.createFrame();
      card.name = `Meal Card / ${name}`;
      card.layoutMode = "VERTICAL";
      card.itemSpacing = 12;
      card.paddingLeft = 16;
      card.paddingRight = 16;
      card.paddingTop = 14;
      card.paddingBottom = 14;
      card.cornerRadius = 20;
      card.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      card.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      card.strokeWeight = 1;
      card.resize(320, 126);

      // Header line
      const headerRow = figma.createFrame();
      headerRow.layoutMode = "HORIZONTAL";
      headerRow.primaryAxisAlignItems = "SPACE_BETWEEN";
      headerRow.counterAxisAlignItems = "CENTER";
      headerRow.fills = [];
      headerRow.resize(288, 22);

      const titleCol = figma.createFrame();
      titleCol.layoutMode = "VERTICAL";
      titleCol.fills = [];
      titleCol.appendChild(createText(name, 14, "Bold", isLight ? "#0f172a" : "#ffffff"));
      titleCol.appendChild(createText(source.toUpperCase(), 9, "Bold", isLight ? "#64748b" : "#94a3b8"));
      headerRow.appendChild(titleCol);

      const actionIcons = figma.createFrame();
      actionIcons.layoutMode = "HORIZONTAL";
      actionIcons.itemSpacing = 8;
      actionIcons.fills = [];
      actionIcons.appendChild(createText("✏️", 12, "Regular", "#ffffff"));
      actionIcons.appendChild(createText("🗑️", 12, "Regular", "#ffffff"));
      headerRow.appendChild(actionIcons);

      card.appendChild(headerRow);

      // 4-Macro Grid
      const grid = figma.createFrame();
      grid.layoutMode = "HORIZONTAL";
      grid.itemSpacing = 6;
      grid.fills = [];
      grid.resize(288, 48);

      const macros = [
        { label: "Kcal", val: kcal },
        { label: "Prot", val: `${prot}g` },
        { label: "Carbs", val: `${carbs}g` },
        { label: "Fat", val: `${fat}g` },
      ];

      for (const m of macros) {
        const pill = figma.createFrame();
        pill.layoutMode = "VERTICAL";
        pill.primaryAxisAlignItems = "CENTER";
        pill.counterAxisAlignItems = "CENTER";
        pill.paddingTop = 6;
        pill.paddingBottom = 6;
        pill.cornerRadius = 10;
        pill.fills = solidPaint(isLight ? "#ffffff" : "#161024");
        pill.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.06);
        pill.strokeWeight = 1;
           pill.appendChild(createText(String(m.val), 12, "Bold", isLight ? "#0f172a" : "#ffffff"));
        pill.appendChild(createText(m.label, 9, "Bold", isLight ? "#64748b" : "#94a3b8"));
        grid.appendChild(pill);
      }
      card.appendChild(grid);

      return card;
    }

    // COMPONENT 4: Sticky Macro KPI Bar
    function buildStickyMacroBar(kcal = 1430, goalKcal = 2100, prot = 105, goalProt = 160, carbs = 130, goalCarbs = 220, fat = 42, goalFat = 65, theme = "dark", isComponent = false, width = 840) {
      const isLight = theme === "light";
      const bar = isComponent ? figma.createComponent() : figma.createFrame();
      bar.name = `Sticky Macro Bar (${theme.toUpperCase()})`;
      bar.layoutMode = "HORIZONTAL";
      bar.primaryAxisAlignItems = "SPACE_BETWEEN";
      bar.counterAxisAlignItems = "CENTER";
      bar.paddingLeft = 24;
      bar.paddingRight = 24;
      bar.paddingTop = 16;
      bar.paddingBottom = 16;
      bar.cornerRadius = 24;
      bar.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      bar.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      bar.strokeWeight = 1;
      bar.resize(width, 84);

      // Left: Calorie Budget with Donut
      const leftCol = figma.createFrame();
      leftCol.layoutMode = "HORIZONTAL";
      leftCol.counterAxisAlignItems = "CENTER";
      leftCol.itemSpacing = 16;
      leftCol.fills = [];

      const donutBox = figma.createFrame();
      donutBox.resize(48, 48);
      donutBox.fills = [];
      const bgCircle = figma.createEllipse();
      bgCircle.resize(44, 44);
      bgCircle.x = 2;
      bgCircle.y = 2;
      bgCircle.fills = [];
      bgCircle.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", 0.15);
      bgCircle.strokeWeight = 4;
      donutBox.appendChild(bgCircle);

      const activeRing = figma.createEllipse();
      activeRing.resize(44, 44);
      activeRing.x = 2;
      activeRing.y = 2;
      activeRing.fills = [];
      activeRing.strokes = solidPaint("#f97316");
      activeRing.strokeWeight = 4;
      donutBox.appendChild(activeRing);

      const pctText = createText("68%", 11, "Black", isLight ? "#0f172a" : "#ffffff");
      pctText.x = 12;
      pctText.y = 17;
      donutBox.appendChild(pctText);
      leftCol.appendChild(donutBox);

      const kcalInfo = figma.createFrame();
      kcalInfo.layoutMode = "VERTICAL";
      kcalInfo.itemSpacing = 4;
      kcalInfo.fills = [];
      
      const numRow = figma.createFrame();
      numRow.layoutMode = "HORIZONTAL";
      numRow.itemSpacing = 8;
      numRow.counterAxisAlignItems = "BASELINE";
      numRow.fills = [];
      numRow.appendChild(createText(`${kcal}`, 22, "Black", isLight ? "#0f172a" : "#ffffff"));
      numRow.appendChild(createText(`/ ${goalKcal} Kcal`, 13, "Bold", isLight ? "#64748b" : "#94a3b8"));
      
      const leftBadge = figma.createFrame();
      leftBadge.paddingLeft = 8;
      leftBadge.paddingRight = 8;
      leftBadge.paddingTop = 2;
      leftBadge.paddingBottom = 2;
      leftBadge.cornerRadius = 9999;
      leftBadge.fills = solidPaint("#f97316", 0.2);
      leftBadge.appendChild(createText(`${goalKcal - kcal} Kcal Left`, 10, "Bold", isLight ? "#ea580c" : "#fb923c"));
      numRow.appendChild(leftBadge);
      kcalInfo.appendChild(numRow);
      kcalInfo.appendChild(createText("Today, Thursday Aug 20", 11, "Medium", isLight ? "#64748b" : "#94a3b8"));
      leftCol.appendChild(kcalInfo);
      bar.appendChild(leftCol);

      // Right: 3 Macro Pill meters
      const macroGrid = figma.createFrame();
      macroGrid.layoutMode = "HORIZONTAL";
      macroGrid.itemSpacing = 10;
      macroGrid.fills = [];

      const macros = [
        { name: "PROTEIN", val: prot, goal: goalProt, color: "#8b5cf6", pct: Math.round((prot/goalProt)*100) },
        { name: "CARBS", val: carbs, goal: goalCarbs, color: "#f59e0b", pct: Math.round((carbs/goalCarbs)*100) },
        { name: "FAT", val: fat, goal: goalFat, color: "#06b6d4", pct: Math.round((fat/goalFat)*100) },
      ];

      for (const m of macros) {
        const pill = figma.createFrame();
        pill.layoutMode = "VERTICAL";
        pill.primaryAxisAlignItems = "CENTER";
        pill.itemSpacing = 4;
        pill.paddingLeft = 14;
        pill.paddingRight = 14;
        pill.paddingTop = 8;
        pill.paddingBottom = 8;
        pill.cornerRadius = 16;
        pill.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
        pill.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.08);
        pill.strokeWeight = 1;
        pill.resize(96, 56);

        pill.appendChild(createText(m.name, 9, "Bold", isLight ? "#64748b" : "#94a3b8"));
        pill.appendChild(createText(`${m.val}/${m.goal}g`, 11, "Bold", isLight ? "#0f172a" : "#ffffff"));
        
        const track = figma.createFrame();
        track.resize(68, 4);
        track.cornerRadius = 9999;
        track.fills = solidPaint(isLight ? "#cbd5e1" : "#ffffff", 0.15);
        const fill = figma.createFrame();
        fill.resize(Math.round(68 * (m.pct/100)), 4);
        fill.cornerRadius = 9999;
        fill.fills = solidPaint(m.color);
        track.appendChild(fill);
        pill.appendChild(track);
        macroGrid.appendChild(pill);
      }
      bar.appendChild(macroGrid);

      return bar;
    }

    // COMPONENT 5: Chat Voice Memo Bubble
    function buildChatVoiceBubble(text = "Me comí dos huevos revueltos con una rebanada de pan tostado y café negro.", duration = "0:06", time = "08:45 AM", theme = "dark", isComponent = false, width = 440) {
      const isLight = theme === "light";
      const bubble = isComponent ? figma.createComponent() : figma.createFrame();
      bubble.name = `Chat / User Voice Memo (${theme.toUpperCase()})`;
      bubble.layoutMode = "VERTICAL";
      bubble.itemSpacing = 10;
      bubble.paddingLeft = 18;
      bubble.paddingRight = 18;
      bubble.paddingTop = 14;
      bubble.paddingBottom = 14;
      bubble.cornerRadius = 22;
      bubble.fills = solidPaint(isLight ? "#000000" : "#ffffff");
      bubble.resize(width, 114);

      // Player row
      const pRow = figma.createFrame();
      pRow.layoutMode = "HORIZONTAL";
      pRow.primaryAxisAlignItems = "SPACE_BETWEEN";
      pRow.counterAxisAlignItems = "CENTER";
      pRow.fills = [];
      pRow.resize(width - 36, 32);

      const playBox = figma.createFrame();
      playBox.layoutMode = "HORIZONTAL";
      playBox.itemSpacing = 10;
      playBox.counterAxisAlignItems = "CENTER";
      playBox.fills = [];

      const playBtn = figma.createFrame();
      playBtn.resize(28, 28);
      playBtn.cornerRadius = 9999;
      playBtn.fills = solidPaint(isLight ? "#ffffff" : "#000000");
      playBtn.layoutMode = "HORIZONTAL";
      playBtn.primaryAxisAlignItems = "CENTER";
      playBtn.counterAxisAlignItems = "CENTER";
      playBtn.appendChild(createText("▶", 10, "Bold", isLight ? "#000000" : "#ffffff"));
      playBox.appendChild(playBtn);

      const wave = figma.createFrame();
      wave.layoutMode = "HORIZONTAL";
      wave.counterAxisAlignItems = "CENTER";
      wave.itemSpacing = 3;
      wave.fills = [];

      const heights = [6, 12, 18, 10, 16, 20, 14, 8, 16, 12, 18, 14, 8, 16, 10, 6];
      for (const h of heights) {
        const bar = figma.createFrame();
        bar.resize(3, h);
        bar.cornerRadius = 9999;
        bar.fills = solidPaint(isLight ? "#ffffff" : "#000000", 0.85);
        wave.appendChild(bar);
      }
      playBox.appendChild(wave);
      pRow.appendChild(playBox);
      pRow.appendChild(createText(duration, 11, "Bold", isLight ? "#ffffff" : "#000000"));
      bubble.appendChild(pRow);

      // Transcribed text
      const tBox = figma.createFrame();
      tBox.layoutMode = "HORIZONTAL";
      tBox.paddingLeft = 12;
      tBox.paddingRight = 12;
      tBox.paddingTop = 8;
      tBox.paddingBottom = 8;
      tBox.cornerRadius = 12;
      tBox.fills = solidPaint(isLight ? "#ffffff" : "#000000", 0.2);
      tBox.resize(width - 36, 32);
      tBox.appendChild(createText(`🎙️ "${text}"`, 11, "Medium", isLight ? "#ffffff" : "#000000"));
      bubble.appendChild(tBox);

      const footer = figma.createFrame();
      footer.layoutMode = "HORIZONTAL";
      footer.primaryAxisAlignItems = "MAX";
      footer.fills = [];
      footer.resize(width - 36, 14);
      footer.appendChild(createText(`${time} • Voice Memo`, 9, "Regular", isLight ? "#ffffff" : "#000000", 0.8));
      bubble.appendChild(footer);

      return bubble;
    }

    // COMPONENT 6: Chat Photo Bubble
    function buildChatPhotoBubble(caption = "Bowl de ensalada con pollo y quinoa.", time = "02:15 PM", theme = "dark", isComponent = false, width = 360) {
      const isLight = theme === "light";
      const bubble = isComponent ? figma.createComponent() : figma.createFrame();
      bubble.name = `Chat / User Photo Bubble (${theme.toUpperCase()})`;
      bubble.layoutMode = "VERTICAL";
      bubble.itemSpacing = 10;
      bubble.paddingLeft = 16;
      bubble.paddingRight = 16;
      bubble.paddingTop = 16;
      bubble.paddingBottom = 14;
      bubble.cornerRadius = 22;
      bubble.fills = solidPaint(isLight ? "#000000" : "#ffffff");
      bubble.resize(width, 210);

      const photoBox = figma.createFrame();
      photoBox.resize(width - 32, 130);
      photoBox.cornerRadius = 14;
      photoBox.fills = solidPaint(isLight ? "#1e293b" : "#231a38");
      photoBox.strokes = solidPaint("#ffffff", 0.2);
      photoBox.strokeWeight = 1;
      photoBox.layoutMode = "VERTICAL";
      photoBox.primaryAxisAlignItems = "CENTER";
      photoBox.counterAxisAlignItems = "CENTER";
      photoBox.itemSpacing = 8;
      photoBox.appendChild(createText("🥗", 28, "Regular", "#ffffff"));
      photoBox.appendChild(createText("Bowl de Pollo, Quinoa & Aguacate", 12, "Bold", "#ffffff"));
      bubble.appendChild(photoBox);

      bubble.appendChild(createText(`"${caption}"`, 12, "Medium", isLight ? "#ffffff" : "#000000"));

      const footer = figma.createFrame();
      footer.layoutMode = "HORIZONTAL";
      footer.primaryAxisAlignItems = "MAX";
      footer.fills = [];
      footer.resize(width - 32, 14);
      footer.appendChild(createText(`${time} • Photo AI Scan`, 9, "Regular", isLight ? "#ffffff" : "#000000", 0.8));
      bubble.appendChild(footer);

      return bubble;
    }

    // COMPONENT 7: AI Rich Meal Response Card
    function buildAiMealCardRich(name = "Huevos Revueltos con Tostada", kcal = 360, prot = 20, carbs = 24, fat = 16, rationale = "Estimamos 2 huevos talla L cocinados con poco aceite y 1 rebanada de pan integral (30g).", status = "Desayuno Registrado", theme = "dark", isComponent = false, width = 540) {
      const isLight = theme === "light";
      const card = isComponent ? figma.createComponent() : figma.createFrame();
      card.name = `Chat / AI Meal Response (${theme.toUpperCase()})`;
      card.layoutMode = "VERTICAL";
      card.itemSpacing = 14;
      card.paddingLeft = 24;
      card.paddingRight = 24;
      card.paddingTop = 20;
      card.paddingBottom = 20;
      card.cornerRadius = 24;
      card.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      card.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      card.strokeWeight = 1;
      card.resize(width, 240);

      // Header row
      const hRow = figma.createFrame();
      hRow.layoutMode = "HORIZONTAL";
      hRow.primaryAxisAlignItems = "SPACE_BETWEEN";
      hRow.counterAxisAlignItems = "CENTER";
      hRow.fills = [];
      hRow.resize(width - 48, 36);

      const titleCol = figma.createFrame();
      titleCol.layoutMode = "VERTICAL";
      titleCol.itemSpacing = 2;
      titleCol.fills = [];
      titleCol.appendChild(createText(name, 16, "Bold", isLight ? "#0f172a" : "#ffffff"));
      titleCol.appendChild(createText(status.toUpperCase(), 10, "Bold", isLight ? "#64748b" : "#94a3b8"));
      hRow.appendChild(titleCol);

      const badge = figma.createFrame();
      badge.paddingLeft = 14;
      badge.paddingRight = 14;
      badge.paddingTop = 6;
      badge.paddingBottom = 6;
      badge.cornerRadius = 12;
      badge.fills = solidPaint("#f97316", 0.15);
      badge.strokes = solidPaint("#f97316", 0.3);
      badge.strokeWeight = 1;
      badge.appendChild(createText(`${kcal} Kcal`, 13, "Black", isLight ? "#ea580c" : "#fb923c"));
      hRow.appendChild(badge);
      card.appendChild(hRow);

      // 4-Macro Grid
      const grid = figma.createFrame();
      grid.layoutMode = "HORIZONTAL";
      grid.itemSpacing = 8;
      grid.fills = [];
      grid.resize(width - 48, 54);

      const macros = [
        { label: "Kcal", val: kcal },
        { label: "Prot", val: `${prot}g` },
        { label: "Carb", val: `${carbs}g` },
        { label: "Fat", val: `${fat}g` },
      ];

      const pillWidth = Math.floor((width - 48 - 24) / 4);
      for (const m of macros) {
        const pill = figma.createFrame();
        pill.layoutMode = "VERTICAL";
        pill.primaryAxisAlignItems = "CENTER";
        pill.counterAxisAlignItems = "CENTER";
        pill.itemSpacing = 2;
        pill.paddingTop = 8;
        pill.paddingBottom = 8;
        pill.cornerRadius = 14;
        pill.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
        pill.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.08);
        pill.strokeWeight = 1;
        pill.resize(pillWidth, 54);

        pill.appendChild(createText(String(m.val), 14, "Bold", isLight ? "#0f172a" : "#ffffff"));
        pill.appendChild(createText(m.label, 10, "Bold", isLight ? "#64748b" : "#94a3b8"));
        grid.appendChild(pill);
      }
      card.appendChild(grid);

      // Coach Note
      const noteBox = figma.createFrame();
      noteBox.layoutMode = "HORIZONTAL";
      noteBox.paddingLeft = 14;
      noteBox.paddingRight = 14;
      noteBox.paddingTop = 10;
      noteBox.paddingBottom = 10;
      noteBox.cornerRadius = 14;
      noteBox.fills = solidPaint(isLight ? "#f8fafc" : "#ffffff", isLight ? 1 : 0.05);
      noteBox.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", 0.08);
      noteBox.strokeWeight = 1;
      noteBox.resize(width - 48, 42);
      noteBox.appendChild(createParagraph(`💡 ${rationale}`, width - 76, 11, "Medium", isLight ? "#475569" : "#cbd5e1"));
      card.appendChild(noteBox);

      // Footer buttons
      const fRow = figma.createFrame();
      fRow.layoutMode = "HORIZONTAL";
      fRow.primaryAxisAlignItems = "MAX";
      fRow.itemSpacing = 10;
      fRow.fills = [];
      fRow.resize(width - 48, 32);

      const editBtn = figma.createFrame();
      editBtn.paddingLeft = 14;
      editBtn.paddingRight = 14;
      editBtn.paddingTop = 6;
      editBtn.paddingBottom = 6;
      editBtn.cornerRadius = 12;
      editBtn.fills = solidPaint(isLight ? "#f1f5f9" : "#ffffff", isLight ? 1 : 0.08);
      editBtn.appendChild(createText("✏️ Ajustar Gramos", 11, "Bold", isLight ? "#475569" : "#cbd5e1"));
      fRow.appendChild(editBtn);

      const saveBtn = figma.createFrame();
      saveBtn.paddingLeft = 16;
      saveBtn.paddingRight = 16;
      saveBtn.paddingTop = 6;
      saveBtn.paddingBottom = 6;
      saveBtn.cornerRadius = 12;
      saveBtn.fills = solidPaint("#10b981", 0.2);
      saveBtn.strokes = solidPaint("#10b981", 0.4);
      saveBtn.strokeWeight = 1;
      saveBtn.appendChild(createText("✓ Guardado en DB", 11, "Bold", "#34d399"));
      fRow.appendChild(saveBtn);

      card.appendChild(fRow);
      return card;
    }

    // COMPONENT 8: Smart Omnibar
    function buildSmartOmnibar(theme = "dark", isComponent = false, width = 840) {
      const isLight = theme === "light";
      const bar = isComponent ? figma.createComponent() : figma.createFrame();
      bar.name = `Smart Omnibar (${theme.toUpperCase()})`;
      bar.layoutMode = "HORIZONTAL";
      bar.primaryAxisAlignItems = "SPACE_BETWEEN";
      bar.counterAxisAlignItems = "CENTER";
      bar.paddingLeft = 20;
      bar.paddingRight = 10;
      bar.paddingTop = 8;
      bar.paddingBottom = 8;
      bar.cornerRadius = 24;
      bar.fills = solidPaint(isLight ? "#ffffff" : "#161024");
      bar.strokes = solidPaint(isLight ? "#000000" : "#ffffff", 0.3);
      bar.strokeWeight = 1.5;
      bar.resize(width, 58);

      bar.appendChild(createText("Escribe lo que comiste (ej: 2 tacos y 1 refresco) o habla con tu coach...", 13, "Medium", isLight ? "#94a3b8" : "#64748b"));

      const actions = figma.createFrame();
      actions.layoutMode = "HORIZONTAL";
      actions.itemSpacing = 8;
      actions.counterAxisAlignItems = "CENTER";
      actions.fills = [];

      const micBtn = figma.createFrame();
      micBtn.resize(38, 38);
      micBtn.cornerRadius = 14;
      micBtn.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      micBtn.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      micBtn.strokeWeight = 1;
      micBtn.layoutMode = "HORIZONTAL";
      micBtn.primaryAxisAlignItems = "CENTER";
      micBtn.counterAxisAlignItems = "CENTER";
      micBtn.appendChild(createText("🎙️", 14, "Regular", "#ffffff"));
      actions.appendChild(micBtn);

      const camBtn = figma.createFrame();
      camBtn.resize(38, 38);
      camBtn.cornerRadius = 14;
      camBtn.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      camBtn.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      camBtn.strokeWeight = 1;
      camBtn.layoutMode = "HORIZONTAL";
      camBtn.primaryAxisAlignItems = "CENTER";
      camBtn.counterAxisAlignItems = "CENTER";
      camBtn.appendChild(createText("📸", 14, "Regular", "#ffffff"));
      actions.appendChild(camBtn);

      const sendBtn = figma.createFrame();
      sendBtn.paddingLeft = 18;
      sendBtn.paddingRight = 18;
      sendBtn.paddingTop = 10;
      sendBtn.paddingBottom = 10;
      sendBtn.cornerRadius = 16;
      sendBtn.fills = solidPaint(isLight ? "#000000" : "#ffffff");
      sendBtn.layoutMode = "HORIZONTAL";
      sendBtn.primaryAxisAlignItems = "CENTER";
      sendBtn.counterAxisAlignItems = "CENTER";
      sendBtn.itemSpacing = 6;
      sendBtn.appendChild(createText("Enviar 🚀", 12, "Bold", isLight ? "#ffffff" : "#000000"));
      actions.appendChild(sendBtn);

      bar.appendChild(actions);
      return bar;
    }

    // Categorized Component Showcase
    const compGrid = figma.createFrame();
    compGrid.name = "Component Library Grid";
    compGrid.layoutMode = "VERTICAL";
    compGrid.itemSpacing = 24;
    compGrid.fills = [];

    // Category 1: Navigation & Headers
    const catNav = figma.createFrame();
    catNav.name = "01. Navigation & App Bar Components";
    catNav.layoutMode = "VERTICAL";
    catNav.itemSpacing = 14;
    catNav.paddingLeft = 24;
    catNav.paddingRight = 24;
    catNav.paddingTop = 20;
    catNav.paddingBottom = 20;
    catNav.cornerRadius = 20;
    catNav.fills = solidPaint("#161024");
    catNav.strokes = solidPaint("#ffffff", 0.1);
    catNav.strokeWeight = 1;
    catNav.appendChild(createText("01. Navigation & App Bar Components", 16, "Bold", "#ffffff"));
    catNav.appendChild(buildHeaderNav("dark", "today", true, 900));
    catNav.appendChild(buildHeaderNav("light", "overview", true, 900));
    catNav.appendChild(buildHeaderNav("dark", "today", true, 358));
    compGrid.appendChild(catNav);

    // Category 2: KPI & Macro Progress Meters
    const catKpi = figma.createFrame();
    catKpi.name = "02. KPI & Macro Progress Meters";
    catKpi.layoutMode = "VERTICAL";
    catKpi.itemSpacing = 14;
    catKpi.paddingLeft = 24;
    catKpi.paddingRight = 24;
    catKpi.paddingTop = 20;
    catKpi.paddingBottom = 20;
    catKpi.cornerRadius = 20;
    catKpi.fills = solidPaint("#161024");
    catKpi.strokes = solidPaint("#ffffff", 0.1);
    catKpi.strokeWeight = 1;
    catKpi.appendChild(createText("02. KPI & Macro Progress Meters", 16, "Bold", "#ffffff"));
    catKpi.appendChild(buildStickyMacroBar(1430, 2100, 105, 160, 130, 220, 42, 65, "dark", true, 840));
    catKpi.appendChild(buildStickyMacroBar(1430, 2100, 105, 160, 130, 220, 42, 65, "light", true, 840));
    catKpi.appendChild(buildStickyMacroBar(1430, 2100, 105, 160, 130, 220, 42, 65, "dark", true, 358));

    const donutsRow = figma.createFrame();
    donutsRow.layoutMode = "HORIZONTAL";
    donutsRow.itemSpacing = 16;
    donutsRow.fills = [];
    donutsRow.appendChild(buildMacroDonut("KCAL", 88, 1760, "kcal", "met", "dark", true));
    donutsRow.appendChild(buildMacroDonut("PROTEIN", 92, 138, "g", "met", "dark", true));
    donutsRow.appendChild(buildMacroDonut("FAT", 120, 78, "g", "exceeded", "dark", true));
    donutsRow.appendChild(buildMacroDonut("CARBS", 85, 170, "g", "met", "dark", true));
    catKpi.appendChild(donutsRow);
    compGrid.appendChild(catKpi);

    // Category 3: AI Chat & Multimodal Logs
    const catChat = figma.createFrame();
    catChat.name = "03. AI Chat Bubbles & Vision/Audio Cards";
    catChat.layoutMode = "VERTICAL";
    catChat.itemSpacing = 14;
    catChat.paddingLeft = 24;
    catChat.paddingRight = 24;
    catChat.paddingTop = 20;
    catChat.paddingBottom = 20;
    catChat.cornerRadius = 20;
    catChat.fills = solidPaint("#161024");
    catChat.strokes = solidPaint("#ffffff", 0.1);
    catChat.strokeWeight = 1;
    catChat.appendChild(createText("03. AI Chat Bubbles & Vision/Audio Cards", 16, "Bold", "#ffffff"));
    catChat.appendChild(buildChatVoiceBubble("Me comí dos huevos revueltos con una rebanada de pan tostado y café negro.", "0:06", "08:45 AM", "dark", true, 440));
    catChat.appendChild(buildAiMealCardRich("Huevos Revueltos con Tostada", 360, 20, 24, 16, "Estimamos 2 huevos talla L cocinados con poco aceite y 1 rebanada de pan integral (30g).", "Desayuno Registrado", "dark", true, 540));
    catChat.appendChild(buildChatPhotoBubble("Bowl de ensalada con pollo y quinoa.", "02:15 PM", "dark", true, 360));
    catChat.appendChild(buildAiMealCardRich("Bowl de Pollo, Quinoa y Aguacate", 620, 48, 52, 22, "¡Gran elección! Has cubierto el 65% de tu meta de proteína diaria. Te quedan 670 Kcal para la cena.", "Almuerzo Detectado por Visión", "dark", true, 540));
    catChat.appendChild(buildMealCard("Grilled Salmon & Asparagus", 480, 42, 12, 28, "Manual", "dark", true));
    compGrid.appendChild(catChat);

    // Category 4: Smart Omnibar & Form Inputs
    const catInput = figma.createFrame();
    catInput.name = "04. Smart Omnibar & Multimodal Input Triggers";
    catInput.layoutMode = "VERTICAL";
    catInput.itemSpacing = 14;
    catInput.paddingLeft = 24;
    catInput.paddingRight = 24;
    catInput.paddingTop = 20;
    catInput.paddingBottom = 20;
    catInput.cornerRadius = 20;
    catInput.fills = solidPaint("#161024");
    catInput.strokes = solidPaint("#ffffff", 0.1);
    catInput.strokeWeight = 1;
    catInput.appendChild(createText("04. Smart Omnibar & Multimodal Input Triggers", 16, "Bold", "#ffffff"));
    catInput.appendChild(buildSmartOmnibar("dark", true, 840));
    catInput.appendChild(buildSmartOmnibar("light", true, 840));
    catInput.appendChild(buildSmartOmnibar("dark", true, 358));
    compGrid.appendChild(catInput);

    secComponents.appendChild(compGrid);
    page.appendChild(secComponents);

    currentX += secComponents.width + SECTION_GAP;

    // ----------------------------------------------------
    // SECTION 3: MOBILE SCREENS (390 x 844 px)
    // ----------------------------------------------------
    const secMobile = figma.createFrame();
    secMobile.name = "02. Mobile Screens (390px iPhone)";
    secMobile.x = currentX;
    secMobile.y = 0;
    secMobile.layoutMode = "HORIZONTAL";
    secMobile.itemSpacing = 40;
    secMobile.paddingLeft = 48;
    secMobile.paddingRight = 48;
    secMobile.paddingTop = 48;
    secMobile.paddingBottom = 48;
    secMobile.fills = solidPaint("#0a0614");
    secMobile.cornerRadius = 24;
    secMobile.counterAxisSizingMode = "AUTO";

    function buildMobileTodayScreen(theme = "dark", state = "entries") {
      const isLight = theme === "light";
      const screen = figma.createFrame();
      screen.name = `📱 Mobile - Today (${theme.toUpperCase()}, State=${state})`;
      screen.resize(390, 844);
      screen.clipsContent = true;
      screen.cornerRadius = 44;
      screen.fills = solidPaint(isLight ? "#f8fafc" : "#05030d");
      screen.layoutMode = "VERTICAL";
      screen.itemSpacing = 16;
      screen.paddingLeft = 16;
      screen.paddingRight = 16;
      screen.paddingTop = 20;
      screen.paddingBottom = 24;

      // Header Nav
      const header = buildHeaderNav(theme, "today", false);
      header.resize(358, 52);
      screen.appendChild(header);

      // Hero Kcal Card
      const hero = figma.createFrame();
      hero.name = "Hero Kcal Card";
      hero.layoutMode = "VERTICAL";
      hero.itemSpacing = 14;
      hero.paddingLeft = 16;
      hero.paddingRight = 16;
      hero.paddingTop = 16;
      hero.paddingBottom = 16;
      hero.cornerRadius = 28;
      hero.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      hero.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      hero.strokeWeight = 1;
      hero.resize(358, 250);

      const heroTop = figma.createFrame();
      heroTop.layoutMode = "HORIZONTAL";
      heroTop.primaryAxisAlignItems = "SPACE_BETWEEN";
      heroTop.counterAxisAlignItems = "CENTER";
      heroTop.fills = [];
      heroTop.resize(326, 28);
      heroTop.appendChild(createText("DAILY PROGRESS TODAY", 11, "Bold", isLight ? "#64748b" : "#94a3b8"));
      
      const datePill = figma.createFrame();
      datePill.layoutMode = "HORIZONTAL";
      datePill.primaryAxisAlignItems = "CENTER";
      datePill.paddingLeft = 10;
      datePill.paddingRight = 10;
      datePill.paddingTop = 4;
      datePill.paddingBottom = 4;
      datePill.cornerRadius = 9999;
      datePill.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      datePill.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", isLight ? 0.8 : 0.15);
      datePill.strokeWeight = 1;
      datePill.appendChild(createText("< Today >", 11, "Bold", isLight ? "#0f172a" : "#ffffff"));
      heroTop.appendChild(datePill);
      hero.appendChild(heroTop);

      const headlineRow = figma.createFrame();
      headlineRow.layoutMode = "HORIZONTAL";
      headlineRow.itemSpacing = 10;
      headlineRow.counterAxisAlignItems = "BASELINE";
      headlineRow.fills = [];
      headlineRow.appendChild(createText("88%", 44, "Black", isLight ? "#0f172a" : "#ffffff"));
      headlineRow.appendChild(createText("In Progress", 14, "Bold", isLight ? "#64748b" : "#94a3b8"));
      hero.appendChild(headlineRow);

      hero.appendChild(createText("240 Kcal remaining (1,760 / 2,000 Kcal logged)", 11, "Medium", isLight ? "#475569" : "#94a3b8"));

      const donutRow = figma.createFrame();
      donutRow.layoutMode = "HORIZONTAL";
      donutRow.itemSpacing = 6;
      donutRow.fills = [];
      donutRow.resize(326, 110);
      donutRow.appendChild(buildMacroDonut("KCAL", 88, 1760, "", "met", theme, false));
      donutRow.appendChild(buildMacroDonut("PROT", 92, 138, "g", "met", theme, false));
      donutRow.appendChild(buildMacroDonut("FAT", 75, 49, "g", "inprogress", theme, false));
      donutRow.appendChild(buildMacroDonut("CARB", 85, 170, "g", "met", theme, false));
      hero.appendChild(donutRow);

      screen.appendChild(hero);

      // Latest Entries
      const sidebar = figma.createFrame();
      sidebar.name = "Latest Entries Card";
      sidebar.layoutMode = "VERTICAL";
      sidebar.itemSpacing = 12;
      sidebar.paddingLeft = 16;
      sidebar.paddingRight = 16;
      sidebar.paddingTop = 16;
      sidebar.paddingBottom = 16;
      sidebar.cornerRadius = 28;
      sidebar.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      sidebar.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      sidebar.strokeWeight = 1;
      sidebar.resize(358, 220);

      const sHeader = figma.createFrame();
      sHeader.layoutMode = "HORIZONTAL";
      sHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
      sHeader.counterAxisAlignItems = "CENTER";
      sHeader.fills = [];
      sHeader.resize(326, 28);
      sHeader.appendChild(createText("Latest entries", 16, "Bold", isLight ? "#0f172a" : "#ffffff"));
      
      const addBtn = figma.createFrame();
      addBtn.layoutMode = "HORIZONTAL";
      addBtn.paddingLeft = 10;
      addBtn.paddingRight = 10;
      addBtn.paddingTop = 4;
      addBtn.paddingBottom = 4;
      addBtn.cornerRadius = 9999;
      addBtn.fills = solidPaint(isLight ? "#000000" : "#ffffff");
      addBtn.appendChild(createText("+ Add meal", 11, "Bold", isLight ? "#ffffff" : "#000000"));
      sHeader.appendChild(addBtn);
      sidebar.appendChild(sHeader);

      if (state === "empty") {
        const emptyBox = figma.createFrame();
        emptyBox.layoutMode = "VERTICAL";
        emptyBox.primaryAxisAlignItems = "CENTER";
        emptyBox.counterAxisAlignItems = "CENTER";
        emptyBox.itemSpacing = 6;
        emptyBox.paddingTop = 24;
        emptyBox.paddingBottom = 24;
        emptyBox.cornerRadius = 16;
        emptyBox.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
        emptyBox.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
        emptyBox.strokeWeight = 1;
        emptyBox.resize(326, 120);
        emptyBox.appendChild(createText("No meals logged for this date", 13, "Bold", isLight ? "#0f172a" : "#ffffff"));
        emptyBox.appendChild(createText("Tap here to log your meal intake now", 11, "Medium", isLight ? "#64748b" : "#94a3b8"));
        sidebar.appendChild(emptyBox);
      } else {
        sidebar.appendChild(buildMealCard("Oatmeal & Protein Shake", 450, 40, 52, 8, "Manual", theme, false));
      }

      screen.appendChild(sidebar);

      // Consumed vs Left Card
      const tableCard = figma.createFrame();
      tableCard.name = "Consumed vs Left Card";
      tableCard.layoutMode = "VERTICAL";
      tableCard.itemSpacing = 10;
      tableCard.paddingLeft = 16;
      tableCard.paddingRight = 16;
      tableCard.paddingTop = 16;
      tableCard.paddingBottom = 16;
      tableCard.cornerRadius = 28;
      tableCard.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      tableCard.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      tableCard.strokeWeight = 1;
      tableCard.resize(358, 200);

      tableCard.appendChild(createText("Consumed vs Left", 16, "Bold", isLight ? "#0f172a" : "#ffffff"));

      const rows = [
        { nutrient: "Calories", consumed: "1,760 kcal", left: "240 kcal", pct: "88%", color: "#f97316" },
        { nutrient: "Protein", consumed: "138g", left: "12g", pct: "92%", color: "#8b5cf6" },
        { nutrient: "Fat", consumed: "49g", left: "16g", pct: "75%", color: "#06b6d4" },
      ];

      for (const r of rows) {
        const rowFrame = figma.createFrame();
        rowFrame.layoutMode = "HORIZONTAL";
        rowFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
        rowFrame.counterAxisAlignItems = "CENTER";
        rowFrame.paddingLeft = 12;
        rowFrame.paddingRight = 12;
        rowFrame.paddingTop = 8;
        rowFrame.paddingBottom = 8;
        rowFrame.cornerRadius = 14;
        rowFrame.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
        rowFrame.resize(326, 38);

        rowFrame.appendChild(createText(r.nutrient, 12, "Bold", isLight ? "#0f172a" : "#ffffff"));
        rowFrame.appendChild(createText(r.consumed, 12, "Bold", isLight ? "#0f172a" : "#ffffff"));
        rowFrame.appendChild(createText(r.left, 12, "Medium", isLight ? "#475569" : "#94a3b8"));
        rowFrame.appendChild(createText(r.pct, 12, "Bold", r.color));
        tableCard.appendChild(rowFrame);
      }

      screen.appendChild(tableCard);
      return screen;
    }

    // Mobile AI Chat Feed Screen (390 x 844 px)
    function buildMobileChatScreen(theme = "dark") {
      const isLight = theme === "light";
      const screen = figma.createFrame();
      screen.name = `📱 Mobile - Today AI Chat Feed (${theme.toUpperCase()})`;
      screen.resize(390, 844);
      screen.clipsContent = true;
      screen.cornerRadius = 36;
      screen.fills = solidPaint(isLight ? "#f8fafc" : "#090516");
      screen.layoutMode = "VERTICAL";
      screen.itemSpacing = 12;
      screen.paddingLeft = 16;
      screen.paddingRight = 16;
      screen.paddingTop = 16;
      screen.paddingBottom = 16;

      // Mobile Header
      const header = buildHeaderNav(theme, "today", false, 358);
      screen.appendChild(header);

      // Sticky Macro Bar (Mobile format: 358px)
      const macroBar = buildStickyMacroBar(1430, 2100, 105, 160, 130, 220, 42, 65, theme, false, 358);
      screen.appendChild(macroBar);

      // Chat Scroll Area
      const chatArea = figma.createFrame();
      chatArea.name = "Chat Timeline Stream";
      chatArea.layoutMode = "VERTICAL";
      chatArea.itemSpacing = 12;
      chatArea.fills = [];
      chatArea.resize(358, 540);

      // 1. Assistant Intro
      const introRow = figma.createFrame();
      introRow.layoutMode = "HORIZONTAL";
      introRow.itemSpacing = 8;
      introRow.counterAxisAlignItems = "START";
      introRow.fills = [];
      introRow.resize(358, 64);

      const aiAvatar1 = figma.createFrame();
      aiAvatar1.resize(28, 28);
      aiAvatar1.cornerRadius = 9999;
      aiAvatar1.fills = solidPaint(isLight ? "#000000" : "#ffffff", 0.1);
      aiAvatar1.strokes = solidPaint(isLight ? "#000000" : "#ffffff", 0.2);
      aiAvatar1.strokeWeight = 1;
      aiAvatar1.layoutMode = "HORIZONTAL";
      aiAvatar1.primaryAxisAlignItems = "CENTER";
      aiAvatar1.counterAxisAlignItems = "CENTER";
      aiAvatar1.appendChild(createText("✨", 12, "Regular", isLight ? "#000000" : "#ffffff"));
      introRow.appendChild(aiAvatar1);

      const introBubble = figma.createFrame();
      introBubble.layoutMode = "VERTICAL";
      introBubble.paddingLeft = 14;
      introBubble.paddingRight = 14;
      introBubble.paddingTop = 10;
      introBubble.paddingBottom = 10;
      introBubble.cornerRadius = 16;
      introBubble.fills = solidPaint(isLight ? "#ffffff" : "#161024");
      introBubble.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      introBubble.strokeWeight = 1;
      introBubble.resize(320, 64);
      introBubble.appendChild(createParagraph("¡Buenos días Andrés! ☀️ Cuéntame qué desayunaste o mándame una foto o audio para registrar tus calorías.", 292, 11, "Medium", isLight ? "#0f172a" : "#cbd5e1"));
      introRow.appendChild(introBubble);
      chatArea.appendChild(introRow);

      // 2. User Voice Memo (Right aligned)
      const uVoiceRow = figma.createFrame();
      uVoiceRow.layoutMode = "HORIZONTAL";
      uVoiceRow.primaryAxisAlignItems = "MAX";
      uVoiceRow.fills = [];
      uVoiceRow.resize(358, 114);
      const voiceBubble = buildChatVoiceBubble("Me comí dos huevos con tostada y café negro", "0:06", "08:45 AM", theme, false, 320);
      uVoiceRow.appendChild(voiceBubble);
      chatArea.appendChild(uVoiceRow);

      // 3. AI Meal Response Card (Breakfast)
      const aiRow1 = figma.createFrame();
      aiRow1.layoutMode = "HORIZONTAL";
      aiRow1.itemSpacing = 8;
      aiRow1.counterAxisAlignItems = "START";
      aiRow1.fills = [];
      aiRow1.resize(358, 230);

      const aiAvatar2 = figma.createFrame();
      aiAvatar2.resize(28, 28);
      aiAvatar2.cornerRadius = 9999;
      aiAvatar2.fills = solidPaint(isLight ? "#000000" : "#ffffff", 0.1);
      aiAvatar2.strokes = solidPaint(isLight ? "#000000" : "#ffffff", 0.2);
      aiAvatar2.strokeWeight = 1;
      aiAvatar2.layoutMode = "HORIZONTAL";
      aiAvatar2.primaryAxisAlignItems = "CENTER";
      aiAvatar2.counterAxisAlignItems = "CENTER";
      aiAvatar2.appendChild(createText("✨", 12, "Regular", isLight ? "#000000" : "#ffffff"));
      aiRow1.appendChild(aiAvatar2);

      const aiCard1 = buildAiMealCardRich("Huevos Revueltos con Tostada", 360, 20, 24, 16, "2 huevos L cocinados con poco aceite y 1 pan tostado.", "Desayuno Registrado", theme, false, 320);
      aiRow1.appendChild(aiCard1);
      chatArea.appendChild(aiRow1);

      // 4. User Photo Bubble (Right aligned)
      const uPhotoRow = figma.createFrame();
      uPhotoRow.layoutMode = "HORIZONTAL";
      uPhotoRow.primaryAxisAlignItems = "MAX";
      uPhotoRow.fills = [];
      uPhotoRow.resize(358, 190);
      const photoBubble = buildChatPhotoBubble("Bowl de ensalada con pollo", "02:15 PM", theme, false, 300);
      uPhotoRow.appendChild(photoBubble);
      chatArea.appendChild(uPhotoRow);

      screen.appendChild(chatArea);

      // Mobile Smart Omnibar at bottom
      const omnibar = buildSmartOmnibar(theme, false, 358);
      screen.appendChild(omnibar);

      return screen;
    }

    secMobile.appendChild(buildMobileChatScreen("dark"));
    secMobile.appendChild(buildMobileChatScreen("light"));
    secMobile.appendChild(buildMobileTodayScreen("dark", "entries"));
    secMobile.appendChild(buildMobileTodayScreen("dark", "empty"));
    secMobile.appendChild(buildMobileTodayScreen("light", "entries"));

    page.appendChild(secMobile);
    currentX += secMobile.width + SECTION_GAP;

    // ----------------------------------------------------
    // SECTION 4: DESKTOP SCREENS (1440 x 960 px)
    // ----------------------------------------------------
    const secDesktop = figma.createFrame();
    secDesktop.name = "03. Desktop Screens (1440px Web)";
    secDesktop.x = currentX;
    secDesktop.y = 0;
    secDesktop.layoutMode = "HORIZONTAL";
    secDesktop.itemSpacing = 40;
    secDesktop.paddingLeft = 48;
    secDesktop.paddingRight = 48;
    secDesktop.paddingTop = 48;
    secDesktop.paddingBottom = 48;
    secDesktop.fills = solidPaint("#0a0614");
    secDesktop.cornerRadius = 24;
    secDesktop.counterAxisSizingMode = "AUTO";

    function buildDesktopTodayScreen(theme = "dark") {
      const isLight = theme === "light";
      const screen = figma.createFrame();
      screen.name = `💻 Desktop - Today (${theme.toUpperCase()})`;
      screen.resize(1440, 960);
      screen.clipsContent = true;
      screen.cornerRadius = 24;
      screen.fills = solidPaint(isLight ? "#f8fafc" : "#05030d");
      screen.layoutMode = "VERTICAL";
      screen.itemSpacing = 24;
      screen.paddingLeft = 48;
      screen.paddingRight = 48;
      screen.paddingTop = 24;
      screen.paddingBottom = 48;

      const header = buildHeaderNav(theme, "today", false);
      header.resize(1344, 60);
      screen.appendChild(header);

      const grid = figma.createFrame();
      grid.name = "Dashboard 2-Column Grid";
      grid.layoutMode = "HORIZONTAL";
      grid.itemSpacing = 32;
      grid.fills = [];
      grid.resize(1344, 800);

      const leftCol = figma.createFrame();
      leftCol.name = "Main Left Column";
      leftCol.layoutMode = "VERTICAL";
      leftCol.itemSpacing = 24;
      leftCol.fills = [];
      leftCol.resize(860, 800);

      // Hero Card
      const hero = figma.createFrame();
      hero.name = "Hero Kcal Card";
      hero.layoutMode = "VERTICAL";
      hero.itemSpacing = 20;
      hero.paddingLeft = 32;
      hero.paddingRight = 32;
      hero.paddingTop = 28;
      hero.paddingBottom = 28;
      hero.cornerRadius = 32;
      hero.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      hero.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      hero.strokeWeight = 1;
      hero.resize(860, 360);

      const heroTop = figma.createFrame();
      heroTop.layoutMode = "HORIZONTAL";
      heroTop.primaryAxisAlignItems = "SPACE_BETWEEN";
      heroTop.counterAxisAlignItems = "CENTER";
      heroTop.fills = [];
      heroTop.resize(796, 32);
      heroTop.appendChild(createText("DAILY PROGRESS TODAY", 12, "Bold", isLight ? "#64748b" : "#94a3b8"));
      
      const datePill = figma.createFrame();
      datePill.layoutMode = "HORIZONTAL";
      datePill.paddingLeft = 14;
      datePill.paddingRight = 14;
      datePill.paddingTop = 6;
      datePill.paddingBottom = 6;
      datePill.cornerRadius = 9999;
      datePill.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      datePill.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", isLight ? 0.8 : 0.15);
      datePill.strokeWeight = 1;
      datePill.appendChild(createText("< Today, Aug 14 >", 12, "Bold", isLight ? "#0f172a" : "#ffffff"));
      heroTop.appendChild(datePill);
      hero.appendChild(heroTop);

      const headlineRow = figma.createFrame();
      headlineRow.layoutMode = "HORIZONTAL";
      headlineRow.itemSpacing = 16;
      headlineRow.counterAxisAlignItems = "BASELINE";
      headlineRow.fills = [];
      headlineRow.appendChild(createText("88%", 60, "Black", isLight ? "#0f172a" : "#ffffff"));
      headlineRow.appendChild(createText("In Progress", 18, "Bold", isLight ? "#64748b" : "#94a3b8"));
      hero.appendChild(headlineRow);

      hero.appendChild(createText("240 Kcal remaining (1,760 / 2,000 Kcal logged)", 13, "Medium", isLight ? "#475569" : "#94a3b8"));

      const donutRow = figma.createFrame();
      donutRow.layoutMode = "HORIZONTAL";
      donutRow.itemSpacing = 16;
      donutRow.fills = [];
      donutRow.resize(796, 140);
      donutRow.appendChild(buildMacroDonut("KCAL", 88, 1760, "kcal", "met", theme, false));
      donutRow.appendChild(buildMacroDonut("PROTEIN", 92, 138, "g", "met", theme, false));
      donutRow.appendChild(buildMacroDonut("FAT", 75, 49, "g", "inprogress", theme, false));
      donutRow.appendChild(buildMacroDonut("CARBS", 85, 170, "g", "met", theme, false));
      hero.appendChild(donutRow);

      leftCol.appendChild(hero);

      // Consumed vs Left Table
      const tableCard = figma.createFrame();
      tableCard.name = "Consumed vs Left Table";
      tableCard.layoutMode = "VERTICAL";
      tableCard.itemSpacing = 14;
      tableCard.paddingLeft = 32;
      tableCard.paddingRight = 32;
      tableCard.paddingTop = 24;
      tableCard.paddingBottom = 24;
      tableCard.cornerRadius = 32;
      tableCard.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      tableCard.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      tableCard.strokeWeight = 1;
      tableCard.resize(860, 380);

      tableCard.appendChild(createText("Consumed vs Left", 20, "Bold", isLight ? "#0f172a" : "#ffffff"));

      const tRows = [
        { nutrient: "Calories", consumed: "1,760 kcal", left: "240 kcal", pct: "88%", color: "#f97316" },
        { nutrient: "Protein", consumed: "138g", left: "12g", pct: "92%", color: "#8b5cf6" },
        { nutrient: "Fat", consumed: "49g", left: "16g", pct: "75%", color: "#06b6d4" },
        { nutrient: "Carbs", consumed: "170g", left: "30g", pct: "85%", color: "#f59e0b" }
      ];

      for (const r of tRows) {
        const rFrame = figma.createFrame();
        rFrame.layoutMode = "HORIZONTAL";
        rFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
        rFrame.counterAxisAlignItems = "CENTER";
        rFrame.paddingLeft = 20;
        rFrame.paddingRight = 20;
        rFrame.paddingTop = 14;
        rFrame.paddingBottom = 14;
        rFrame.cornerRadius = 16;
        rFrame.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
        rFrame.resize(796, 52);

        rFrame.appendChild(createText(r.nutrient, 14, "Bold", isLight ? "#0f172a" : "#ffffff"));
        rFrame.appendChild(createText(r.consumed, 14, "Bold", isLight ? "#0f172a" : "#ffffff"));
        rFrame.appendChild(createText(r.left, 14, "Bold", isLight ? "#475569" : "#94a3b8"));
        rFrame.appendChild(createText(r.pct, 14, "Bold", r.color));
        tableCard.appendChild(rFrame);
      }
      leftCol.appendChild(tableCard);
      grid.appendChild(leftCol);

      // Right Column
      const rightCol = figma.createFrame();
      rightCol.name = "Right Column (Latest Entries)";
      rightCol.layoutMode = "VERTICAL";
      rightCol.itemSpacing = 16;
      rightCol.paddingLeft = 28;
      rightCol.paddingRight = 28;
      rightCol.paddingTop = 28;
      rightCol.paddingBottom = 28;
      rightCol.cornerRadius = 32;
      rightCol.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      rightCol.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      rightCol.strokeWeight = 1;
      rightCol.resize(452, 764);

      const rHeader = figma.createFrame();
      rHeader.layoutMode = "HORIZONTAL";
      rHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
      rHeader.counterAxisAlignItems = "CENTER";
      rHeader.fills = [];
      rHeader.resize(396, 32);
      rHeader.appendChild(createText("Latest entries", 20, "Bold", isLight ? "#0f172a" : "#ffffff"));
      
      const addBtn = figma.createFrame();
      addBtn.layoutMode = "HORIZONTAL";
      addBtn.paddingLeft = 14;
      addBtn.paddingRight = 14;
      addBtn.paddingTop = 6;
      addBtn.paddingBottom = 6;
      addBtn.cornerRadius = 9999;
      addBtn.fills = solidPaint(isLight ? "#000000" : "#ffffff");
      addBtn.appendChild(createText("+ Add meal", 12, "Bold", isLight ? "#ffffff" : "#000000"));
      rHeader.appendChild(addBtn);
      rightCol.appendChild(rHeader);

      rightCol.appendChild(buildMealCard("Oatmeal & Whey Protein", 420, 38, 48, 6, "Manual", theme, false));
      rightCol.appendChild(buildMealCard("Chicken Breast with Sweet Potato", 650, 60, 68, 12, "Manual", theme, false));
      rightCol.appendChild(buildMealCard("Greek Yogurt with Berries", 280, 24, 28, 4, "Manual", theme, false));

      grid.appendChild(rightCol);
      screen.appendChild(grid);

      return screen;
    }

    // Desktop Overview Screen
    function buildDesktopOverviewScreen(theme = "dark") {
      const isLight = theme === "light";
      const screen = figma.createFrame();
      screen.name = `💻 Desktop - Overview Analytics (${theme.toUpperCase()})`;
      screen.resize(1440, 960);
      screen.clipsContent = true;
      screen.cornerRadius = 24;
      screen.fills = solidPaint(isLight ? "#f8fafc" : "#05030d");
      screen.layoutMode = "VERTICAL";
      screen.itemSpacing = 24;
      screen.paddingLeft = 48;
      screen.paddingRight = 48;
      screen.paddingTop = 24;
      screen.paddingBottom = 48;

      const header = buildHeaderNav(theme, "overview", false);
      header.resize(1344, 60);
      screen.appendChild(header);

      // KPI Row
      const kpiRow = figma.createFrame();
      kpiRow.name = "KPI Stat Cards Row";
      kpiRow.layoutMode = "HORIZONTAL";
      kpiRow.itemSpacing = 20;
      kpiRow.fills = [];
      kpiRow.resize(1344, 130);

      const kpis = [
        { title: "WEEKLY BALANCE", val: "1,850", unit: "Kcal/day", sub: "Real logged entry average", icon: "📈" },
        { title: "ACTIVE STREAK", val: "5", unit: "Streak Days", sub: "Active logging streak!", icon: "🔥" },
        { title: "GOAL ACCURACY", val: "80%", unit: "Target Hit", sub: "Met goals 4 of 5 days", icon: "🎯" },
        { title: "AVG PROTEIN INTAKE", val: "148g", unit: "Daily Avg", sub: "Based on logged entries", icon: "🏆" },
      ];

      for (const kpi of kpis) {
        const kpiCard = figma.createFrame();
        kpiCard.layoutMode = "VERTICAL";
        kpiCard.itemSpacing = 6;
        kpiCard.paddingLeft = 20;
        kpiCard.paddingRight = 20;
        kpiCard.paddingTop = 16;
        kpiCard.paddingBottom = 16;
        kpiCard.cornerRadius = 24;
        kpiCard.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
        kpiCard.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
        kpiCard.strokeWeight = 1;
        kpiCard.resize(320, 130);

        const kTop = figma.createFrame();
        kTop.layoutMode = "HORIZONTAL";
        kTop.primaryAxisAlignItems = "SPACE_BETWEEN";
        kTop.fills = [];
        kTop.resize(280, 20);
        kTop.appendChild(createText(kpi.title, 11, "Bold", isLight ? "#64748b" : "#94a3b8"));
        kTop.appendChild(createText(kpi.icon, 14, "Regular", "#ffffff"));
        kpiCard.appendChild(kTop);

        const valRow = figma.createFrame();
        valRow.layoutMode = "HORIZONTAL";
        valRow.itemSpacing = 6;
        valRow.counterAxisAlignItems = "BASELINE";
        valRow.fills = [];
        valRow.appendChild(createText(kpi.val, 28, "Black", isLight ? "#0f172a" : "#ffffff"));
        valRow.appendChild(createText(kpi.unit, 12, "Bold", isLight ? "#475569" : "#94a3b8"));
        kpiCard.appendChild(valRow);

        kpiCard.appendChild(createText(kpi.sub, 11, "Medium", isLight ? "#64748b" : "#64748b"));
        kpiRow.appendChild(kpiCard);
      }
      screen.appendChild(kpiRow);

      // Chart Card
      const chartCard = figma.createFrame();
      chartCard.name = "Intake Analytics Chart Card";
      chartCard.layoutMode = "VERTICAL";
      chartCard.itemSpacing = 20;
      chartCard.paddingLeft = 32;
      chartCard.paddingRight = 32;
      chartCard.paddingTop = 28;
      chartCard.paddingBottom = 28;
      chartCard.cornerRadius = 32;
      chartCard.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      chartCard.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      chartCard.strokeWeight = 1;
      chartCard.resize(1344, 600);

      const cHead = figma.createFrame();
      cHead.layoutMode = "HORIZONTAL";
      cHead.primaryAxisAlignItems = "SPACE_BETWEEN";
      cHead.counterAxisAlignItems = "CENTER";
      cHead.fills = [];
      cHead.resize(1280, 36);
      cHead.appendChild(createText("Intake Analytics", 22, "Bold", isLight ? "#0f172a" : "#ffffff"));
      
      const cControls = figma.createFrame();
      cControls.layoutMode = "HORIZONTAL";
      cControls.itemSpacing = 12;
      cControls.fills = [];

      const modeSelect = figma.createFrame();
      modeSelect.paddingLeft = 14;
      modeSelect.paddingRight = 14;
      modeSelect.paddingTop = 8;
      modeSelect.paddingBottom = 8;
      modeSelect.cornerRadius = 14;
      modeSelect.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      modeSelect.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", isLight ? 0.8 : 0.15);
      modeSelect.strokeWeight = 1;
      modeSelect.appendChild(createText("Weekly (7 Days) ▾", 12, "Bold", isLight ? "#0f172a" : "#ffffff"));
      cControls.appendChild(modeSelect);

      const macroSelect = figma.createFrame();
      macroSelect.paddingLeft = 14;
      macroSelect.paddingRight = 14;
      macroSelect.paddingTop = 8;
      macroSelect.paddingBottom = 8;
      macroSelect.cornerRadius = 14;
      macroSelect.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      macroSelect.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", isLight ? 0.8 : 0.15);
      macroSelect.strokeWeight = 1;
      macroSelect.appendChild(createText("General Goal Compliance (%) ▾", 12, "Bold", isLight ? "#0f172a" : "#ffffff"));
      cControls.appendChild(macroSelect);

      cHead.appendChild(cControls);
      chartCard.appendChild(cHead);

      // Time Navigator Bar
      const timeBar = figma.createFrame();
      timeBar.layoutMode = "HORIZONTAL";
      timeBar.primaryAxisAlignItems = "SPACE_BETWEEN";
      timeBar.counterAxisAlignItems = "CENTER";
      timeBar.paddingLeft = 16;
      timeBar.paddingRight = 16;
      timeBar.paddingTop = 10;
      timeBar.paddingBottom = 10;
      timeBar.cornerRadius = 16;
      timeBar.fills = solidPaint(isLight ? "#f1f5f9" : "#231a38");
      timeBar.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", isLight ? 0.8 : 0.15);
      timeBar.strokeWeight = 1;
      timeBar.resize(1280, 44);
      timeBar.appendChild(createText("◀", 14, "Bold", isLight ? "#000000" : "#ffffff"));
      timeBar.appendChild(createText("📅 Aug 10 - Aug 16, 2026", 13, "Bold", isLight ? "#0f172a" : "#ffffff"));
      timeBar.appendChild(createText("▶", 14, "Bold", isLight ? "#94a3b8" : "#475569"));
      chartCard.appendChild(timeBar);

      // Bar Chart
      const barCanvas = figma.createFrame();
      barCanvas.name = "Vertical 7-Day Bar Chart";
      barCanvas.layoutMode = "HORIZONTAL";
      barCanvas.primaryAxisAlignItems = "SPACE_BETWEEN";
      barCanvas.counterAxisAlignItems = "MAX";
      barCanvas.paddingLeft = 24;
      barCanvas.paddingRight = 24;
      barCanvas.paddingTop = 20;
      barCanvas.paddingBottom = 20;
      barCanvas.fills = solidPaint(isLight ? "#ffffff" : "#161024");
      barCanvas.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.08);
      barCanvas.strokeWeight = 1;
      barCanvas.cornerRadius = 20;
      barCanvas.resize(1280, 360);

      const days = [
        { day: "Mon 10", height: 180, status: "met", val: "95%" },
        { day: "Tue 11", height: 210, status: "met", val: "102%" },
        { day: "Wed 12", height: 250, status: "exceeded", val: "124%" },
        { day: "Thu 13", height: 190, status: "met", val: "98%" },
        { day: "Fri 14", height: 160, status: "met", val: "88%" },
        { day: "Sat 15", height: 4, status: "future", val: "-" },
        { day: "Sun 16", height: 4, status: "future", val: "-" },
      ];

      for (const d of days) {
        const col = figma.createFrame();
        col.layoutMode = "VERTICAL";
        col.primaryAxisAlignItems = "MAX";
        col.counterAxisAlignItems = "CENTER";
        col.itemSpacing = 10;
        col.fills = [];
        col.resize(120, 320);

        if (d.status !== "future") {
          const tooltip = figma.createFrame();
          tooltip.paddingLeft = 8;
          tooltip.paddingRight = 8;
          tooltip.paddingTop = 4;
          tooltip.paddingBottom = 4;
          tooltip.cornerRadius = 8;
          tooltip.fills = solidPaint("#0f172a");
          tooltip.appendChild(createText(d.val, 11, "Bold", "#ffffff"));
          col.appendChild(tooltip);
        }

        const bar = figma.createFrame();
        bar.resize(44, d.height);
        bar.cornerRadius = 14;
        if (d.status === "met" || d.status === "exceeded") bar.fills = solidPaint(isLight ? "#000000" : "#ffffff");
        else bar.fills = solidPaint(isLight ? "#cbd5e1" : "#ffffff", 0.15);
        col.appendChild(bar);

        col.appendChild(createText(d.day, 12, "Bold", isLight ? "#0f172a" : "#94a3b8"));
        barCanvas.appendChild(col);
      }

      chartCard.appendChild(barCanvas);
      screen.appendChild(chartCard);

      return screen;
    }

    // Desktop AI Chat Feed Screen (1440 x 1024 px)
    function buildDesktopChatScreen(theme = "dark") {
      const isLight = theme === "light";
      const screen = figma.createFrame();
      screen.name = `💻 Desktop - Today AI Chat Feed & Coach (${theme.toUpperCase()})`;
      screen.resize(1440, 1024);
      screen.clipsContent = true;
      screen.cornerRadius = 24;
      screen.fills = solidPaint(isLight ? "#f8fafc" : "#090516");
      screen.layoutMode = "VERTICAL";
      screen.primaryAxisAlignItems = "MIN";
      screen.counterAxisAlignItems = "CENTER";
      screen.itemSpacing = 24;
      screen.paddingLeft = 48;
      screen.paddingRight = 48;
      screen.paddingTop = 24;
      screen.paddingBottom = 32;

      // Header Nav
      const header = buildHeaderNav(theme, "today", false, 1344);
      screen.appendChild(header);

      // Main Centered Chat Canvas (840px wide)
      const chatContainer = figma.createFrame();
      chatContainer.name = "Chat-First Feed Canvas";
      chatContainer.layoutMode = "VERTICAL";
      chatContainer.itemSpacing = 16;
      chatContainer.counterAxisAlignItems = "CENTER";
      chatContainer.fills = [];
      chatContainer.resize(840, 880);

      // Sticky Macro Bar
      const macroBar = buildStickyMacroBar(1430, 2100, 105, 160, 130, 220, 42, 65, theme, false, 840);
      chatContainer.appendChild(macroBar);

      // Chat Messages Stream
      const stream = figma.createFrame();
      stream.name = "Messages Stream";
      stream.layoutMode = "VERTICAL";
      stream.itemSpacing = 16;
      stream.fills = [];
      stream.resize(840, 640);

      // 1. Assistant Intro Bubble
      const introRow = figma.createFrame();
      introRow.layoutMode = "HORIZONTAL";
      introRow.itemSpacing = 12;
      introRow.counterAxisAlignItems = "START";
      introRow.fills = [];
      introRow.resize(840, 68);

      const aiAvatar1 = figma.createFrame();
      aiAvatar1.resize(36, 36);
      aiAvatar1.cornerRadius = 9999;
      aiAvatar1.fills = solidPaint(isLight ? "#000000" : "#ffffff", 0.1);
      aiAvatar1.strokes = solidPaint(isLight ? "#000000" : "#ffffff", 0.2);
      aiAvatar1.strokeWeight = 1;
      aiAvatar1.layoutMode = "HORIZONTAL";
      aiAvatar1.primaryAxisAlignItems = "CENTER";
      aiAvatar1.counterAxisAlignItems = "CENTER";
      aiAvatar1.appendChild(createText("✨", 14, "Regular", isLight ? "#000000" : "#ffffff"));
      introRow.appendChild(aiAvatar1);

      const introBubble = figma.createFrame();
      introBubble.layoutMode = "VERTICAL";
      introBubble.itemSpacing = 6;
      introBubble.paddingLeft = 18;
      introBubble.paddingRight = 18;
      introBubble.paddingTop = 14;
      introBubble.paddingBottom = 14;
      introBubble.cornerRadius = 20;
      introBubble.fills = solidPaint(isLight ? "#ffffff" : "#161024");
      introBubble.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.1);
      introBubble.strokeWeight = 1;
      introBubble.resize(540, 68);
      introBubble.appendChild(createParagraph("¡Buenos días Andrés! ☀️ Cuéntame qué desayunaste o mándame una foto o nota de voz para registrar tus calorías de hoy.", 504, 13, "Medium", isLight ? "#0f172a" : "#e2e8f0"));
      introRow.appendChild(introBubble);
      stream.appendChild(introRow);

      // 2. User Voice Memo Bubble (Right aligned)
      const uVoiceRow = figma.createFrame();
      uVoiceRow.layoutMode = "HORIZONTAL";
      uVoiceRow.primaryAxisAlignItems = "MAX";
      uVoiceRow.fills = [];
      uVoiceRow.resize(840, 114);
      const voiceBubble = buildChatVoiceBubble("Me comí dos huevos revueltos con una rebanada de pan tostado y café negro.", "0:06", "08:45 AM", theme, false, 440);
      uVoiceRow.appendChild(voiceBubble);
      stream.appendChild(uVoiceRow);

      // 3. AI Meal Response Card (Breakfast - Left aligned)
      const aiRow1 = figma.createFrame();
      aiRow1.layoutMode = "HORIZONTAL";
      aiRow1.itemSpacing = 12;
      aiRow1.counterAxisAlignItems = "START";
      aiRow1.fills = [];
      aiRow1.resize(840, 240);

      const aiAvatar2 = figma.createFrame();
      aiAvatar2.resize(36, 36);
      aiAvatar2.cornerRadius = 9999;
      aiAvatar2.fills = solidPaint(isLight ? "#000000" : "#ffffff", 0.1);
      aiAvatar2.strokes = solidPaint(isLight ? "#000000" : "#ffffff", 0.2);
      aiAvatar2.strokeWeight = 1;
      aiAvatar2.layoutMode = "HORIZONTAL";
      aiAvatar2.primaryAxisAlignItems = "CENTER";
      aiAvatar2.counterAxisAlignItems = "CENTER";
      aiAvatar2.appendChild(createText("✨", 14, "Regular", isLight ? "#000000" : "#ffffff"));
      aiRow1.appendChild(aiAvatar2);

      const aiCard1 = buildAiMealCardRich("Huevos Revueltos con Tostada", 360, 20, 24, 16, "Estimamos 2 huevos talla L cocinados con poco aceite y 1 rebanada de pan integral (30g).", "Desayuno Registrado", theme, false, 540);
      aiRow1.appendChild(aiCard1);
      stream.appendChild(aiRow1);

      // 4. User Photo Bubble (Right aligned)
      const uPhotoRow = figma.createFrame();
      uPhotoRow.layoutMode = "HORIZONTAL";
      uPhotoRow.primaryAxisAlignItems = "MAX";
      uPhotoRow.fills = [];
      uPhotoRow.resize(840, 210);
      const photoBubble = buildChatPhotoBubble("Bowl de ensalada con pollo y quinoa.", "02:15 PM", theme, false, 360);
      uPhotoRow.appendChild(photoBubble);
      stream.appendChild(uPhotoRow);

      // 5. AI Meal Response Card (Lunch - Left aligned)
      const aiRow2 = figma.createFrame();
      aiRow2.layoutMode = "HORIZONTAL";
      aiRow2.itemSpacing = 12;
      aiRow2.counterAxisAlignItems = "START";
      aiRow2.fills = [];
      aiRow2.resize(840, 240);

      const aiAvatar3 = figma.createFrame();
      aiAvatar3.resize(36, 36);
      aiAvatar3.cornerRadius = 9999;
      aiAvatar3.fills = solidPaint(isLight ? "#000000" : "#ffffff", 0.1);
      aiAvatar3.strokes = solidPaint(isLight ? "#000000" : "#ffffff", 0.2);
      aiAvatar3.strokeWeight = 1;
      aiAvatar3.layoutMode = "HORIZONTAL";
      aiAvatar3.primaryAxisAlignItems = "CENTER";
      aiAvatar3.counterAxisAlignItems = "CENTER";
      aiAvatar3.appendChild(createText("✨", 14, "Regular", isLight ? "#000000" : "#ffffff"));
      aiRow2.appendChild(aiAvatar3);

      const aiCard2 = buildAiMealCardRich("Bowl de Pollo, Quinoa y Aguacate", 620, 48, 52, 22, "¡Gran elección! Has cubierto el 65% de tu meta de proteína diaria. Te quedan 670 Kcal para la cena.", "Almuerzo Detectado por Visión", theme, false, 540);
      aiRow2.appendChild(aiCard2);
      stream.appendChild(aiRow2);

      chatContainer.appendChild(stream);

      // Suggestion Chips
      const chipsRow = figma.createFrame();
      chipsRow.layoutMode = "HORIZONTAL";
      chipsRow.itemSpacing = 10;
      chipsRow.fills = [];
      chipsRow.resize(840, 36);

      const suggestions = ["🍗 Pollo con ensalada", "🥤 Batido de proteína", "🍎 Snack ligero", "💡 ¿Qué puedo cenar?"];
      for (const s of suggestions) {
        const chip = figma.createFrame();
        chip.layoutMode = "HORIZONTAL";
        chip.primaryAxisAlignItems = "CENTER";
        chip.counterAxisAlignItems = "CENTER";
        chip.paddingLeft = 16;
        chip.paddingRight = 16;
        chip.paddingTop = 8;
        chip.paddingBottom = 8;
        chip.cornerRadius = 14;
        chip.fills = solidPaint(isLight ? "#ffffff" : "#161024");
        chip.strokes = solidPaint(isLight ? "#cbd5e1" : "#ffffff", 0.12);
        chip.strokeWeight = 1;
        chip.appendChild(createText(s, 12, "Bold", isLight ? "#475569" : "#cbd5e1"));
        chipsRow.appendChild(chip);
      }
      chatContainer.appendChild(chipsRow);

      // Bottom Smart Omnibar
      const omnibar = buildSmartOmnibar(theme, false, 840);
      chatContainer.appendChild(omnibar);

      screen.appendChild(chatContainer);
      return screen;
    }

    secDesktop.appendChild(buildDesktopChatScreen("dark"));
    secDesktop.appendChild(buildDesktopChatScreen("light"));
    secDesktop.appendChild(buildDesktopTodayScreen("dark"));
    secDesktop.appendChild(buildDesktopOverviewScreen("dark"));
    secDesktop.appendChild(buildDesktopTodayScreen("light"));

    page.appendChild(secDesktop);

    // Focus viewport
    figma.viewport.scrollAndZoomIntoView([secFoundations, secComponents, secMobile, secDesktop]);
    figma.notify("✅ NutritionTracker Design System & Screens Synced Successfully!");
  } catch (err) {
    console.error("Plugin Error:", err);
    figma.notify("Error: " + (err.message || String(err)), { error: true });
  } finally {
    // ALWAYS CLOSE THE PLUGIN PROCESS TO AVOID HANGING / SPINNER
    figma.closePlugin();
  }
})();
