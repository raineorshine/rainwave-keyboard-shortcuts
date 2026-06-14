type Route = '' | 'album' | 'artist' | 'group' | 'listener' | 'request_line' | 'requests' | 'search'

// This script must be injected to have access to window.Router. See inject.ts.
declare var Router: {
  change: (name?: Route, ...args: any[]) => void
  get_current_url: () => Route
}

const keyToRating = {
  '1': 1,
  '!': 1.5,
  '2': 2,
  '@': 2.5,
  '3': 3,
  '#': 3.5,
  '4': 4,
  $: 4.5,
  '5': 5,
}

/** All keyboard shortcuts, grouped for display in the help dialog. */
const shortcutGroups: { title: string; shortcuts: [string, string][] }[] = [
  {
    title: 'Playback',
    shortcuts: [
      ['Space', 'Play / pause'],
      ['1–5', 'Rate the current song (whole stars)'],
      ['Shift + 1/2/3/4', 'Rate the current song half a star higher (1.5–4.5)'],
    ],
  },
  {
    title: 'Voting',
    shortcuts: [
      ['A/B/C', 'Vote for the next song'],
      ['Shift + A/B/C', 'Vote in the following round'],
      ['Cmd + A/B/C', 'Toggle the cover image of the next songs'],
      ['Cmd + Shift + A/B/C', 'Toggle the cover image of the following round'],
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      ['R', 'Toggle requests'],
      ['L', 'Toggle library'],
      ['Shift + L', 'Toggle the album of Now Playing in the library'],
      ['M', 'Toggle the album of Now Playing'],
      ['Shift + M', 'Toggle the album of Coming Up (1)'],
      ['Option + Shift + M', 'Toggle the album of Coming Up (2)'],
      ['T', 'Toggle the artist of Now Playing'],
      ['Shift + T', 'Toggle the artist of Coming Up (1)'],
      ['Cmd + Shift + T', 'Toggle the artist of Coming Up (2)'],
      ['S', 'Open search'],
      ['O', 'Toggle your profile'],
      ['V', 'Expand the album art'],
      ['P', 'Toggle previously played'],
      [',', 'Toggle settings'],
    ],
  },
  {
    title: 'General',
    shortcuts: [
      ['?', 'Show this help dialog'],
      ['Esc', 'Close the open modal / popup / previously played / expanded album art'],
    ],
  },
]

const HELP_DIALOG_ID = 'rw-shortcuts-help'

/** Closes the keyboard shortcuts help dialog if it is open. Returns true if a dialog was closing/open. */
const closeHelpDialog = (): boolean => {
  const existing = document.getElementById(HELP_DIALOG_ID)
  if (existing) {
    // already fading out
    if (existing.dataset.closing) return true
    existing.dataset.closing = 'true'
    existing.classList.add('rw-help-closing')
    existing.classList.remove('rw-help-visible')
    const remove = () => existing.remove()
    existing.addEventListener('transitionend', remove, { once: true })
    // fallback in case transitionend does not fire
    setTimeout(remove, 250)
    return true
  }
  return false
}

