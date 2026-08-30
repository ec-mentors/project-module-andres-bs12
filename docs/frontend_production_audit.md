# Auditoría Frontend — Production Readiness

**Alcance:** Solo frontend (`/frontend`). Sin cambios Java/backend. Sin especificación de rate limits backend.  
**Fecha:** 28 ago 2026  
**Stack:** React 19, Vite 8, Tailwind 4, TypeScript 6  

---

## Resumen ejecutivo

El frontend de NutritionTracker está **cerca de producción** en UX visual y flujos principales (auth Google, chat Nutria, Overview, favoritos, onboarding). La base de diseño es coherente (monocromo + tokens de macros, bottom sheets en móvil, safe-area en iOS).

**Bloqueadores principales (P0):**

1. **Errores silenciosos** — CRUD de favoritos y comidas en `App.tsx` solo hace `console.error`; el usuario no ve fallos de red/API.
2. **Lecturas GET tolerantes a fallos** — `getTodayEntries` / `getAllEntries` / `getLatestGoal` devuelven `[]`/`null` sin distinguir “sin datos” vs “API caída”.
3. **Borrado de favorito sin confirmación** en `ManageFavoritesModal` (accidental en móvil).
4. **Código muerto y duplicación** — modal shell no usado, lógica AI duplicada entre `SmartOmnibar` y `ManageFavoritesModal`, nombre “MockupBar”.
5. **Accesibilidad incompleta** — modales sin focus trap, pocos `aria-label`, toast sin anuncio para lectores de pantalla.

**Fortalezas:**

- `apiErrors.ts` con `ApiError`, parsing 429 y `getApiErrorUserMessage` (Nutria chat ya lo usa).
- Tokens compartidos (`favoritesTypography`, `MACRO_COLORS`, touch targets).
- Estados vacíos bien diseñados en sidebar y favoritos.
- iOS: `font-size: 16px` en inputs, `viewport-fit=cover`, safe-area en bottom sheets.

---

## P0 — Must fix before production

### Componentización y deuda técnica

| Issue | Ubicación | Impacto |
|-------|-----------|---------|
| **`FavoritesModalShell` no integrado** | `favorites/FavoritesModalShell.tsx` vs `ManageFavoritesModal.tsx` (~920 líneas) | Duplica backdrop, scroll lock, Escape, footer safe-area. Refactor pendiente. |
| **`ManageFavoritesModal` monolítico** | Incluye listado + create/edit overlay + AI omnibar completo | Mantenimiento difícil; bugs se replican vs `SmartOmnibar`. |
| **Nombre engañoso `FavoriteMealsMockupBar`** | `FavoriteMealsMockupBar.tsx` | Es producción, no mockup. Confunde onboarding de devs. |
| **3 instancias de `ManageFavoritesModal`** | `App`, `FavoriteMealsMockupBar`, `LatestEntriesSidebar` | Mismo modal montado en varios árboles (OK funcionalmente, pero estado duplicado). |
| **Código muerto eliminado en esta auditoría** | ~~`QuickEditFavoritePopover`~~, ~~`AddMealModal`~~, ~~`VoiceRecorderModal`~~, ~~`SidepopUp`~~, ~~`AuthModal`~~ | Ninguno tenía imports. **Pendiente:** integrar o eliminar `FavoritesModalShell`. |

### UX / estados de error

| Issue | Detalle |
|-------|---------|
| **Favoritos CRUD sin feedback** | `handleAddFavorite` / `handleUpdateFavorite` / `handleDeleteFavorite` en `App.tsx` — fallo silencioso. |
| **Comidas CRUD sin try/catch en UI** | `handleAddMeal`, `handleUpdateMeal`, `handleDeleteMeal` propagan error no capturado → posible unhandled rejection. |
| **Sidebar inline add/edit** | `LatestEntriesSidebar` llama `onAddMeal`/`onUpdateMeal` sin loading ni error UI. |
| **Delete favorito sin confirmación** | Botón 🗑 en lista de `ManageFavoritesModal` borra al instante. |
| **Onboarding AI fallback silencioso** | `calculateAiGoalRoadmap` cae a cálculo cliente sin avisar al usuario (aceptable como fallback, pero debería mostrarse en review). |
| **`alert()` para micrófono** | `SmartOmnibar`, `ManageFavoritesModal` — rompe UX nativa en iOS. |

### api.ts / manejo de errores

| Endpoint / función | Comportamiento actual | Gap |
|--------------------|----------------------|-----|
| `parseMealText/Audio/Image` | `throwIfNotOk` → `ApiError` | ✅ Nutria usa `getApiErrorUserMessage` |
| `createEntry`, `deleteEntry`, favorites CRUD | `throwIfNotOk` | ✅ Lanza, pero **callers no muestran UI** |
| `getTodayEntries`, `getAllEntries`, `getLatestGoal` | `catch` → `[]` / `null` | ❌ Usuario ve dashboard vacío si API falla |
| `calculateAiGoalRoadmap` | 429 re-lanza; otros errores → fallback cliente | ⚠️ 429 no llega a onboarding UI |
| `fetchFavorites` | `throwIfNotOk` | ⚠️ App solo `console.error` al cargar |

