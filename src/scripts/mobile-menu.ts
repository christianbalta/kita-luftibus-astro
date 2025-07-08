export function initializeMobileMenu(): void {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle') as HTMLElement | null;
  const mobileMenu = document.getElementById('mobile-menu') as HTMLElement | null;
  const mobileMenuClose = document.getElementById('mobile-menu-close') as HTMLElement | null;

  function openMobileMenu(): void {
    mobileMenu?.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu(): void {
    mobileMenu?.classList.add('translate-x-full');
    document.body.style.overflow = '';
  }

  // Event listeners for menu toggle
  mobileMenuToggle?.addEventListener('click', openMobileMenu);
  mobileMenuClose?.addEventListener('click', closeMobileMenu);

  // Toggle submenu visibility
  document.querySelectorAll('[data-toggle-submenu]').forEach((toggle: Element) => {
    toggle.addEventListener('click', function (this: HTMLElement, e: Event) {
      const target = e.target as HTMLElement;
      const currentElement = this;

      // Prevent navigation if clicking on the toggle area (but not on the link)
      if (target === currentElement || target.classList.contains('submenu-icon')) {
        e.preventDefault();

        // Find the submenu
        const submenu = currentElement.nextElementSibling as HTMLElement;

        // Toggle submenu visibility
        submenu?.classList.toggle('hidden');

        // Toggle icon between plus and minus
        const icon = currentElement.querySelector('.submenu-icon') as HTMLElement;
        if (icon && submenu) {
          if (submenu.classList.contains('hidden')) {
            icon.classList.remove('fa-minus');
            icon.classList.add('fa-plus');
          } else {
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-minus');
          }
        }
      }
    });
  });

  // Close the mobile menu when clicking on navigation links
  document.querySelectorAll('#mobile-menu a[href^="/"]').forEach((link: Element) => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close the mobile menu when clicking outside
  mobileMenu?.addEventListener('click', function (e: Event) {
    const target = e.target as HTMLElement;
    if (target === mobileMenu) {
      closeMobileMenu();
    }
  });
}