/** Toggles the keyboard shortcuts help dialog. */
const toggleHelpDialog = () => {
  if (closeHelpDialog()) return

  if (!document.getElementById('rw-shortcuts-help-style')) {
    const style = document.createElement('style')
    style.id = 'rw-shortcuts-help-style'
    style.textContent = `
      #${HELP_DIALOG_ID} {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        font-family: 'Roboto Condensed', sans-serif;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      #${HELP_DIALOG_ID}.rw-help-closing {
        transition: opacity 0.15s ease;
      }
      #${HELP_DIALOG_ID}.rw-help-visible {
        opacity: 1;
      }
      #${HELP_DIALOG_ID} .rw-help-panel {
        background: #1f2937;
        color: #e5e7eb;
        max-width: 640px;
        width: calc(100% - 40px);
        max-height: calc(100% - 80px);
        overflow-y: auto;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        padding: 24px 28px;
      }
      #${HELP_DIALOG_ID} .rw-help-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 0 16px;
      }
      #${HELP_DIALOG_ID} .rw-help-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #fff;
      }
      #${HELP_DIALOG_ID} .rw-help-close {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        padding: 0 4px;
      }
      #${HELP_DIALOG_ID} .rw-help-close:hover {
        color: #fff;
      }
      #${HELP_DIALOG_ID} h3 {
        margin: 18px 0 8px;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #60a5fa;
      }
      #${HELP_DIALOG_ID} table {
        width: 100%;
        border-collapse: collapse;
      }
      #${HELP_DIALOG_ID} td {
        padding: 4px 0;
        vertical-align: top;
        font-size: 14px;
      }
      #${HELP_DIALOG_ID} td.rw-help-keys {
        width: 40%;
        white-space: nowrap;
      }
      #${HELP_DIALOG_ID} kbd {
        display: inline-block;
        background: #374151;
        border: 1px solid #4b5563;
        border-bottom-width: 2px;
        border-radius: 4px;
        padding: 1px 6px;
        margin: 1px 2px 1px 0;
        font-family: inherit;
        font-size: 13px;
        color: #f9fafb;
      }
    `
    document.head.appendChild(style)
  }

  /** Renders a shortcut key string into <kbd> elements. */
  const renderKeys = (keys: string): string =>
    keys
      .split(' + ')
      .map(part => `<kbd>${part.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</kbd>`)
      .join(' + ')

  const overlay = document.createElement('div')
  overlay.id = HELP_DIALOG_ID

  const body = shortcutGroups
    .map(
      group =>
        `<h3>${group.title}</h3><table>${group.shortcuts
          .map(([keys, action]) => `<tr><td class="rw-help-keys">${renderKeys(keys)}</td><td>${action}</td></tr>`)
          .join('')}</table>`,
    )
    .join('')

  overlay.innerHTML = `
    <div class="rw-help-panel" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div class="rw-help-header">
        <h2>Keyboard Shortcuts</h2>
        <button class="rw-help-close" aria-label="Close">&times;</button>
      </div>
      ${body}
    </div>
  `

  // close when clicking the backdrop or the close button
  overlay.addEventListener('click', e => {
    if (e.target === overlay || (e.target as HTMLElement).closest('.rw-help-close')) {
      closeHelpDialog()
    }
  })

  document.body.appendChild(overlay)

  // force a reflow so the initial opacity: 0 is committed before the
  // transition to opacity: 1, otherwise the browser may skip the fade-in
  void overlay.offsetWidth
  overlay.classList.add('rw-help-visible')
}

/** Toggles a route on or off. */
const toggleRoute = (route: Route, arg?: string) => {
  const current = Router.get_current_url()
  if (current.startsWith(route) && (!arg || current === `${route}/${arg}`)) {
    Router.change('')
  } else if (arg) {
    Router.change(route, arg)
  } else {
    Router.change(route)
  }
}

