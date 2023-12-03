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

  // escape
  switch (e.key) {
    case 'Escape':
      // modal
      if (modalActive) {
        $('.modal_close')!.click()
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
      if (modalActive) return
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
    case 'a':
    case 'b':
    case 'c':
    case 'A':
    case 'B':
    case 'C': {
      if (modalActive) return
      const i = e.key.toLowerCase().charCodeAt(0) - 97 + (e.shiftKey ? 3 : 0)
      const song = $a('.timeline_event.sched_next .song')[i]
      song?.click()
      break
    }

    // settings
    case ',':
      if (e.metaKey && e.shiftKey) {
        // close
        if (modalActive) {
          $('.modal_close')!.click()
        }
        // open
        else {
          const settingsLink = $x("//*[contains(@class, 'menu')]//a[text()='Settings']")
          settingsLink?.click()
        }
      }
      break
  }
})
