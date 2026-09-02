import { useState, useEffect } from 'react'
import { MapPin, Calendar as CalendarIcon, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, User, LogOut, Play, Pause, Target, ChevronRight } from 'lucide-react'

// Import components
import TodayFocus from './components/TodayFocus.jsx'
import TodoList from './components/TodoList.jsx'
import MoodTracker from './components/MoodTracker.jsx'
import IdeaDashboard from './components/IdeaDashboard.jsx'
import { GoogleGenAI } from '@google/genai'

const D_DAY_GOALS = [
  { id: 1, title: '저축 목표 달성 기한', date: '2026.12.31' },
  { id: 2, title: '프로젝트 개발 완료일', date: '2026.10.15' },
  { id: 3, title: '자격증 시험일', date: '2026.11.20' }
]

// Weather icon helper functions (declared outside the component)
const getWeatherIconName = (iconCode) => {
  if (!iconCode) return 'sun'
  const code = iconCode.substring(0, 2)
  switch (code) {
    case '01': return 'sun'
    case '02':
    case '03':
    case '04': return 'cloud'
    case '09':
    case '10': return 'rain'
    case '11': return 'lightning'
    case '13': return 'snow'
    default: return 'sun'
  }
}

const renderWeatherIcon = (iconName) => {
  const props = { size: 16 }
  switch (iconName) {
    case 'sun': return <Sun {...props} className="icon-orange" />
    case 'cloud': return <Cloud {...props} style={{ color: '#64748b' }} />
    case 'rain': return <CloudRain {...props} className="icon-blue" />
    case 'lightning': return <CloudLightning {...props} className="icon-orange" />
    case 'snow': return <CloudSnow {...props} style={{ color: '#cbd5e1' }} />
    default: return <Sun {...props} className="icon-orange" />
  }
}

// Weather icon helper functions (declared outside the component)
const translateLocation = (name) => {
  if (!name) return '경기도 수원시'
  const lower = name.toLowerCase()
  if (lower.includes('suwon') || lower.includes('jangan') || lower.includes('gwonseon') || lower.includes('paldal') || lower.includes('yeongtong') || lower.includes('seryu') || lower.includes('seryui')) {
    return '경기도 수원시'
  }
  if (lower.includes('namhyang') || lower.includes('namhang')) {
    return '부산광역시 남항동'
  }
  if (lower.includes('yeongdo')) {
    return '부산광역시 영도구'
  }
  if (lower.includes('seoul')) return '서울특별시'
  if (lower.includes('incheon')) return '인천광역시'
  if (lower.includes('busan')) return '부산광역시'
  if (lower.includes('daegu')) return '대구광역시'
  if (lower.includes('daejeon')) return '대전광역시'
  if (lower.includes('gwangju')) return '광주광역시'
  if (lower.includes('ulsan')) return '울산광역시'
  if (lower.includes('sejong')) return '세종특별자치시'
  if (lower.includes('jeju')) return '제주특별자치도'
  if (lower.includes('seongnam')) return '경기도 성남시'
  if (lower.includes('goyang')) return '경기도 고양시'
  if (lower.includes('yongin')) return '경기도 용인시'
  if (lower.includes('bucheon')) return '경기도 부천시'
  if (lower.includes('ansan')) return '경기도 안산시'
  if (lower.includes('anyang')) return '경기도 안양시'
  return name
}