**Nota:** `apiErrors.ts` ya prepara mensajes 429 amigables (`limitType`, `Retry-After`). Falta **consumirlos** en favoritos, onboarding y sidebar.

### Mobile / iPhone

| Issue | Detalle |
|-------|---------|
| **Touch targets inconsistentes** | Barra de favoritos: `min-h-[36px]` en móvil (< 44px HIG). Botones edit/delete favoritos: 36px. |
| **Tooltip hover en favoritos** | `FavoriteMealsMockupBar` — hover no existe en touch; macros ocultos en iPhone. |
| **Toast fijo bottom-right** | Puede quedar bajo home indicator o teclado en iPhone. |
| **`user-scalable=no`** | `index.html` — accesibilidad zoom reducida (trade-off anti-zoom en inputs). |
| **Nutria tab body scroll lock** | Correcto, pero modales anidados compiten por `document.body.style.overflow`. |

### Accesibilidad (P0 mínimo)

- Modales sin `role="dialog"`, `aria-modal="true"`, focus trap ni return focus.
- Tabs Nutria/Overview sin `aria-selected` / `role="tablist"`.
- Chat sin `aria-live` para respuestas Nutria y spinner “analyzing”.
- Imágenes de comida: solo `alt="Uploaded meal"`.
- Botones icon-only (edit, delete, star) sin `aria-label` en varios sitios.

### Bugs y edge cases

| Bug | Descripción |
|-----|-------------|
| **Memory leak fotos** | `URL.createObjectURL` en `NutriaChatFeed` sin `revokeObjectURL`. |
| **Matching favoritos por nombre** | Case-insensitive exact match — colisiones si dos favoritos similares; renombrar rompe vínculo. |
| **`onLogMeal` sin `mealType`** | Log desde favoritos no envía `mealType` al entry (backend puede inferir por hora). |
| **Tema no persistido** | `theme` solo en React state — refresh vuelve a dark. |
| **Entrada duplicada key** | `LatestEntriesSidebar` usa `entry.id \|\| entry.mealName` — riesgo de key duplicada. |
| **Favorito añadido optimista** | Star en draft card llama `onAddFavorite` antes de save — puede crear favorito huérfano si save falla. |

---

## P1 — Should fix

### UX/UI consistency

- **Radius:** mezcla `rounded-[32px]`, `rounded-2xl`, `rounded-3xl` — aceptable pero no sistematizado.
- **Tipografía:** mezcla `font-bold`, `font-extrabold`, `font-black`; tamaños `text-[10px]`–`text-xl` sin escala documentada fuera de `favoritesTypography`.
- **Colores dark:** `#080808`, `#121214`, `#18181b`, `#141416` — variaciones cercanas; considerar CSS variables.
- **Light mode:** bien soportado en componentes nuevos; algunos bordes hardcoded `border-white/[0.08]` en popovers light.
- **Modales centrados vs bottom sheet:** `SetGoalsModal`, `UserProfileModal` centrados; favoritos bottom sheet — inconsistente en móvil.
- **Loading:** Overview usa solo `opacity-90` — sin skeletons ni spinners.

### Favorite meals — gaps funcionales

- Sin **reordenar / fijar** favoritos frecuentes.
- Sin **contador de uso** (“logged 12 times”).
- Sin **sincronización mealType** al loguear desde chip (solo macros).
- Sin **estado vacío** en barra horizontal cuando filtro AUTO no tiene items (solo pills vacías).
- **Import from favorites** en sidebar abre modal completo — flujo correcto pero pesado vs quick-add.
- Perfil → Manage Favorites **sin** `onLogMeal` (solo gestión, coherente con copy del footer).

### Nutria chat

- Historial de chat **no persistido** — refresh pierde conversación.
- Sin límite de mensajes / scroll performance en sesiones largas.
- Draft cards persisten en chat aunque ya guardados (solo flag `isSaved`).
- Clarificación AI concatena contexto pero no muestra hilo explícito al usuario.

### Overview sidebar

- Acciones edit/delete **ocultas en desktop** hasta hover (`sm:opacity-0 sm:group-hover:opacity-100`) — inaccesible sin mouse.
- `max-h-[500px]` en móvil puede recortar lista larga de comidas.

### Onboarding

- Cerrar onboarding en paso avanzado muestra discard modal ✅.
- Cerrar en `choose-path` permite salir **sin goals** — usuario queda en app con defaults 2000 kcal.
- AI processing step no distingue error 429 vs offline en UI.

### Modales — inventario

| Modal | Scroll lock | Escape | Mobile pattern |
|-------|-------------|--------|----------------|
| `ManageFavoritesModal` | ✅ | ✅ (back stack) | Bottom sheet ✅ |
| `SetGoalsModal` | ❌ parcial | ❌ | Centrado |
| `UserProfileModal` | ✅ | ❌ | Centrado |
| `GoogleLoginModal` | gate | parcial | Centrado |
| `OnboardingModal` | ✅ fullscreen | discard flow | Fullscreen ✅ |
| Confirmaciones sidebar | ✅ | ❌ | Centrado |

---