// add keyboard shortcuts
window.addEventListener('keydown', e => {
  /** JQuery-style query selector. */
  const $ = (query: string) => document.querySelector(query) as HTMLElement | null

  /** JQuery-style query selector. */
  const $a = (query: string) => document.querySelectorAll(query) as NodeListOf<HTMLElement>

  /** XPath selector. */
  const $x = (xpath: string) =>
    document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue as HTMLElement | null

  const modalActive = !!$('.modal_active')

  // keyboard shortcuts help dialog (toggle)
  // Shift + / produces '?'
  if (e.key === '?') {
    e.preventDefault()
    toggleHelpDialog()
    return
  }

  // if the help dialog is open, only Escape (to close it) should be handled
  if (document.getElementById(HELP_DIALOG_ID)) {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeHelpDialog()
    }
    return
  }

  // now-playing album (toggle)
  // +shift to toggle the album of COMING UP (1) (the song you voted for)
  // +option+shift to toggle the album of COMING UP (2)
  // handled via e.code because Option mutates e.key on macOS
  if (e.code === 'KeyM') {
    if (modalActive) return
    let albumLink: HTMLElement | null
    if (e.shiftKey) {
      const roundIndex = e.altKey ? 1 : 0
      const round = $a('.timeline_event.sched_next')[roundIndex]
      const song = round?.querySelector<HTMLElement>('.song.voting_registered') ?? round?.querySelector<HTMLElement>('.song')
      albumLink = song?.querySelector<HTMLElement>('.album > a') ?? null
    } else {
      albumLink = $('.song.now_playing .album > a')
    }
    const albumId = (albumLink?.getAttribute('href') || '').split('/')[2]
    if (albumId) toggleRoute('album', albumId)
    return
  }

  // now-playing artist (toggle)
  // +shift to toggle the artist of COMING UP (1) (the song you voted for)
  // +cmd+shift to toggle the artist of COMING UP (2)
  // handled via e.key (not e.code) to respect keyboard layouts such as Colemak
  if (e.key === 't' || e.key === 'T') {
    if (modalActive) return
    e.preventDefault()
    let artistLink: HTMLElement | null
    if (e.shiftKey) {
      const roundIndex = e.metaKey ? 1 : 0
      const round = $a('.timeline_event.sched_next')[roundIndex]
      const song = round?.querySelector<HTMLElement>('.song.voting_registered') ?? round?.querySelector<HTMLElement>('.song')
      artistLink = song?.querySelector<HTMLElement>('.artist > a') ?? null
    } else {
      artistLink = $('.song.now_playing .artist > a')
    }
    const artistId = (artistLink?.getAttribute('href') || '').split('/')[2]
    if (artistId) toggleRoute('artist', artistId)
    return
  }

  // escape
  switch (e.key) {
    case 'Escape':
      // modal
      if (modalActive) {
        $('.modal_close')!.click()
      }
      // expanded album cover (close)
      else if ($('.art_expandable.art_expanded')) {
        $('.art_expandable.art_expanded')!.click()
      }
      // open popups
      else if (Router.get_current_url()) {
        // close any open popups by navigating to the home route
        Router.change()
      }
      // Previously Played (close only)
      else {
        // close only
        $('.history_header:not(.history_expandable) > div')?.click()
      }
      break

    // space
    // play/pause (toggle)
    case ' ':
      // click is not available on the <use> elements, so dispatch a mouse event
      $('.audio_icon_play')?.dispatchEvent(new MouseEvent('click'))
      break

    // previously played (toggle)
    case 'p':
      if (modalActive) return
      $('.history_header > div')?.click()
      break

    // requests (toggle)
    case 'r':
      if (modalActive || e.metaKey) return
      toggleRoute('requests')
      break

    // library (toggle)
    case 'l':
    case 'L':
      if (modalActive) return
      if (e.shiftKey) {
        const albumHref = $('.song.now_playing .album > a')?.getAttribute('href') || ''
        const albumId = albumHref.split('/')[2]
        toggleRoute('album', albumId)
      } else {
        toggleRoute('album')
      }
      break

    // search (open only since s needs to be left for typing once the search panel is open)
    case 's':
      if (modalActive) return
      Router.change('search')
      break

    // profile (toggle)
    case 'o':
      if (modalActive) return

      const userHref = $('.user_info > a')?.getAttribute('href') || ''
      const userId = userHref.split('/')[2]
      toggleRoute('listener', userId)
      break

    // rate current song
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '!':
    case '@':
    case '#':
    case '$': {
      // don't conflict with cmd + 1–5 to switch tabs
      if (modalActive || e.metaKey) return
      const rating = keyToRating[e.key]
      const song = $('.song.now_playing .song_rating')!
      const rect = song.getBoundingClientRect()
      const clientX = rect.left + 3.5 + (rect.width / 5.5) * (rating - 1)
      song.dispatchEvent(
        new MouseEvent('click', {
          clientX,
          clientY: rect.top,
        }),
      )
      break
    }

    // vote for the next song
    // +shift to vote for the next round
    // +cmd to toggle the album cover image of the respective song
    case 'a':
    case 'b':
    case 'c':
    case 'A':
    case 'B':
    case 'C': {
      if (modalActive) return
      const i = e.key.toLowerCase().charCodeAt(0) - 97 + (e.shiftKey ? 3 : 0)
      const song = $a('.timeline_event.sched_next .song')[i]
      // cmd toggles the album cover image instead of voting
      if (e.metaKey) {
        e.preventDefault()
        song?.querySelector<HTMLElement>('.art_container.art_expandable')?.click()
      } else {
        song?.click()
      }
      break
    }

    // expand album art (toggle)
    case 'v':
      if (modalActive) return
      $('.now_playing .art_container.art_expandable')?.click()
      break

    // settings (toggle)
    case ',':
      // close
      if (modalActive) {
        $('.modal_close')!.click()
      }
      // open
      else {
        const settingsLink = $x("//*[contains(@class, 'menu')]//a[text()='Settings']")
        settingsLink?.click()
      }
      break
  }
})
