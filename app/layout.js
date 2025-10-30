import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kazi Mashinani',
  description: 'Connecting Rural Talent with Opportunities',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,sw',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            `
          }}
        />
        <script
          type="text/javascript"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
