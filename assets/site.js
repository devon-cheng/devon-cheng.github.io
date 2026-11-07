(() => {
  for (const gallery of document.querySelectorAll('[data-gallery]')) {
    const tabs = Array.from(gallery.querySelectorAll('[role="tab"]'));
    const selectTab = selected => {
      for (const tab of tabs) {
        const active = tab === selected;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      }
    };
    for (const [index, tab] of tabs.entries()) {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        const destinations = {
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          ArrowRight: (index + 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1
        };
        const destination = destinations[event.key];
        if (destination === undefined) return;
        event.preventDefault();
        selectTab(tabs[destination]);
        tabs[destination].focus();
      });
    }
  }

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!motionPreference.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('has-motion');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.06 });
    document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
    motionPreference.addEventListener('change', event => {
      if (event.matches) document.documentElement.classList.remove('has-motion');
    });
  }

  const galleryLinks = Array.from(document.querySelectorAll('[data-lightbox]'));
  const dialog = document.querySelector('.lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    const image = dialog.querySelector('.lightbox-image');
    const caption = dialog.querySelector('.lightbox-caption');
    const count = dialog.querySelector('.lightbox-count');
    const closeButton = dialog.querySelector('[data-close]');
    const zoomButton = dialog.querySelector('[data-zoom]');
    const originalLink = dialog.querySelector('[data-original]');
    let activeIndex = 0;
    let trigger = null;
    const showImage = index => {
      activeIndex = (index + galleryLinks.length) % galleryLinks.length;
      const link = galleryLinks[activeIndex];
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      originalLink.href = link.href;
      dialog.classList.remove('is-zoomed');
      zoomButton.setAttribute('aria-pressed', 'false');
      zoomButton.textContent = 'Zoom in';
      caption.textContent = link.dataset.caption;
      count.textContent = `${activeIndex + 1} / ${galleryLinks.length} · Product screenshots`;
    };
    for (const [index, link] of galleryLinks.entries()) {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        trigger = link;
        showImage(index);
        dialog.showModal();
        document.body.classList.add('modal-open');
        closeButton.focus();
      });
    }
    closeButton.addEventListener('click', () => dialog.close());
    zoomButton.addEventListener('click', () => {
      const zoomed = dialog.classList.toggle('is-zoomed');
      zoomButton.setAttribute('aria-pressed', String(zoomed));
      zoomButton.textContent = zoomed ? 'Fit to screen' : 'Zoom in';
    });
    dialog.querySelector('[data-prev]').addEventListener('click', () => showImage(activeIndex - 1));
    dialog.querySelector('[data-next]').addEventListener('click', () => showImage(activeIndex + 1));
    dialog.addEventListener('keydown', event => {
      if (dialog.classList.contains('is-zoomed') && event.target.closest('.lightbox-image-wrap')) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(activeIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showImage(activeIndex + 1); }
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      trigger?.focus({ preventScroll: true });
    });
  }

  const sectionLinks = Array.from(document.querySelectorAll('.case-nav a'));
  if (sectionLinks.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      const current = visible[0].target.id;
      for (const link of sectionLinks) {
        if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }, { rootMargin: '-14% 0px -66% 0px', threshold: 0 });
    sectionLinks.forEach(link => {
      const target = document.getElementById(link.hash.slice(1));
      if (target) sectionObserver.observe(target);
    });
  }
})();
