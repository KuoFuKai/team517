// 517 brand style guide (docs/517 brand style guide.pdf).
// Named brand colours are exact. Values marked "derived" are the named colour
// blended toward Oat, or darkened for legible text, because the guide names
// seven colours and the UI needs soft fills and text-safe variants of them.
const brand = {
  deepPine: '#1F3D36',    // Primary — text and structure
  terracotta: '#C8553D',  // Primary accent — restrained
  sage: '#8FB39A',        // Supporting — supportive states
  marigold: '#E9A23B',    // Supporting — upcoming, needs attention
  oat: '#F6EFE4',         // Supporting — warm foundation
  stone: '#6B6A64',       // Supporting — secondary text
  alertBrick: '#A3312A',  // Alert — urgent or missed only
} as const;
export const theme = {
  brand,
  colors: {
    ink: brand.deepPine, text: brand.deepPine, muted: brand.stone,
    subtle: '#938F86',            // derived: Stone toward Oat, placeholders only
    primary: brand.deepPine, primarySoft: '#DEE9E1', // derived: Sage toward Oat
    canvas: brand.oat, surface: '#FFFFFF',
    border: '#DCD1BC',            // derived: Oat darkened, cards and dividers
    outline: '#B9A98D',           // derived: Oat darkened further, interactive control outlines
    accent: '#EDE4D4',            // derived: Oat darkened, segmented track
    terracotta: brand.terracotta, marigold: brand.marigold,
    sage: '#4F7560',              // derived: Sage darkened to read as text
    sageSoft: '#DEE9E1',          // derived: Sage toward Oat
    error: brand.alertBrick, errorSoft: '#F6E4E1', // derived: Alert Brick toward Oat
    warning: '#8A5A14',           // derived: Marigold darkened to read as text
    warningSoft: '#FBEFD9',       // derived: Marigold toward Oat
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 10, md: 12, field: 14, lg: 24, pill: 99 },
  // Body copy stays at or above 16px, per the guide's readability rule.
  type: { caption: 12, body: 16, label: 14, section: 18, heading: 24, hero: 32 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' } as const,
  // Fraunces for headings, Inter for body, per the guide's typography rules.
  // Custom faces encode their own weight, so each weight needs its own file.
  font: { body: 'Inter_400Regular', bodyMedium: 'Inter_500Medium', bodySemibold: 'Inter_600SemiBold', bodyBold: 'Inter_700Bold', display: 'Fraunces_600SemiBold', displayBold: 'Fraunces_700Bold' },
  shadow: { shadowColor: brand.deepPine, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  screenPadding: 20, contentWidth: 640,
} as const;
