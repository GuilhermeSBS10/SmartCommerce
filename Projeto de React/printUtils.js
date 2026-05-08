export function openPrintWindow(title, html) {
  const reportWindow = window.open('', '_blank', 'width=980,height=800')
  if (!reportWindow) return null

  reportWindow.document.write(`
    <html lang="pt-BR">
      <head>
        <title>${title}</title>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `)
  reportWindow.document.close()
  reportWindow.focus()
  reportWindow.print()
  return reportWindow
}
