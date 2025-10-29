import './globals.css'

export const metadata = {
  title: 'Kazi Mashinani - Kuunganisha Watalanta Vijijini na Fursa',
  description: 'Platform ya kuunganisha watafuta kazi na waajiri katika maeneo ya vijijini',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sw">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
