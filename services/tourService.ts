import { driver } from "driver.js";
import { TranslationSet } from "./i18n";

export const createTour = (t: TranslationSet, tourType: string, onComplete: () => void) => {
  let steps: any[] = [];

  if (tourType === 'dashboard') {
    steps = [
      {
        element: '#dashboard-hero',
        popover: {
          title: t.guide.dashboard.welcome.title,
          description: t.guide.dashboard.welcome.desc,
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '#nav-research',
        popover: {
          title: t.guide.dashboard.overview.title,
          description: t.guide.dashboard.overview.desc,
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#captured-intelligence',
        popover: {
          title: t.guide.dashboard.captured.title,
          description: t.guide.dashboard.captured.desc,
          side: "top",
          align: 'start'
        }
      },
      {
        element: '#guide-btn',
        popover: {
          title: t.guide.dashboard.next.title,
          description: t.guide.dashboard.next.desc,
          side: "top",
          align: 'start'
        }
      }
    ];
  } else if (tourType === 'research') {
    steps = [
      {
        element: '#research-mode-toggle',
        popover: {
          title: t.guide.research.modes.title,
          description: t.guide.research.modes.desc,
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '#research-terminal',
        popover: {
          title: t.guide.research.terminal.title,
          description: t.guide.research.terminal.desc,
          side: "bottom",
          align: 'start'
        }
      }
    ];
  } else if (tourType === 'factChecker') {
    steps = [
      {
        element: '#fact-checker-terminal',
        popover: {
          title: t.guide.factChecker.terminal.title,
          description: t.guide.factChecker.terminal.desc,
          side: "bottom",
          align: 'start'
        }
      }
    ];
  } else if (tourType === 'policy') {
    steps = [
      {
        element: '#policy-profile-status',
        popover: {
          title: t.guide.policy.profile.title,
          description: t.guide.policy.profile.desc,
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '#policy-terminal',
        popover: {
          title: t.guide.policy.terminal.title,
          description: t.guide.policy.terminal.desc,
          side: "bottom",
          align: 'start'
        }
      }
    ];
  } else if (tourType === 'finance') {
    steps = [
      {
        element: '#finance-terminal',
        popover: {
          title: t.guide.finance.terminal.title,
          description: t.guide.finance.terminal.desc,
          side: "bottom",
          align: 'start'
        }
      }
    ];
  } else if (tourType === 'models') {
    steps = [
      {
        element: '#models-vault',
        popover: {
          title: t.guide.models.vault.title,
          description: t.guide.models.vault.desc,
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '#models-marketplace',
        popover: {
          title: t.guide.models.marketplace.title,
          description: t.guide.models.marketplace.desc,
          side: "bottom",
          align: 'start'
        }
      }
    ];
  } else if (tourType === 'about') {
    steps = [
      {
        element: '#about-content',
        popover: {
          title: t.guide.about.mission.title,
          description: t.guide.about.mission.desc,
          side: "bottom",
          align: 'start'
        }
      }
    ];
  } else if (tourType === 'profile') {
    steps = [
      {
        element: '#profile-form',
        popover: {
          title: t.guide.profile.form.title,
          description: t.guide.profile.form.desc,
          side: "bottom",
          align: 'start'
        }
      }
    ];
  }

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    onDestroyed: () => {
      if (tourType === 'dashboard') {
        localStorage.setItem('factium_tour_completed', 'true');
      }
      onComplete();
    },
    steps
  });

  return driverObj;
};
