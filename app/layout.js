import './globals.css'

export const metadata = {
  title: 'Kazi Mashinani',
  description: 'Connecting Rural Talent with Opportunities',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