## P2 — Nice to have

- Persistir tema y tab activo en `localStorage`.
- Renombrar `FavoriteMealsMockupBar` → `FavoriteMealsBar`.
- Refactor `ManageFavoritesModal` → `FavoritesModalShell` + subcomponentes.
- Extraer hook compartido `useAiOmnibar` (text/voice/photo) entre chat y favoritos.
- Skeleton loaders en Hero card y charts.
- Internacionalización (UI 100% inglés hoy).
- PWA / offline banner.
- Tests E2E (Playwright) para flujos críticos.
- Virtualizar lista larga de entries.

---

## Frontend vs Backend (solo notas)

| Necesidad | Frontend | Backend |
|-----------|----------|---------|
| Rate limit 429 con body `{ limitType, retryAfterSeconds }` | Ya parseado en `apiErrors.ts` | Debe emitir headers/body consistentes |
| `mealType` en entry desde favorito | Enviar en payload al loguear | Aceptar y persistir |
| Orden/frecuencia favoritos | UI de sort local | Opcional: `lastUsedAt`, `useCount` |
| Distinguir error red vs vacío en GET entries | Mostrar banner error | HTTP status correctos (503 vs 200 []) |
| Auth 401 refresh | Mostrar re-login | Token expiry / refresh policy |
| Validación macros negativos | Validar en forms | Validación server-side |
| Paginación entries históricos | Overview carga todo en memoria | Paginación API para usuarios heavy |

---

## Checklist QA manual — iPhone

### Auth y onboarding
- [ ] Login Google en Safari iOS (popup/redirect).
- [ ] Usuario nuevo → onboarding AI completo → goals guardados.
- [ ] Usuario nuevo → onboarding manual → goals guardados.
- [ ] Cerrar onboarding a mitad → discard modal → confirmar salida.
- [ ] Sign out → gate login → re-login carga datos.

### Nutria chat
- [ ] Enviar texto → draft card → Save → Overview refleja comida.
- [ ] Enviar texto ambiguo → coach_note clarificación.
- [ ] Grabar voz inline → analizar → draft (permiso micrófono).
- [ ] Foto cámara y galería → draft.
- [ ] Tap chip favorito → draft → Save.
- [ ] Star/unstar en draft card.
- [ ] Scroll chat no mueve página entera (body locked).
- [ ] Safe area: omnibar no queda bajo home indicator.
- [ ] Rotación portrait/landscape — layout estable.

### Favoritos
- [ ] Barra chips filtra por AUTO (hora del día).
- [ ] Cambiar filtro dropdown → pills correctas.
- [ ] Settings → modal bottom sheet 92dvh — scroll interno OK.
- [ ] Crear favorito manual + con AI (texto/voz/foto).
- [ ] Editar favorito → guardar → lista actualizada.
- [ ] **Delete favorito** — verificar si pide confirmación (P0 si no).
- [ ] Buscar favorito — clear search.
- [ ] Overview sidebar → star → Manage modal → Log meal.

### Overview
- [ ] Cambiar fecha en Hero card → entries y macros actualizan.
- [ ] Sidebar móvil (entre hero y tabla) — add/edit/delete meal.
- [ ] Edit meal vinculado a favorito → prompt “today only vs preset”.
- [ ] Gráficos 7 días — navegar semanas pasadas.
- [ ] Header hide/show al scroll down/up en Overview.
- [ ] Light/dark toggle — todos los paneles legibles.

### Errores / edge
- [ ] Modo avión → abrir app → mensaje claro (no dashboard vacío silencioso).
- [ ] API caída al guardar comida → toast o inline error.
- [ ] Entrada con 0 kcal — comportamiento esperado.
- [ ] Teclado virtual no tapa inputs en modales inferiores.

### Accesibilidad rápida
- [ ] VoiceOver: tab Nutria/Overview anunciados.
- [ ] VoiceOver: botón cerrar modal identificado.
- [ ] Zoom del sistema (si aplica con viewport config).

---

## Cambios aplicados en esta auditoría

1. **Eliminado código muerto:** `QuickEditFavoritePopover`, `AddMealModal`, `VoiceRecorderModal`, `SidepopUp`, `AuthModal`.
2. **`ManageFavoritesModal`:** errores AI usan `getApiErrorUserMessage` (incl. 429 cuando backend lo emita).

---

## Métricas rápidas del codebase

| Métrica | Valor |
|---------|-------|
| Componentes TSX | ~40 |
| Archivos muertos removidos | 5 |
| Modales activos | 6+ |
| Cobertura `getApiErrorUserMessage` | Nutria chat ✅, Favoritos AI ✅, App handlers ❌ |

---

## Priorización sugerida (sprint)

1. **Semana 1 (P0):** Toast/inline errors en App handlers; confirm delete favorito; banner error GET entries; focus trap modales críticos.
2. **Semana 2 (P1):** Refactor shell favoritos; unificar AI omnibar; touch targets 44px; tooltip → long-press en móvil.
3. **Semana 3 (P2):** Persist theme; rename MockupBar; skeletons; i18n prep.

---

*Documento generado como parte de la auditoría pre-producción frontend. Backend out of scope.*
