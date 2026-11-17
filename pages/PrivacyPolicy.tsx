import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from '../components/SEO';
import { setCookieConsent, getCookieConsent } from '../lib/cookieConsent';

export const PrivacyPolicy: React.FC = () => {
  const { language } = useLanguage();
  const uk = language === 'uk';

  const resetCookies = () => {
    localStorage.removeItem('kmmr_cookie_consent');
    window.location.reload();
  };

  return (
    <div className="py-16 md:py-24 bg-white dark:bg-gray-950 transition-colors">
      <SEO
        title={uk ? 'Політика конфіденційності | КММР' : 'Privacy Policy | KCYC'}
        description={
          uk
            ? 'Як Київська Міська Молодіжна Рада обробляє персональні дані та використовує файли cookie.'
            : 'How Kyiv City Youth Council processes personal data and uses cookies.'
        }
        url="https://kmmr.org/privacy"
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray dark:prose-invert">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 not-prose">
          <Link to="/" className="text-kmmr-pink font-semibold hover:underline">
            ← {uk ? 'На головну' : 'Home'}
          </Link>
        </p>

        <h1 className="text-3xl md:text-4xl font-black text-kmmr-blue dark:text-white mb-2">
          {uk ? 'Політика конфіденційності' : 'Privacy Policy'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          {uk ? 'Оновлено: 21 жовтня 2026' : 'Updated: 21 October 2026'}
        </p>

        {uk ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">1. Хто ми</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Київська Міська Молодіжна Рада (КММР) — громадська організація. Контакти:{' '}
              <a className="text-kmmr-pink" href="mailto:kyiv.city.yc.nycu@gmail.com">
                kyiv.city.yc.nycu@gmail.com
              </a>
              , м. Київ, вул. Хрещатик, 36. Сайт: kmmr.org.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">2. Які дані збираємо</h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>
                <strong>Форми заявок</strong> (приєднання до команди, підтримка ініціатив, можливості, практика, розсилка): імʼя, телефон, email, теги соцмереж, обраний відділ, мотивація / опис проєкту та інші відповіді, які ви самі вказуєте.
              </li>
              <li>
                <strong>Технічні дані</strong>: IP та дані браузера можуть оброблятися хостингом / Firebase як частина роботи сервісу.
              </li>
              <li>
                <strong>Аналітика (лише за згодою)</strong>: Google Analytics 4 — знеособлена статистика відвідувань сторінок.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">3. Навіщо</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Дані з форм потрібні, щоб розглянути вашу заявку, звʼязатися з вами та вести облік звернень. Аналітика — щоб покращувати сайт. Ми не продаємо персональні дані третім сторонам.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">4. Зберігання та безпека</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Дані зберігаються в хмарних сервісах Google Firebase. Доступ до заявок мають уповноважені адміністратори КММР. Термін зберігання — доки дані потрібні для зазначеної мети або до вашого запиту на видалення (якщо немає законних підстав тримати довше).
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">5. Cookie</h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>
                <strong>Необхідні</strong> — мова, тема оформлення, технічна робота сайту.
              </li>
              <li>
                <strong>Аналітичні</strong> — Google Analytics лише після натискання «Прийняти» у банері.
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Поточний вибір:{' '}
              <strong>
                {getCookieConsent() === 'accepted'
                  ? 'аналітику прийнято'
                  : getCookieConsent() === 'rejected'
                    ? 'лише необхідні'
                    : 'ще не обрано'}
              </strong>
              .{' '}
              <button
                type="button"
                onClick={resetCookies}
                className="text-kmmr-pink font-semibold underline underline-offset-2"
              >
                Змінити налаштування cookie
              </button>
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">6. Ваші права</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Ви можете звернутися на email вище з запитом щодо доступу, виправлення або видалення ваших даних із заявок. Також можете відкликати згоду на аналітику через зміну налаштувань cookie.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">1. Who we are</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Kyiv City Youth Council (KCYC / KMMR) is a civil society organisation. Contact:{' '}
              <a className="text-kmmr-pink" href="mailto:kyiv.city.yc.nycu@gmail.com">
                kyiv.city.yc.nycu@gmail.com
              </a>
              , 36 Khreshchatyk St., Kyiv. Website: kmmr.org.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">2. What we collect</h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>
                <strong>Application forms</strong> (join the team, initiative support, opportunities, internship, newsletter): name, phone, email, social tags, department, motivation / project description and other answers you provide.
              </li>
              <li>
                <strong>Technical data</strong>: IP and browser data may be processed by hosting / Firebase as part of service operation.
              </li>
              <li>
                <strong>Analytics (consent only)</strong>: Google Analytics 4 — aggregated page-view statistics.
              </li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">3. Why</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Form data is used to review your application, contact you, and keep records of requests. Analytics helps improve the website. We do not sell personal data to third parties.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">4. Storage and security</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Data is stored in Google Firebase cloud services. Access to submissions is limited to authorised KMMR administrators. We keep data only as long as needed for these purposes or until you request deletion (unless a longer retention is required by law).
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">5. Cookies</h2>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>
                <strong>Necessary</strong> — language, theme, basic site function.
              </li>
              <li>
                <strong>Analytics</strong> — Google Analytics only after you click «Accept» on the banner.
              </li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Current choice:{' '}
              <strong>
                {getCookieConsent() === 'accepted'
                  ? 'analytics accepted'
                  : getCookieConsent() === 'rejected'
                    ? 'necessary only'
                    : 'not set yet'}
              </strong>
              .{' '}
              <button
                type="button"
                onClick={resetCookies}
                className="text-kmmr-pink font-semibold underline underline-offset-2"
              >
                Change cookie settings
              </button>
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-3">6. Your rights</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You may email us to request access, correction, or deletion of your application data. You can also withdraw analytics consent via cookie settings.
            </p>
          </>
        )}

        <div className="mt-10 not-prose">
          <button
            type="button"
            onClick={() => {
              setCookieConsent('rejected');
              alert(uk ? 'Аналітику вимкнено.' : 'Analytics disabled.');
            }}
            className="text-sm font-semibold text-gray-500 hover:text-kmmr-pink"
          >
            {uk ? 'Вимкнути аналітику зараз' : 'Disable analytics now'}
          </button>
        </div>
      </article>
    </div>
  );
};
