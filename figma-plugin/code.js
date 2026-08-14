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
      { name: "Brand Primary", hex: "#6417ff", desc: "Main CTA / Goal Hit" },
      { name: "Dark Canvas", hex: "#05030d", desc: "Dark Mode Background" },
      { name: "Dark Panel", hex: "#161024", desc: "Dark Mode Card Surface" },
      { name: "Dark Pill", hex: "#231a38", desc: "Dark Mode Pills & Rows" },
      { name: "Exceeded / Danger", hex: "#ef233c", desc: ">115% Macro Over" },
      { name: "Light Canvas", hex: "#f8fafc", desc: "Light Mode Background" },
      { name: "Light Panel", hex: "#ffffff", desc: "Light Mode Card Surface" },
      { name: "Protein (Red)", hex: "#ef233c", desc: "Protein Macro" },
      { name: "Carbs (Amber)", hex: "#f59e0b", desc: "Carbs Macro" },
      { name: "Fat (Purple)", hex: "#7c3aff", desc: "Fat Macro" }
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
    function buildHeaderNav(theme = "dark", activeTab = "today", isComponent = false) {
      const isLight = theme === "light";
      const header = isComponent ? figma.createComponent() : figma.createFrame();
      header.name = `Header / Nav (${theme.toUpperCase()}, Tab=${activeTab})`;
      header.layoutMode = "HORIZONTAL";
      header.primaryAxisAlignItems = "CENTER";
      header.counterAxisAlignItems = "CENTER";
      header.itemSpacing = 14;
      header.paddingLeft = 16;
      header.paddingRight = 16;
      header.paddingTop = 8;
      header.paddingBottom = 8;
      header.cornerRadius = 9999;
      header.fills = solidPaint(isLight ? "#ffffff" : "#161024", 0.95);
      header.strokes = solidPaint(isLight ? "#e2e8f0" : "#ffffff", isLight ? 0.8 : 0.12);
      header.strokeWeight = 1;
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

      // Segmented Track
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
      todayBtn.paddingLeft = 16;
      todayBtn.paddingRight = 16;
      todayBtn.paddingTop = 6;
      todayBtn.paddingBottom = 6;
      todayBtn.cornerRadius = 9999;
      todayBtn.fills = activeTab === "today" ? solidPaint("#6417ff") : [];
      todayBtn.appendChild(createText("Today", 13, "Bold", activeTab === "today" ? "#ffffff" : (isLight ? "#475569" : "#94a3b8")));
      track.appendChild(todayBtn);

      // Overview Button
      const overviewBtn = figma.createFrame();
      overviewBtn.layoutMode = "HORIZONTAL";
      overviewBtn.primaryAxisAlignItems = "CENTER";
      overviewBtn.counterAxisAlignItems = "CENTER";
      overviewBtn.paddingLeft = 16;
      overviewBtn.paddingRight = 16;
      overviewBtn.paddingTop = 6;
      overviewBtn.paddingBottom = 6;
      overviewBtn.cornerRadius = 9999;
      overviewBtn.fills = activeTab === "overview" ? solidPaint("#6417ff") : [];
      overviewBtn.appendChild(createText("Overview", 13, "Bold", activeTab === "overview" ? "#ffffff" : (isLight ? "#475569" : "#94a3b8")));
      track.appendChild(overviewBtn);

      header.appendChild(track);

      // Divider
      const divider = figma.createFrame();
      divider.resize(1, 24);
      divider.fills = solidPaint(isLight ? "#cbd5e1" : "#ffffff", 0.2);
      header.appendChild(divider);

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
      goalsBtn.appendChild(createText("Set goals", 13, "Bold", isLight ? "#0f172a" : "#ffffff"));
      header.appendChild(goalsBtn);

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
      header.appendChild(themeBtn);

      // Profile Button
      const profileBtn = figma.createFrame();
      profileBtn.resize(36, 36);
      profileBtn.layoutMode = "HORIZONTAL";
      profileBtn.primaryAxisAlignItems = "CENTER";
      profileBtn.counterAxisAlignItems = "CENTER";
      profileBtn.cornerRadius = 9999;
      profileBtn.fills = solidPaint("#6417ff");
      profileBtn.appendChild(createText("A", 14, "Bold", "#ffffff"));
      header.appendChild(profileBtn);

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
      box.appendChild(createText(label, 11, "Bold", isLight ? "#6417ff" : "#c084fc"));

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

      let ringColor = "#6417ff";
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
        pill.resize(67, 44);

        pill.appendChild(createText(String(m.val), 12, "Bold", isLight ? "#0f172a" : "#ffffff"));
        pill.appendChild(createText(m.label, 9, "Bold", isLight ? "#6417ff" : "#c084fc"));
        grid.appendChild(pill);
      }
      card.appendChild(grid);

      return card;
    }

    // Row for Components Demo
    const compRow = figma.createFrame();
    compRow.name = "Component Atoms & Molecules Demo";
    compRow.layoutMode = "HORIZONTAL";
    compRow.itemSpacing = 20;
    compRow.fills = [];

    compRow.appendChild(buildHeaderNav("dark", "today", true));
    compRow.appendChild(buildMacroDonut("KCAL", 88, 1760, "kcal", "met", "dark", true));
    compRow.appendChild(buildMacroDonut("PROTEIN", 125, 188, "g", "exceeded", "dark", true));
    compRow.appendChild(buildMealCard("Grilled Chicken & Rice", 520, 48, 55, 12, "Manual", "dark", true));

    secComponents.appendChild(compRow);
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
      heroTop.appendChild(createText("DAILY PROGRESS TODAY", 11, "Bold", isLight ? "#6417ff" : "#c084fc"));
      
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
      headlineRow.appendChild(createText("In Progress", 14, "Bold", isLight ? "#6417ff" : "#c084fc"));
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
      addBtn.fills = solidPaint("#6417ff");
      addBtn.appendChild(createText("+ Add meal", 11, "Bold", "#ffffff"));
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
        emptyBox.appendChild(createText("Tap here to log your meal intake now", 11, "Medium", isLight ? "#6417ff" : "#c084fc"));
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
        { nutrient: "Calories", consumed: "1,760 kcal", left: "240 kcal", pct: "88%", color: "#6417ff" },
        { nutrient: "Protein", consumed: "138g", left: "12g", pct: "92%", color: "#6417ff" },
        { nutrient: "Fat", consumed: "49g", left: "16g", pct: "75%", color: isLight ? "#94a3b8" : "#475569" },
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
      heroTop.appendChild(createText("DAILY PROGRESS TODAY", 12, "Bold", isLight ? "#6417ff" : "#c084fc"));
      
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
      headlineRow.appendChild(createText("In Progress", 18, "Bold", isLight ? "#6417ff" : "#c084fc"));
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
        { nutrient: "Calories", consumed: "1,760 kcal", left: "240 kcal", pct: "88%", color: "#6417ff" },
        { nutrient: "Protein", consumed: "138g", left: "12g", pct: "92%", color: "#6417ff" },
        { nutrient: "Fat", consumed: "49g", left: "16g", pct: "75%", color: isLight ? "#94a3b8" : "#475569" },
        { nutrient: "Carbs", consumed: "170g", left: "30g", pct: "85%", color: "#6417ff" }
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
      addBtn.fills = solidPaint("#6417ff");
      addBtn.appendChild(createText("+ Add meal", 12, "Bold", "#ffffff"));
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
        kTop.appendChild(createText(kpi.title, 11, "Bold", isLight ? "#6417ff" : "#c084fc"));
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
      timeBar.appendChild(createText("◀", 14, "Bold", "#6417ff"));
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
        if (d.status === "met") bar.fills = solidPaint("#6417ff");
        else if (d.status === "exceeded") bar.fills = solidPaint("#ef233c");
        else bar.fills = solidPaint(isLight ? "#cbd5e1" : "#ffffff", 0.15);
        col.appendChild(bar);

        col.appendChild(createText(d.day, 12, "Bold", isLight ? "#0f172a" : "#94a3b8"));
        barCanvas.appendChild(col);
      }

      chartCard.appendChild(barCanvas);
      screen.appendChild(chartCard);

      return screen;
    }

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