export default function App() {
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState({ temp: '25', desc: '맑음', location: '경기도 수원시', icon: 'sun' })
  const [userName, setUserName] = useState(() => localStorage.getItem('dashboard_username') || '')
  const [loginInput, setLoginInput] = useState('')
  
  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  
  // D-Day Carousel State
  const [ddayIndex, setDdayIndex] = useState(0)

  // Quotes State
  const [quote, setQuote] = useState({
    text: '가장 좋은 프롬프트는 당신이 무엇을 원하는 지 명확히 아는 지성에서 출발한다.',
    category: '－ AI WORKSPACES －'
  })

  // Clock ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Pomodoro countdown timer
  useEffect(() => {
    let interval = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            // Deferred alert to let render finish
            setTimeout(() => {
              alert('집중 시간이 끝났습니다! 잠시 휴식을 취하세요.')
            }, 100)
            return 25 * 60
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Weather fetching
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '6605aee0a6279ee22604151fde837403'
    if (!apiKey) return

    const fetchWeather = async (lat, lon) => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Weather fetch failed')
        const data = await res.json()
        
        setWeather({
          temp: Math.round(data.main.temp).toString(),
          desc: data.weather[0].description,
          location: translateLocation(data.name),
          icon: getWeatherIconName(data.weather[0].icon)
        })
      } catch (err) {
        console.error('Weather fetch error:', err)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
        },
        () => {
          // Default to Suwon coordinates
          fetchWeather(37.2636, 127.0286)
        }
      )
    }
  }, [])

  // Gemini Quote Generation (if key exists)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) return

    const generateAiQuote = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey })
        const prompt = '인생, 몰입, 코딩, 혹은 성장에 관한 깊이 있고 멋진 격언 한 구절을 한국어로 1문장으로 창작하거나 추천해 주세요. 조언의 주체 카테고리도 짧게 한 단어로 작성해 주세요. 출력 형식은 "격언 | 카테고리" 처럼 파이프 기호(|)로 나누어 마크다운 기호 없이 텍스트만 출력해 주세요.'
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt
        })

        const text = response.text || response.text()
        const parts = text.split('|')
        if (parts.length >= 2) {
          setQuote({
            text: parts[0].trim(),
            category: `－ ${parts[1].trim().toUpperCase()} －`
          })
        }
      } catch (e) {
        console.error('Gemini Quote error:', e)
      }
    }

    generateAiQuote()
  }, [])


  // Formatting helpers
  const formatCalendarDate = (date) => {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const day = days[date.getDay()]
    return `${yyyy}년 ${mm}월 ${dd}일 ${day}`
  }

  const formatPeriod = (date) => {
    return date.getHours() < 12 ? '오전' : '오후'
  }

  const formatTime = (date) => {
    let hh = date.getHours()
    hh = hh % 12
    hh = hh ? hh : 12 // the hour '0' should be '12'
    const hhStr = String(hh).padStart(2, '0')
    const mmStr = String(date.getMinutes()).padStart(2, '0')
    return `${hhStr}:${mmStr}`
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleTimerToggle = () => {
    setIsTimerRunning(prev => !prev)
  }

  // D-Day calculation
  const calculateDday = (targetDateStr) => {
    const parts = targetDateStr.split('.')
    if (parts.length !== 3) return '0'
    const targetDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    const diffTime = targetDate - time
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '0'
    return diffDays > 0 ? `${diffDays}` : `+${Math.abs(diffDays)}`
  }

  const handleDdayNext = () => {
    setDdayIndex(prev => (prev + 1) % D_DAY_GOALS.length)
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (loginInput.trim()) {
      const nameWithSuffix = `${loginInput.trim()} 님`
      setUserName(nameWithSuffix)
      localStorage.setItem('dashboard_username', nameWithSuffix)
      setLoginInput('')
    }
  }

  const handleLogout = () => {
    setUserName('')
    localStorage.removeItem('dashboard_username')
  }

  const handleEditName = () => {
    const newName = prompt('변경할 이름을 입력하세요:', userName.replace(' 님', ''))
    if (newName && newName.trim()) {
      const nameWithSuffix = `${newName.trim()} 님`
      setUserName(nameWithSuffix)
      localStorage.setItem('dashboard_username', nameWithSuffix)
    }
  }

  const currentDday = D_DAY_GOALS[ddayIndex]

  if (!userName) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">환영합니다!</h1>
          <p className="login-subtitle">대시보드를 시작하기 위해 이름을 입력해주세요.</p>
          <form onSubmit={handleLoginSubmit} className="login-form">
            <input
              type="text"
              className="login-input"
              placeholder="이름 입력"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              required
              maxLength={20}
            />
            <button type="submit" className="login-btn">시작하기</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="round-card">
            <MapPin size={16} className="icon-blue" />
            <span className="header-title-text">{weather.location}</span>
          </div>
          
          <div className="round-card">
            <CalendarIcon size={16} className="icon-purple" />
            <span className="header-title-text">{formatCalendarDate(time)}</span>
          </div>

          <div className="round-card">
            {renderWeatherIcon(weather.icon)}
            <span className="header-title-text">{weather.temp}ºC {weather.desc}</span>
          </div>
        </div>

        <div className="header-right">
          <button className="round-card" onClick={handleEditName} style={{ cursor: 'pointer', border: '1px solid #e2e8f0' }} title="이름 수정">
            <User size={16} className="icon-blue" />
            <span className="header-title-text">{userName}</span>
          </button>
          
          <button className="round-card btn-logout" onClick={handleLogout} title="로그아웃">
            <LogOut size={16} className="icon-red" />
            <span className="header-title-text">로그아웃</span>
          </button>
        </div>
      </header>

      {/* Section 01 */}
      <section className="section-01">
        <div className="article-01">
          {/* Clock */}
          <div className="card" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="day-time">
              <span className="day-period">{formatPeriod(time)}</span>
              <span className="time-display">{formatTime(time)}</span>
            </div>
          </div>

          {/* Quotes */}
          <div className="card">
            <div className="quotes-container">
              <p className="quote-text">
                "{quote.text}"
              </p>
              <span className="quote-category">{quote.category}</span>
            </div>
          </div>
        </div>

        <div className="article-02">
          {/* Focus Timer */}
          <div className="card" style={{ padding: '24px' }}>
            <div className="focus-timer-container">
              <div className="timer-info">
                <span className="timer-label">FOCUS TIMER</span>
                <span className="timer-time">{formatTimer(timerSeconds)}</span>
              </div>
              <button className="btn-timer-play" onClick={handleTimerToggle}>
                {isTimerRunning ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />}
              </button>
            </div>
          </div>

          {/* D-Day */}
          <div className="card">
            <div className="dday-container">
              <div className="dday-contents">
                <div className="dday-left">
                  <div className="dday-title">
                    <Target size={16} className="icon-red" />
                    <span>{currentDday.title}</span>
                  </div>
                  <span className="dday-date">목표일 : {currentDday.date}</span>
                </div>
                <div className="dday-badge">
                  D-{calculateDday(currentDday.date)}
                </div>
              </div>
              
              <div className="dday-footer">
                <span className="dday-count">{ddayIndex + 1} / {D_DAY_GOALS.length}</span>
                <button className="btn-dday-nav" onClick={handleDdayNext}>
                  다음 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02 */}
      <section className="section-02">
        <TodayFocus onUpdateQuote={setQuote} />
        <MoodTracker />
      </section>

      {/* Section 03 */}
      <section className="section-03">
        <TodoList />
        <IdeaDashboard />
      </section>
    </div>
  )
}
