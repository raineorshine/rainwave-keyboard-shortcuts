function injectScript(file_path: string) {
  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', file_path)
  document.body.appendChild(script)
}

// injected scripts must be added to web_accessible_resources
injectScript(chrome.runtime.getURL('build/events.js'))
