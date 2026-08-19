import { useState, useEffect } from 'react'
import { Smile, Sun, Brain } from 'lucide-react'

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(() => {
    return localStorage.getItem('dashboard_mood') || '평온'
  })

  useEffect(() => {
    localStorage.setItem('dashboard_mood', selectedMood)
  }, [selectedMood])

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood)
  }

  return (
    <div className="card">
      <div className="mood-card-container">
        <span className="mood-title" style={{ fontWeight: 500 }}>
          오늘의 기분 입력
        </span>
        
        <div className="mood-condition-row">
          <button
            className={`mood-option-btn ${selectedMood === '평온' ? 'selected' : ''}`}
            onClick={() => handleMoodSelect('평온')}
          >
            <Smile size={24} style={{ color: '#111111' }} />
            <span className="mood-option-title">평온</span>
          </button>

          <button
            className={`mood-option-btn ${selectedMood === '기쁨' ? 'selected' : ''}`}
            onClick={() => handleMoodSelect('기쁨')}
          >
            <Sun size={24} style={{ color: '#ea580c' }} />
            <span className="mood-option-title">기쁨</span>
          </button>

          <button
            className={`mood-option-btn ${selectedMood === '몰입' ? 'selected' : ''}`}
            onClick={() => handleMoodSelect('몰입')}
          >
            <Brain size={24} style={{ color: '#7c3aed' }} />
            <span className="mood-option-title">몰입</span>
          </button>
        </div>
      </div>
    </div>
  )
}
