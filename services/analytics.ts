import ReactGA from "react-ga4";

// Замініть на ваш Measurement ID з Google Analytics 4
const MEASUREMENT_ID = "G-0Q3R03CYK3";

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
