export const theme = {
  colors: { ink: '#122B3D', text: '#344555', muted: '#596575', primary: '#087F79', primarySoft: '#E2F0ED', canvas: '#FAF7F2', surface: '#FFFFFF', border: '#DDD9D3', accent: '#EAE4DB', error: '#A23B36', errorSoft: '#FFF0ED', warning: '#775617', warningSoft: '#FFF5DA' },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 10, md: 12, lg: 24, pill: 99 },
  type: { caption: 12, body: 15, label: 14, section: 18, heading: 23, hero: 32 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' } as const,
  shadow: { shadowColor: '#122B3D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  screenPadding: 20, contentWidth: 640,
} as const;
