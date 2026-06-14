Keyboard shortcuts for [Rainwave](https://github.com/rmcauley/rainwave).

## Shortcuts

| Key                   | Action                                             |
| --------------------- | -------------------------------------------------- |
| `Space`               | Play / pause                                       |
| `1`–`5`               | Rate the current song (whole stars)                |
| `!` `@` `#` `$`       | Rate the current song half a star higher (1.5–4.5) |
| `a` `b` `c`           | Vote for the next song                             |
| `Shift` + `a`/`b`/`c` | Vote in the following round                        |
| `Cmd` + `a`/`b`/`c`   | Toggle the cover image of the next songs           |
| `Cmd` + `Shift` + `a`/`b`/`c` | Toggle the cover image of the following round |
| `r`                   | Toggle requests                                    |
| `l`                   | Toggle library                                     |
| `Shift` + `l`         | Toggle the now-playing album in the library        |
| `m`                   | Toggle the now-playing album                        |
| `Shift` + `m`         | Toggle the album of Coming Up (1)                   |
| `Option` + `Shift` + `m` | Toggle the album of Coming Up (2)                |
| `s`                   | Open search                                        |
| `o`                   | Toggle your profile                                |
| `v`                   | Expand the album art                               |
| `p`                   | Toggle previously played                           |
| `Esc`                 | Close the open modal / popup / previously played / expanded album art |
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
