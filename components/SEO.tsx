import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  url = 'https://kmmr.org/',
  image = 'https://firebasestorage.googleapis.com/v0/b/kcyc-site.firebasestorage.app/o/LOGO%20KCYC%2FGroup%206680%20(1).png?alt=media&token=a82c8a88-8e02-40ba-9bcc-9126138fe47e',
  type = 'website',
}) => {
  const { language } = useLanguage();

  const defaultTitle = language === 'uk' 
    ? 'Київська Міська Молодіжна Рада | КММР' 
    : 'Kyiv City Youth Council | KCYC';
    
  const defaultDescription = language === 'uk'
    ? "Київська Міська Молодіжна Рада (КММР) —  Найбільше волонтерське молодіжне обʼєднання Києва. Платформа для консолідованої взаємодії учасників молодіжної політики міста Київ, з метою спільної роботи над розвитком молодіжної сфери та формування активної всебічно розвиненої молодої особистості."
    : "Kyiv City Youth Council (KCMY) — Kyiv's largest volunteer youth association. A platform for consolidated interaction of youth policy participants in the city of Kyiv, with the aim of joint work on the development of the youth sphere and the formation of an active, comprehensively developed young personality.";

  const defaultKeywords = language === 'uk'
    ? 'КММР, Київська Міська Молодіжна Рада, молодь Києва, молодіжна політика, громадські організації, волонтерство, молодіжні ініціативи'
    : 'KCYC, Kyiv City Youth Council, youth of Kyiv, youth policy, NGOs, volunteering, youth initiatives';

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <html lang={language} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />

      {/* Open Graph tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
