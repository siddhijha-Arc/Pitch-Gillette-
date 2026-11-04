/**
 * Real Native PowerPoint (.pptx) Generator
 *
 * Uses pptxgenjs to build structured investor pitch presentations
 * with styled master themes, metric callouts, and clean layout geometry.
 */

import pptxgen from 'pptxgenjs';
import { PitchDeckSlide, StartupIdea } from '../types/index.ts';

export type DeckThemeName = 'EXECUTIVE_DARK' | 'MODERN_LIGHT' | 'VENTURE_NAVY' | 'MINIMAL_INDIGO';

interface ThemeTokens {
  bg: string;
  cardBg: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  accentColor: string;
  accentBg: string;
  borderColor: string;
}

const THEMES: Record<DeckThemeName, ThemeTokens> = {
  EXECUTIVE_DARK: {
    bg: '0F172A',         // Slate 900
    cardBg: '1E293B',     // Slate 800
    titleColor: 'F8FAFC', // Slate 50
    subtitleColor: '94A3B8', // Slate 400
    bodyColor: 'CBD5E1',  // Slate 300
    accentColor: '6366F1', // Indigo 500
    accentBg: '312E81',
    borderColor: '334155',
  },
  MODERN_LIGHT: {
    bg: 'FFFFFF',
    cardBg: 'F8FAFC',
    titleColor: '0F172A',
    subtitleColor: '475569',
    bodyColor: '334155',
    accentColor: '2563EB',
    accentBg: 'DBEAFE',
    borderColor: 'E2E8F0',
  },
  VENTURE_NAVY: {
    bg: '0A192F',
    cardBg: '112240',
    titleColor: 'CCD6F6',
    subtitleColor: '8892B0',
    bodyColor: 'A8B2D1',
    accentColor: '64FFDA',
    accentBg: '1E3A40',
    borderColor: '233554',
  },
  MINIMAL_INDIGO: {
    bg: '18181B',         // Zinc 900
    cardBg: '27272A',
    titleColor: 'FFFFFF',
    subtitleColor: 'A1A1AA',
    bodyColor: 'E4E4E7',
    accentColor: 'A855F7',
    accentBg: '3B0764',
    borderColor: '3F3F46',
  },
};

export async function generatePptxBuffer(
  idea: StartupIdea,
  slides: PitchDeckSlide[],
  themeName: DeckThemeName = 'EXECUTIVE_DARK'
): Promise<Buffer> {
  const theme = THEMES[themeName] || THEMES.EXECUTIVE_DARK;

  // Initialize PPTX document
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = `${idea.title} - Pitch Deck`;
  pres.subject = idea.tagline;
  pres.author = 'Pitch-Ready AI Evaluator';

  // Build each slide
  for (const slideData of slides) {
    const slide = pres.addSlide();
    slide.background = { color: theme.bg };

    // Slide Header: Category / Type & Progress tracker
    slide.addText(`SLIDE ${slideData.slideNumber} of ${slides.length} • ${slideData.slideType.replace('_', ' ')}`, {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      fontFace: 'Arial',
      color: theme.accentColor,
      bold: true,
      charSpacing: 2,
    });

    // Slide Title
    slide.addText(slideData.title, {
      x: 0.8,
      y: 0.85,
      w: 8.5,
      h: 0.8,
      fontSize: 26,
      fontFace: 'Arial',
      color: theme.titleColor,
      bold: true,
    });

    // Subtitle / Framing
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.8,
        y: 1.65,
        w: 8.5,
        h: 0.5,
        fontSize: 14,
        fontFace: 'Arial',
        color: theme.subtitleColor,
        italic: true,
      });
    }

    // Main Bullet Points Card Container
    slide.addShape(pres.ShapeType.rect, {
      x: 0.8,
      y: 2.3,
      w: 8.0,
      h: 4.2,
      fill: { color: theme.cardBg },
      line: { color: theme.borderColor, width: 1 },
      rectRadius: 0.1,
    });

    // Render formatted bullet points inside card
    const bulletItems = slideData.bullets.map((b) => ({
      text: b,
      options: {
        fontSize: 14,
        fontFace: 'Arial',
        color: theme.bodyColor,
        bullet: true,
        breakLine: true,
        paraSpaceAfter: 16,
      },
    }));

    slide.addText(bulletItems, {
      x: 1.1,
      y: 2.5,
      w: 7.4,
      h: 3.8,
    });

    // Right Side Metric Callout Box (if available)
    if (slideData.metricCallout) {
      slide.addShape(pres.ShapeType.rect, {
        x: 9.2,
        y: 2.3,
        w: 3.3,
        h: 2.6,
        fill: { color: theme.cardBg },
        line: { color: theme.accentColor, width: 1.5 },
        rectRadius: 0.1,
      });

      slide.addText(slideData.metricCallout.label.toUpperCase(), {
        x: 9.4,
        y: 2.6,
        w: 2.9,
        h: 0.4,
        fontSize: 10,
        fontFace: 'Arial',
        color: theme.subtitleColor,
        bold: true,
        align: 'center',
      });

      slide.addText(slideData.metricCallout.value, {
        x: 9.4,
        y: 3.1,
        w: 2.9,
        h: 1.0,
        fontSize: 32,
        fontFace: 'Arial',
        color: theme.accentColor,
        bold: true,
        align: 'center',
      });
    }

    // Secondary Info / Citation Card
    slide.addShape(pres.ShapeType.rect, {
      x: 9.2,
      y: 5.1,
      w: 3.3,
      h: 1.4,
      fill: { color: theme.cardBg },
      line: { color: theme.borderColor, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText(`Pitch-Ready Evaluation`, {
      x: 9.4,
      y: 5.25,
      w: 2.9,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: theme.accentColor,
      bold: true,
    });

    const citationText = slideData.citation
      ? `Evidence Source: ${slideData.citation}`
      : `Audit Score: ${idea.overallReadinessScore}/100 • Stage: ${idea.stage}`;

    slide.addText(citationText, {
      x: 9.4,
      y: 5.6,
      w: 2.9,
      h: 0.7,
      fontSize: 9,
      fontFace: 'Arial',
      color: theme.subtitleColor,
    });

    // Slide Footer
    slide.addText(`${idea.title} | Pitch Deck`, {
      x: 0.8,
      y: 6.8,
      w: 5.0,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: theme.subtitleColor,
    });
  }

  // Export as Node Buffer
  const output = await pres.write({ outputType: 'nodebuffer' });
  return output as Buffer;
}
