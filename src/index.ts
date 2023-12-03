type Attributes = { [key: string]: string | ((e: Event) => void) }

type ElementSpec = [string] | [string, Attributes] | [string, Attributes, string | ElementSpec[]]

/** Continuously poll a function until it returns a value other than null or undefined. */
const waitFor = <T>(f: () => T, pollFrequency = 100): Promise<NonNullable<T>> => {
  return new Promise((resolve, reject) => {
    let interval = 0
    const check = () => {
      const result = f()
      if (result != null) {
        clearInterval(interval)
        resolve(result)
      }
    }
    interval = setInterval(check, pollFrequency)
    check()
  })
}

/** JQuery-style query selector. */
const $ = document.querySelector.bind(document)

/** XPath selector. */
const $x = (xpath: string) =>
  document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue

/** Create an element. */
const $$ = (tagSpec: string, attributes: Attributes = {}, content?: string | ElementSpec[]) => {
  const [tag, ...classNames] = tagSpec.split('.')
  const el = document.createElement(tag)

  // class names
  classNames.forEach(className => {
    el.classList.add(className)
  })

  // attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase()
      el.addEventListener(eventName, value as (e: Event) => void)
    } else {
      el.setAttribute(key, value as string)
    }
  })

  if (typeof content === 'string') {
    el.appendChild(document.createTextNode(content))
  } else if (typeof content === 'object') {
    for (const spec of content) {
      // RECURSION
      el.appendChild($$.apply(null, spec))
    }
  }

  return el
}

/** Create an inline style attribute. */
const $s = (styles: { [key: string]: string | number | null | undefined }) => ({
  style: Object.entries(styles)
    .map(([key, value]) => (value != null ? `${key}: ${value};` : ''))
    .join(' '),
})

/** Create a class class attribute from an array or object of class names. */
const $c = (classNames: { [key: string]: boolean | null | undefined } | (string | null | undefined)[]) => {
  // normalize array or object to [key, value] tuples
  const entries = Array.isArray(classNames)
    ? classNames.map(key => [key, !!key] as [string, boolean])
    : Object.entries(classNames)
  return {
    class: entries
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(' '),
  }
}

/** Settings component. */
const Settings = async () => {
  const { theme } = await chrome.storage.sync.get('theme')

  /** Creates an onClick handler that sets the theme and updates the selected theme option. */
  const toggleTheme = (theme: string) => (e: Event) => {
    chrome.storage.sync.set({ theme }, () => {
      const el = e.target as HTMLElement
      document.querySelector('.setting_theme .selected')?.classList.remove('selected')
      document.querySelector('body')?.classList.remove('theme-default')
      document.querySelector('body')?.classList.remove('theme-monokai-classic')
      document.querySelector('body')?.classList.add(`theme-${theme}`)
      el.classList.add('selected')
    })
  }

  return $$('div.setting_theme', {}, [
    ['div.setting_subheader', {}, 'Theme'],
    [
      'div.setting_group',
      {},
      [
        [
          'div.multi_select',
          $s({ float: 'none' }),
          [
            [
              'span.link',
              {
                ...$c({ selected: theme === 'default' }),
                ...$s({ 'margin-left': 0 }),
                onClick: toggleTheme('default'),
              },
              'Default',
            ],
            [
              'span.link',
              {
                ...$c({ selected: !theme || theme === 'monokai-classic' }),
                onClick: toggleTheme('monokai-classic'),
              },
              'Monokai Classic Theme',
            ],
          ],
        ],
      ],
    ],
  ])
}

;(async () => {
  // set theme class on body element
  const { theme } = await chrome.storage.sync.get('theme')
  document.body.classList.add(`theme-${theme || 'monokai-classic'}`)

  // inject settings
  const settingsLink = await waitFor(() => $x("//*[contains(@class, 'menu')]//a[text()='Settings']"))

  settingsLink?.addEventListener('click', async () => {
    const settingsContent = await waitFor(() => $('.modal_container.open .content.main'))
    settingsContent.appendChild(await Settings())
  })
})()
