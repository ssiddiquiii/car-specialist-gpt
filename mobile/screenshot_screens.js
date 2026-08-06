/**
 * Car AI — Screen Screenshot Generator v2
 * Renders each screen using inline SVG icons (no emoji, no unicode glyphs)
 * at iPhone 14 dimensions (390×844 @2x) and saves PNGs to screenshots/
 *
 * Run: node screenshot_screens.js
 */

const puppeteer = require('puppeteer');
const fs        = require('fs');
const path      = require('path');

const OUT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Design tokens ──────────────────────────────────────────────────────────
const T = {
  bg:           '#FFFFFF',
  bgSoft:       '#F9FAFB',
  border:       '#F0F0F0',
  borderStrong: '#E5E7EB',
  accent:       '#1C2B4A',
  accentSoft:   '#EEF1F7',
  accentGreen:  '#059669',
  textPrimary:  '#0D0D0D',
  textSub:      '#6B7280',
  textMuted:    '#B0B0B0',
  userBubble:   '#1C2B4A',
  shadow:       'rgba(0,0,0,0.07)',
};

// ─── Inline SVG icons (Feather / Ionicons style paths) ──────────────────────
const SVG = {
  // Arrow up — send button
  arrowUp: (color='#FFF', size=18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>`,

  // Menu / hamburger
  menu: (color=T.textSub, size=20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>`,

  // Moon
  moon: (color=T.textMuted, size=18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`,

  // Sun
  sun: (color='#F59E0B', size=18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`,

  // X / close
  x: (color=T.textMuted, size=18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`,

  // Trash
  trash: (color=T.textMuted, size=14) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4h6v2"/>
    </svg>`,

  // Plus
  plus: (color='#FFF', size=16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

  // Log-out
  logout: (color=T.accent, size=14) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>`,

  // Download arrow
  download: (color=T.textMuted, size=14) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>`,

  // Wifi
  wifi: (color=T.accentGreen, size=14) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>`,

  // Car (minimal)
  car: (color=T.accent, size=40) => `
    <svg width="${size}" height="${size*0.55}" viewBox="0 0 64 36" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="16" width="60" height="14" rx="4"/>
      <path d="M10 16 L16 6 H48 L54 16"/>
      <circle cx="16" cy="30" r="5" fill="white" stroke="${color}" stroke-width="2"/>
      <circle cx="48" cy="30" r="5" fill="white" stroke="${color}" stroke-width="2"/>
      <line x1="2" y1="22" x2="62" y2="22" stroke="${color}" stroke-width="1"/>
    </svg>`,

  // Message square
  msg: (color=T.textMuted, size=14) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,
};

// ─── Base HTML wrapper ───────────────────────────────────────────────────────
const base = (body) => `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=390">
<link rel="preconnect" href="https://fonts.googleapis.com">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body {
    width:390px; height:844px; overflow:hidden;
    background:${T.bg};
    font-family:'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing:antialiased;
    position:relative;
  }
  svg { display:block; flex-shrink:0; }
</style>
</head><body>${body}</body></html>`;

// ─── HEADER component ────────────────────────────────────────────────────────
const Header = (moonOrSun = 'moon') => `
  <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid ${T.border};background:${T.bg};">
    <div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;">${SVG.menu()}</div>
    <span style="font-size:16px;font-weight:700;color:${T.textPrimary};letter-spacing:-0.2px;">Car AI</span>
    <div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;">${SVG.moon()}</div>
  </div>`;

// ─── FLOATING INPUT component ────────────────────────────────────────────────
const FloatingInput = (placeholder = 'Ask about car specs') => `
  <div style="position:absolute;bottom:0;left:0;right:0;padding:0 14px 24px;">
    <div style="display:flex;align-items:center;background:${T.bg};border:1px solid ${T.borderStrong};border-radius:100px;padding:8px 8px 8px 18px;gap:10px;box-shadow:0 2px 16px ${T.shadow};">
      <span style="flex:1;font-size:14px;color:${T.textMuted};font-family:'Inter',sans-serif;">${placeholder}</span>
      <div style="width:38px;height:38px;border-radius:19px;background:${T.accent};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${SVG.arrowUp()}
      </div>
    </div>
  </div>`;

// ─── SCREENS ─────────────────────────────────────────────────────────────────
const screens = [

  // 1. Splash
  {
    name: '01_splash',
    html: base(`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:22px;padding:40px;">
        ${SVG.car(T.accent, 56)}
        <div style="width:90px;height:1.5px;background:${T.border};border-radius:1px;"></div>
        <span style="font-size:12px;color:${T.textMuted};letter-spacing:0.5px;font-family:'Inter',sans-serif;">Starting up</span>
      </div>`),
  },

  // 2. Setup — idle
  {
    name: '02_setup_idle',
    html: base(`
      ${Header()}
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100% - 57px);padding:0 32px 52px;gap:0;">
        <div style="margin-bottom:28px;">${SVG.car(T.accent, 60)}</div>
        <div style="font-size:26px;font-weight:700;color:${T.textPrimary};text-align:center;letter-spacing:-0.4px;margin-bottom:8px;">Set up Car AI</div>
        <div style="font-size:14px;color:${T.textSub};text-align:center;line-height:21px;margin-bottom:22px;">Download once. Works offline, everywhere.</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
          <div style="display:flex;align-items:center;gap:5px;">${SVG.download(T.textMuted)}<span style="font-size:12px;color:${T.textMuted};">1.68 GB</span></div>
          <span style="color:${T.border};font-size:16px;">·</span>
          <div style="display:flex;align-items:center;gap:5px;">${SVG.wifi()}<span style="font-size:12px;color:${T.accentGreen};">No internet after setup</span></div>
        </div>
        <div style="width:100%;background:${T.accent};border-radius:100px;padding:15px 24px;text-align:center;color:#FFF;font-size:15px;font-weight:600;margin-bottom:14px;font-family:'Inter',sans-serif;">Download now</div>
        <span style="font-size:12px;color:${T.textMuted};text-align:center;line-height:18px;">You can use other apps while it downloads</span>
      </div>`),
  },

  // 3. Setup — downloading
  {
    name: '03_setup_downloading',
    html: base(`
      ${Header()}
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100% - 57px);padding:0 32px 52px;gap:0;">
        <div style="margin-bottom:28px;">${SVG.car(T.accent, 60)}</div>
        <div style="font-size:48px;font-weight:700;color:${T.textPrimary};letter-spacing:-1px;margin-bottom:6px;">67%</div>
        <div style="font-size:14px;color:${T.textSub};margin-bottom:22px;">Setting up Car AI</div>
        <div style="width:100%;height:2px;background:${T.border};border-radius:1px;margin-bottom:10px;overflow:hidden;">
          <div style="width:67%;height:100%;background:${T.accent};border-radius:1px;"></div>
        </div>
        <span style="font-size:12px;color:${T.textMuted};margin-bottom:28px;">1.12 GB / 1.68 GB</span>
        <span style="font-size:12px;color:${T.textMuted};text-align:center;line-height:18px;max-width:260px;">Keep the app open or lock your screen — the download continues automatically.</span>
      </div>`),
  },

  // 4. Chat — empty
  {
    name: '04_chat_empty',
    html: base(`
      ${Header()}
      <div style="padding:28px 16px 110px;display:flex;flex-direction:column;align-items:center;">
        <div style="margin-bottom:14px;">${SVG.car(T.accent, 44)}</div>
        <div style="font-size:19px;font-weight:700;color:${T.textPrimary};text-align:center;margin-bottom:6px;letter-spacing:-0.3px;">Ask anything about your car</div>
        <div style="font-size:13px;color:${T.textSub};text-align:center;margin-bottom:22px;line-height:20px;">Specs, repairs, diagnostics — just type below.</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;">
          ${[
            ['Check Engine', 'What does P0300 mean?'],
            ['Brake Pads', 'How to replace at home?'],
            ['Compare Cars', 'Camry vs Accord?'],
            ['Used Car Tips', 'What to check first?'],
          ].map(([title, sub]) => `
            <div style="background:${T.bgSoft};border:1px solid ${T.border};border-radius:12px;padding:13px;cursor:pointer;">
              <div style="font-size:13px;font-weight:600;color:${T.textPrimary};margin-bottom:3px;">${title}</div>
              <div style="font-size:11px;color:${T.textSub};line-height:15px;">${sub}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ${FloatingInput()}`),
  },

  // 5. Chat — active
  {
    name: '05_chat_active',
    html: base(`
      ${Header()}
      <div style="padding:18px 16px 110px;display:flex;flex-direction:column;gap:11px;overflow:hidden;">
        <!-- User bubble -->
        <div style="display:flex;justify-content:flex-end;">
          <div style="background:${T.userBubble};color:#fff;padding:11px 16px;border-radius:20px;border-bottom-right-radius:5px;max-width:82%;font-size:14px;line-height:21px;font-family:'Inter',sans-serif;">
            My check engine light is on with code P0300 — what does it mean?
          </div>
        </div>
        <!-- AI bubble -->
        <div style="display:flex;justify-content:flex-start;">
          <div style="background:${T.bgSoft};padding:12px 14px;border-radius:20px;border-bottom-left-radius:5px;max-width:88%;font-size:14px;line-height:21px;color:${T.textPrimary};font-family:'Inter',sans-serif;">
            <div style="font-size:10px;font-weight:600;color:${T.textMuted};margin-bottom:7px;letter-spacing:0.7px;">CAR AI</div>
            <b>P0300</b> means a random/multiple cylinder misfire.<br><br>
            Common causes:<br>
            &nbsp;• Worn spark plugs<br>
            &nbsp;• Failing ignition coil<br>
            &nbsp;• Low fuel pressure<br><br>
            Start with spark plug replacement — most common fix.
          </div>
        </div>
        <!-- User bubble 2 -->
        <div style="display:flex;justify-content:flex-end;">
          <div style="background:${T.userBubble};color:#fff;padding:11px 16px;border-radius:20px;border-bottom-right-radius:5px;max-width:70%;font-size:14px;line-height:21px;font-family:'Inter',sans-serif;">
            How much do spark plugs cost?
          </div>
        </div>
        <!-- Typing skeleton -->
        <div style="display:flex;justify-content:flex-start;">
          <div style="background:${T.bgSoft};padding:12px 14px;border-radius:20px;border-bottom-left-radius:5px;max-width:65%;display:flex;flex-direction:column;gap:8px;">
            <div style="width:38px;height:7px;background:${T.border};border-radius:4px;"></div>
            <div style="width:130px;height:9px;background:${T.border};border-radius:5px;opacity:0.7;"></div>
            <div style="width:95px;height:9px;background:${T.border};border-radius:5px;opacity:0.5;"></div>
          </div>
        </div>
      </div>
      ${FloatingInput()}`),
  },

  // 6. Sidebar
  {
    name: '06_sidebar',
    html: base(`
      <!-- Dark backdrop -->
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.32);"></div>
      <!-- Drawer panel -->
      <div style="position:absolute;top:0;left:0;bottom:0;width:78%;max-width:300px;background:${T.bg};border-right:1px solid ${T.border};display:flex;flex-direction:column;padding:52px 0 24px;">
        <!-- Brand -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0 16px 18px;">
          <span style="font-size:16px;font-weight:700;color:${T.textPrimary};">Car AI</span>
          ${SVG.x()}
        </div>
        <!-- User -->
        <div style="display:flex;align-items:center;gap:10px;padding:0 16px 16px;border-bottom:1px solid ${T.border};margin-bottom:13px;">
          <div style="width:34px;height:34px;border-radius:17px;background:${T.accent};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0;">S</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:${T.textPrimary};">Sameer</div>
            <div style="font-size:11px;color:${T.textMuted};margin-top:1px;">sameer@email.com</div>
          </div>
        </div>
        <!-- Action buttons -->
        <div style="display:flex;gap:8px;padding:0 16px;margin-bottom:13px;">
          <div style="flex:1;border:1px solid ${T.border};border-radius:9px;padding:9px 8px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${SVG.logout()}<span style="font-size:12px;font-weight:600;color:${T.accent};">Sign out</span>
          </div>
          <div style="flex:1;border:1px solid ${T.border};border-radius:9px;padding:9px 8px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${SVG.moon(T.textSub)}<span style="font-size:12px;font-weight:600;color:${T.textSub};">Dark</span>
          </div>
        </div>
        <!-- New chat -->
        <div style="margin:0 16px 18px;background:${T.accent};border-radius:100px;padding:12px;display:flex;align-items:center;justify-content:center;gap:7px;">
          ${SVG.plus()}<span style="font-size:13px;font-weight:700;color:#FFF;">New chat</span>
        </div>
        <!-- Section -->
        <div style="font-size:10px;font-weight:700;color:${T.textMuted};letter-spacing:0.8px;padding:0 16px;margin-bottom:8px;">RECENT</div>
        <!-- History -->
        ${[
          { t:'Toyota Camry vs Honda Accord', active:true },
          { t:'How to change engine oil',     active:false },
          { t:'P0300 engine misfire fix',      active:false },
          { t:'Best used cars under $10k',     active:false },
        ].map(h => `
          <div style="display:flex;align-items:center;margin:0 16px;padding:9px 10px;border-radius:9px;margin-bottom:3px;${h.active ? `background:${T.accentSoft};` : ''}">
            <div style="margin-right:8px;">${SVG.msg(h.active ? T.accent : T.textMuted)}</div>
            <span style="flex:1;font-size:12px;color:${h.active ? T.accent : T.textSub};${h.active?'font-weight:600;':''}white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${h.t}</span>
            ${SVG.trash()}
          </div>`).join('')}
        <!-- Footer -->
        <div style="margin-top:auto;padding:13px 16px 0;border-top:1px solid ${T.border};">
          <span style="font-size:11px;color:${T.textMuted};letter-spacing:0.4px;">Car AI · v2.0</span>
        </div>
      </div>`),
  },

  // 7. Auth modal
  {
    name: '07_auth_modal',
    html: base(`
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.38);display:flex;align-items:flex-end;">
        <div style="background:${T.bg};border-radius:24px 24px 0 0;border-top:1px solid ${T.border};padding:22px 24px 44px;width:100%;">
          <div style="width:34px;height:3px;background:${T.borderStrong};border-radius:2px;margin:0 auto 22px;"></div>
          <div style="font-size:20px;font-weight:700;color:${T.textPrimary};margin-bottom:4px;letter-spacing:-0.3px;">Welcome back</div>
          <div style="font-size:13px;color:${T.textSub};margin-bottom:20px;line-height:20px;">Sign in to access your saved conversations</div>
          <!-- Email -->
          <div style="margin-bottom:12px;">
            <div style="font-size:10px;font-weight:700;color:${T.textMuted};letter-spacing:0.7px;margin-bottom:5px;">EMAIL</div>
            <div style="background:${T.bgSoft};border:1px solid ${T.border};border-radius:11px;padding:12px 14px;font-size:14px;color:${T.textMuted};">user@example.com</div>
          </div>
          <!-- Password -->
          <div style="margin-bottom:20px;">
            <div style="font-size:10px;font-weight:700;color:${T.textMuted};letter-spacing:0.7px;margin-bottom:5px;">PASSWORD</div>
            <div style="background:${T.bgSoft};border:1px solid ${T.border};border-radius:11px;padding:12px 14px;font-size:14px;color:${T.textMuted};">••••••••</div>
          </div>
          <!-- CTA -->
          <div style="background:${T.accent};border-radius:100px;padding:14px;text-align:center;color:#FFF;font-size:15px;font-weight:600;margin-bottom:12px;">Sign in</div>
          <div style="text-align:center;font-size:12px;color:${T.accent};padding:7px;">Don't have an account? Sign up</div>
          <div style="text-align:center;font-size:12px;color:${T.textMuted};padding:4px;">Continue without account</div>
        </div>
      </div>`),
  },
];

// ─── Run ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 Launching Chromium...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-web-security'] });
  const page    = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  for (const screen of screens) {
    console.log(`📸 ${screen.name}`);
    await page.setContent(screen.html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 200)); // let fonts settle
    await page.screenshot({ path: path.join(OUT_DIR, `${screen.name}.png`), fullPage: false });
  }

  await browser.close();
  console.log(`\n✅ Done! ${screens.length} screenshots → ${OUT_DIR}`);
  screens.forEach(s => console.log(`   ${s.name}.png`));
})();
