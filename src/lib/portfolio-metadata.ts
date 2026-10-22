/**
 * Portfolio Metadata & Author Configuration
 * Extracted and synchronized directly from D:\Office\my-portfolio
 */

export const PORTFOLIO_METADATA = {
  // Author & Profile
  authorName: "Arfatur Rahman",
  authorEmail: "arfatrahman08@gmail.com",
  authorPhone: "+8801819439292",
  authorLocation: "Chittagong, Bangladesh",
  jobTitle: "Senior Full Stack Developer & AI Engineer",
  education: {
    institution: "Port City International University",
    degree: "BSc in Computer Science & Engineering",
  },

  // Primary Domains & Links
  siteUrl: "https://www.arfat.app",
  authorSEOLink: "https://www.linkedin.com/in/arfat-rahman/",
  previewImage: "/og-image.jpg",
  authorPhoto: "/img/me.webp",

  // Social Handles & Links
  twitterHandle: "@arfatapp",
  linkedinHandle: "arfatur-rahman",
  socialLinks: {
    portfolio: "https://www.arfat.app",
    linkedin: "https://www.linkedin.com/in/arfat-rahman/",
    github: "https://github.com/arfat-xyz",
    devto: "https://dev.to/arfatapp",
    medium: "https://medium.com/@arfatapp",
    facebook: "https://www.facebook.com/arfatapp/",
  },

  // Related Professional Profiles for Schema.org sameAs
  portfolioRelatedProfessionalProfiles: [
    "https://www.arfat.app",
    "https://www.linkedin.com/in/arfat-rahman/",
    "https://github.com/arfat-xyz",
    "https://dev.to/arfatapp",
    "https://medium.com/@arfatapp",
    "https://medium.com/@arfatxyz",
    "https://www.facebook.com/arfatapp/",
  ],

  // Analytics
  googleAnalyticsId: "G-H2GCT4GW1C",

  // Keywords from portfolio resume
  keywords: [
    "Arfatur Rahman",
    "Full Stack Developer",
    "Software Engineer Bangladesh",
    "Next.js Developer",
    "AI Engineer",
    "RAG Application Development",
    "LangChain Developer",
    "OpenAI Integration",
    "TypeScript Expert",
    "Azure Cloud Services",
    "SaaS Development",
    "Chatbot Development",
    "Web Application Developer",
    "Interactive JSON Study Platform",
    "Cognition Educational Platform",
    "Three.js Spatial Web",
  ],

  // Bio & Descriptions
  portfolioDescription:
    "Senior Full Stack Developer & AI Engineer specializing in Next.js, TypeScript, RAG, and LangChain. Building scalable SaaS platforms and AI-powered web applications.",
  projectDescription:
    "Cognition is an open-source, interactive JSON-driven study platform engineered with React, TypeScript, Tailwind CSS, Three.js spatial simulations, and dynamic educational quiz schemas.",
} as const;

/**
 * Generates Schema.org Person object for structured data integration
 */
export function getAuthorPersonSchema() {
  return {
    "@type": "Person",
    name: PORTFOLIO_METADATA.authorName,
    url: PORTFOLIO_METADATA.siteUrl,
    image: `${PORTFOLIO_METADATA.siteUrl}/og-image.jpg`,
    jobTitle: PORTFOLIO_METADATA.jobTitle,
    email: PORTFOLIO_METADATA.authorEmail,
    telephone: PORTFOLIO_METADATA.authorPhone,
    sameAs: PORTFOLIO_METADATA.portfolioRelatedProfessionalProfiles,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chittagong",
      addressCountry: "Bangladesh",
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: PORTFOLIO_METADATA.education.institution,
      description: PORTFOLIO_METADATA.education.degree,
    },
  };
}
