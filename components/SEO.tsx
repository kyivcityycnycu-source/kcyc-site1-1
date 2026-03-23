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
  url = 'https://kcyc.kyiv.ua/',
  image = 'https://firebasestorage.googleapis.com/v0/b/kcyc-site.firebasestorage.app/o/LOGO%20KCYC%2FGroup%206680%20(1).png?alt=media&token=a82c8a88-8e02-40ba-9bcc-9126138fe47e',
  type = 'website',
}) => {
  const { language } = useLanguage();

  const defaultTitle = language === 'uk' 
    ? 'Київська Міська Молодіжна Рада | КММР' 
    : 'Kyiv City Youth Council | KCYC';
    
  const defaultDescription = language === 'uk'
    ? "Київська Міська Молодіжна Рада (КММР) —  Найбільше волонтерське молодіжне обʼєднання Києва. Платформа для твого розвитку, реалізації ідей та впливу на життя столиці. Ставай частиною змін вже сьогодні."
    : "Kyiv City Youth Council (KCMY) — Kyiv's largest volunteer youth association. A platform for your development, realization of ideas, and influence on the life of the capital. Become part of the change today.";

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
