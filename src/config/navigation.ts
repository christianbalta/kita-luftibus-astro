interface BaseNavItem {
  title: string;
  url: string;
}

interface NavItemWithSubpages extends BaseNavItem {
  subpages: Record<string, BaseNavItem>;
}

type NavItem = BaseNavItem | NavItemWithSubpages;

interface SiteMap {
  main_navigation: Record<string, NavItem>;
}

export const sitemap: SiteMap = {
  main_navigation: {
    home: {
      title: "Startseite",
      url: "/"
    },
    about: {
      title: "Über uns",
      url: "/ueber-uns"
    },
    educational_concept: {
      title: "Pädagogisches Konzept",
      url: "/paedagogisches-konzept",
      subpages: {
        portfolio_folder: {
          title: "Portfolio-Ordner",
          url: "/paedagogisches-konzept/portfolio-ordner"
        },
        portfolio_concept_in_images: {
          title: "Portfolio Konzept in Bildern",
          url: "/paedagogisches-konzept/portfolio-konzept-in-bildern"
        },
        klax_certification: {
          title: "KLAX-Zertifizierungen",
          url: "/paedagogisches-konzept/klax-zertifizierung"
        }
      }
    },
    rates_and_information: {
      title: "Tarife & Info",
      url: "/tarife-und-informationen",
      subpages: {
        opening_hours: {
          title: "Öffnungszeiten",
          url: "/tarife-und-informationen/oeffnungszeiten"
        },
        useful_information_for_parents: {
          title: "Wissenswertes für Eltern",
          url: "/tarife-und-informationen/wissenswertes-fuer-eltern"
        },
        operating_regulations: {
          title: "Betriebsreglement",
          url: "/tarife-und-informationen/betriebsreglement"
        }
      }
    },
    available_places_and_registration: {
      title: "Verfügbare Plätze & Anmeldung",
      url: "/verfuegbare-plaetze-und-anmeldung",
    },
    weekly_menu_plan: {
      title: "Menü",
      url: "/wochenmenueplan"
    }
  }
};

function hasSubpages(item: NavItem): item is NavItemWithSubpages {
  return 'subpages' in item;
}

interface NavigationItem {
  href: string;
  label: string;
  hasSubmenu?: boolean;
  isSubItem?: boolean;
  parentUrl?: string;
}

export function getMainNavItems(): NavigationItem[] {
  return Object.values(sitemap.main_navigation).map(item => ({
    href: item.url,
    label: item.title,
    hasSubmenu: hasSubpages(item)
  }));
}

export function getAllNavItems(): NavigationItem[] {
  const items: NavigationItem[] = [];

  Object.values(sitemap.main_navigation).forEach(mainItem => {
    items.push({
      href: mainItem.url,
      label: mainItem.title,
      hasSubmenu: hasSubpages(mainItem)
    });

    if (hasSubpages(mainItem)) {
      Object.values(mainItem.subpages).forEach(subItem => {
        items.push({
          href: subItem.url,
          label: subItem.title,
          isSubItem: true,
          parentUrl: mainItem.url
        });
      });
    }
  });

  return items;
}
