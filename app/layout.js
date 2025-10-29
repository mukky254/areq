
import './globals.css'
import { AppProvider } from '../context/AppContext'

export const metadata = {
  title: 'Kazi Mashinani',
  description: 'Connecting Rural Talent with Opportunities',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
