import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const topicsDir = path.join(rootDir, 'src', 'data', 'topics');
const publicDir = path.join(rootDir, 'public');

const SITE_URL = 'https://www.arfat.app';
const OG_IMAGE = 'https://i.ibb.co/RHyk2rm/Arfatur-Rahman.jpg';

function run() {
  if (!fs.existsSync(distDir)) {
    console.error('dist directory does not exist! Please run vite build first.');
    process.exit(1);
  }

  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found!');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const files = fs.readdirSync(topicsDir).filter((f) => f.endsWith('.json'));

  console.log(`Found ${files.length} topic JSON files. Pre-rendering metadata...`);

  const sitemapUrls = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ];

  for (const file of files) {
    const slug = file.replace(/\.json$/, '');
    const jsonPath = path.join(topicsDir, file);
    let topicData;

    try {
      topicData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      console.warn(`Failed to parse ${file}, skipping.`);
      continue;
    }

    const heading = topicData.heading || slug;
    const subheading = topicData.subheading || 'Interactive study notes and question cards.';
    const itemCount = Array.isArray(topicData.items) ? topicData.items.length : 0;
    const pageTitle = `${heading} | Cognition Study Platform (by Arfatur Rahman)`;
    const pageDesc = `${subheading} - Interactive study notes and ${itemCount} question cards. Engineered by Arfatur Rahman.`;
    const topicUrl = `${SITE_URL}/topics/${slug}`;
    const keywords = [
      heading,
      subheading,
      slug,
      'Study Questions',
      'Quiz',
      'Education',
      'Arfatur Rahman',
      'Cognition Platform',
    ].join(', ');

    // Build Schema.org Quiz JSON-LD
    const sampleItems = Array.isArray(topicData.items) ? topicData.items.slice(0, 50) : [];
    const quizSchema = {
      '@context': 'https://schema.org',
      '@type': 'Quiz',
      name: heading,
      description: subheading,
      url: topicUrl,
      author: {
        '@type': 'Person',
        name: 'Arfatur Rahman',
        url: SITE_URL,
        image: OG_IMAGE,
      },
      publisher: {
        '@type': 'Person',
        name: 'Arfatur Rahman',
        url: SITE_URL,
      },
      provider: {
        '@type': 'Organization',
        name: 'Cognition Study Platform',
        url: SITE_URL,
      },
      hasPart: sampleItems.map((item, idx) => ({
        '@type': 'Question',
        name: `Question ${idx + 1}`,
        text: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    };

    let html = templateHtml;

    // 1. Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);

    // 2. Replace or inject Canonical link
    if (html.includes('rel="canonical"')) {
      html = html.replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${topicUrl}">`);
    } else {
      html = html.replace(
        /<\/head>/i,
        `    <link rel="canonical" href="${topicUrl}">\n  </head>`
      );
    }

    // 3. Replace Meta Description & Keywords
    html = html.replace(
      /<meta name="description"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(pageDesc)}">`
    );
    html = html.replace(
      /<meta name="keywords"[^>]*>/i,
      `<meta name="keywords" content="${escapeHtml(keywords)}">`
    );

    // 4. Replace Open Graph tags
    html = html.replace(
      /<meta property="og:title"[^>]*>/i,
      `<meta property="og:title" content="${escapeHtml(pageTitle)}">`
    );
    html = html.replace(
      /<meta property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${escapeHtml(pageDesc)}">`
    );
    html = html.replace(
      /<meta property="og:url"[^>]*>/i,
      `<meta property="og:url" content="${topicUrl}">`
    );
    html = html.replace(
      /<meta property="og:type"[^>]*>/i,
      `<meta property="og:type" content="article">`
    );

    // 5. Replace Twitter tags
    html = html.replace(
      /<meta name="twitter:title"[^>]*>/i,
      `<meta name="twitter:title" content="${escapeHtml(pageTitle)}">`
    );
    html = html.replace(
      /<meta name="twitter:description"[^>]*>/i,
      `<meta name="twitter:description" content="${escapeHtml(pageDesc)}">`
    );

    // 6. Invalidate or update dynamic schema
    const schemaScriptTag = `<script id="cognition-schema" type="application/ld+json">${JSON.stringify(
      quizSchema
    )}</script>`;
    if (html.includes('id="cognition-schema"')) {
      html = html.replace(/<script id="cognition-schema"[^>]*>.*?<\/script>/is, schemaScriptTag);
    } else {
      html = html.replace(/<\/head>/i, `    ${schemaScriptTag}\n  </head>`);
    }

    // 7. Write to dist/topics/[slug]/index.html & dist/topics/[slug].html
    const topicSubDir = path.join(distDir, 'topics', slug);
    fs.mkdirSync(topicSubDir, { recursive: true });
    fs.writeFileSync(path.join(topicSubDir, 'index.html'), html, 'utf8');

    // Also write dist/topics/[slug].html for flat servers
    const flatTopicDir = path.join(distDir, 'topics');
    fs.writeFileSync(path.join(flatTopicDir, `${slug}.html`), html, 'utf8');

    sitemapUrls.push(
      `  <url>\n    <loc>${topicUrl}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    );

    console.log(`  ✓ Generated metadata for: /topics/${slug}`);
  }

  // Generate complete sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join(
    '\n'
  )}\n</urlset>\n`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log(`  ✓ Updated sitemap.xml with ${sitemapUrls.length} routes.`);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

run();
