Keyboard shortcuts for [Rainwave](https://github.com/rmcauley/rainwave).

## Shortcuts

| Key                   | Action                                             |
| --------------------- | -------------------------------------------------- |
| `Space`               | Play / pause                                       |
| `1`–`5`               | Rate the current song (whole stars)                |
| `!` `@` `#` `$`       | Rate the current song half a star higher (1.5–4.5) |
| `a` `b` `c`           | Vote for the next song                             |
| `Shift` + `a`–`c`     | Vote in the following round                        |
| `r`                   | Toggle requests                                    |
| `l`                   | Toggle library                                     |
| `Shift` + `l`         | Toggle the now-playing album in the library        |
| `s`                   | Open search                                        |
| `o`                   | Toggle your profile                                |
| `p`                   | Toggle previously played                           |
| `Esc`                 | Close the open modal / popup / previously played   |
| `Cmd` + `Shift` + `,` | Toggle settings                                    |

## Development

1. Clone the repo.
2. Open the Chrome menu and click "Extensions".
3. Click "Load unpacked".
4. Choose the folder where you cloned the repo and hit "Select".

After making changes:

1. `npm run build`
2. On the Extension page, click the small refresh icon on "Rainwave Keyboard Shortcuts".
3. Refresh rainwave.cc.

## Deployment

1. `npm run build`
2. Upload to Chrome Web Store.
