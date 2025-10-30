'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BlogPage() {
  const [currentLanguage, setCurrentLanguage] = useState('sw')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'sw'
    setCurrentLanguage(savedLanguage)
  }, [])

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en'
    setCurrentLanguage(newLanguage)
    localStorage.setItem('preferredLanguage', newLanguage)
  }

  if (!mounted) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: '16px', color: 'white' }}>
          {currentLanguage === 'en' ? 'Loading...' : 'Inapakia...'}
        </p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-hands-helping"></i>
              <span>Kazi Mashinani</span>
            </div>
            
            <div className="user-menu">
              <button
                onClick={toggleLanguage}
                className="google-translate"
              >
                {currentLanguage === 'en' ? '🇺🇸 English' : '🇰🇪 Kiswahili'}
              </button>
              
              <button 
                onClick={() => router.back()}
                className="btn btn-primary"
              >
                <i className="fas fa-arrow-left"></i>
                <span>{currentLanguage === 'en' ? 'Back' : 'Rudi'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="card">
            <div className="card-body">
              <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#006600' }}>
                {currentLanguage === 'en' ? 'About Kazi Mashinani' : 'Kuhusu Kazi Mashinani'}
              </h1>
              
              <div style={{ lineHeight: '1.8', fontSize: '16px', color: '#555' }}>
                <p style={{ marginBottom: '20px' }}>
                  {currentLanguage === 'en' 
                    ? 'Kazi Mashinani is a revolutionary platform dedicated to connecting rural talent with employment opportunities. Our mission is to bridge the gap between job seekers in rural areas and employers who need their skills, thereby addressing unemployment and promoting economic development in underserved communities.'
                    : 'Kazi Mashinani ni jukwaa la kimapinduzi linalolenga kuunganisha talanta za vijijini na fursa za ajira. Dhamira yetu ni kujenga daraja kati ya watafuta kazi katika maeneo ya vijijini na waajiri wanaohitaji ujuzi wao, na hivyo kushughulikia ukosefu wa ajira na kukuza maendeleo ya kiuchumi katika jamii zisizohudumiwa vizuri.'
                  }
                </p>

                <h2 style={{ color: '#0066cc', margin: '30px 0 15px 0' }}>
                  {currentLanguage === 'en' ? 'Our Impact' : 'Athari Yetu'}
                </h2>
                
                <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ padding: '20px', background: '#f0f8ff', borderRadius: '10px', borderLeft: '4px solid #0066cc' }}>
                    <h3 style={{ color: '#0066cc', margin: '0 0 10px 0' }}>
                      <i className="fas fa-users" style={{ marginRight: '10px' }}></i>
                      {currentLanguage === 'en' ? 'Connecting Communities' : 'Kuunganisha Jamii'}
                    </h3>
                    <p style={{ margin: 0 }}>
                      {currentLanguage === 'en' 
                        ? 'We have successfully connected thousands of job seekers with employers across various sectors including agriculture, construction, domestic work, and services.'
                        : 'Tumeweza kuunganisha maelfu ya watafuta kazi na waajiri katika sekta mbalimbali ikiwemo kilimo, ujenzi, kazi za nyumbani, na huduma.'
                      }
                    </p>
                  </div>

                  <div style={{ padding: '20px', background: '#f0fff0', borderRadius: '10px', borderLeft: '4px solid #009900' }}>
                    <h3 style={{ color: '#009900', margin: '0 0 10px 0' }}>
                      <i className="fas fa-chart-line" style={{ marginRight: '10px' }}></i>
                      {currentLanguage === 'en' ? 'Economic Empowerment' : 'Uwezeshaji wa Kiuchumi'}
                    </h3>
                    <p style={{ margin: 0 }}>
                      {currentLanguage === 'en' 
                        ? 'By facilitating employment in rural areas, we are helping to circulate wealth within local communities and reduce urban migration.'
                        : 'Kwa kuwezesha ajira katika maeneo ya vijijini, tunasaidia kuzungusha utajiri ndani ya jamii za ndani na kupunguza uhamiaji mijini.'
                      }
                    </p>
                  </div>

                  <div style={{ padding: '20px', background: '#fff8f0', borderRadius: '10px', borderLeft: '4px solid #ff6600' }}>
                    <h3 style={{ color: '#ff6600', margin: '0 0 10px 0' }}>
                      <i className="fas fa-hand-holding-heart" style={{ marginRight: '10px' }}></i>
                      {currentLanguage === 'en' ? 'Skills Development' : 'Ukuzaji wa Ujuzi'}
                    </h3>
                    <p style={{ margin: 0 }}>
                      {currentLanguage === 'en' 
                        ? 'We provide opportunities for skill development and career growth, helping workers build sustainable livelihoods.'
                        : 'Tunatoa fursa za ukuzaji wa ujuzi na ukuaji wa kazi, tukisaidia wafanyikazi kujenga riziki endelevu.'
                      }
                    </p>
                  </div>
                </div>

                <h2 style={{ color: '#0066cc', margin: '30px 0 15px 0' }}>
                  {currentLanguage === 'en' ? 'How We Work' : 'Jinsi Tunavyofanya Kazi'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#0066cc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '2rem' }}>
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <h3 style={{ color: '#0066cc', marginBottom: '10px' }}>
                      {currentLanguage === 'en' ? '1. Register' : '1. Jisajili'}
                    </h3>
                    <p>
                      {currentLanguage === 'en' 
                        ? 'Job seekers and employers create their profiles on our platform'
                        : 'Watafuta kazi na waajiri huunda wasifu wao kwenye jukwaa letu'
                      }
                    </p>
                  </div>

                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#009900', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '2rem' }}>
                      <i className="fas fa-search"></i>
                    </div>
                    <h3 style={{ color: '#009900', marginBottom: '10px' }}>
                      {currentLanguage === 'en' ? '2. Connect' : '2. Ungana'}
                    </h3>
                    <p>
                      {currentLanguage === 'en' 
                        ? 'Employers post jobs and job seekers find opportunities that match their skills'
                        : 'Waajiri hutangaza kazi na watafuta kazi hupata fursa zinazolingana na ujuzi wao'
                      }
                    </p>
                  </div>

                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#ff6600', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '2rem' }}>
                      <i className="fas fa-handshake"></i>
                    </div>
                    <h3 style={{ color: '#ff6600', marginBottom: '10px' }}>
                      {currentLanguage === 'en' ? '3. Succeed' : '3. Fanikiwa'}
                    </h3>
                    <p>
                      {currentLanguage === 'en' 
                        ? 'Successful matches lead to employment and community development'
                        : 'Mechi mafanikio husababisha ajira na maendeleo ya jamii'
                      }
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px', padding: '30px', background: 'linear-gradient(135deg, #0066cc, #009900)', borderRadius: '15px', color: 'white' }}>
                  <h2 style={{ marginBottom: '15px' }}>
                    {currentLanguage === 'en' ? 'Join Our Mission' : 'Jiunge na Misheni Yetu'}
                  </h2>
                  <p style={{ marginBottom: '20px', fontSize: '18px' }}>
                    {currentLanguage === 'en' 
                      ? 'Be part of the solution to unemployment in rural areas. Whether you\'re looking for work or looking to hire, Kazi Mashinani is here to help.'
                      : 'Kuwa sehemu ya suluhisho la ukosefu wa ajira katika maeneo ya vijijini. Iwe unatafuta kazi au unatafuta kuajiri, Kazi Mashinani iko hapa kukusaidia.'
                    }
                  </p>
                  <button 
                    onClick={() => router.push('/auth')}
                    className="btn"
                    style={{ 
                      background: 'white', 
                      color: '#006600',
                      padding: '12px 30px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    {currentLanguage === 'en' ? 'Get Started' : 'Anza Sasa'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>Kazi Mashinani &copy; 2025. {currentLanguage === 'en' ? 'All rights reserved.' : 'Haki zote zimehifadhiwa.'}</p>
        </div>
      </footer>
    </div>
  )
}
