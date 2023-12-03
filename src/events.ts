// This script must be injected to have access to window.Router. See inject.ts.
declare var Router: {
  change: (name?: 'album' | 'artist' | 'group' | 'request_line' | 'requests' | 'search', ...args: any[]) => void
  get_current_url: () => string
}

// add keyboard shortcuts
window.addEventListener('keydown', e => {
  // escape
  if (e.key === 'Escape') {
    // first close any open popups
    if (Router.get_current_url()) {
      // close any open popups by navigating to the home route
      Router.change()
    }
    // next close the Previously Played expanded view
    else {
      document.querySelector('.history_header:not(.history_expandable) > div')?.dispatchEvent(new Event('click'))
    }
  }
  // settings
  else if (e.metaKey && e.shiftKey && e.key === ',') {
    const settingsLink = $x("//*[contains(@class, 'menu')]//a[text()='Settings']")
    settingsLink?.dispatchEvent(new MouseEvent('click'))
  }
})
