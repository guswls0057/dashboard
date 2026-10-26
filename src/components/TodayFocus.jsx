import { useState, useEffect } from 'react'
import { GoogleGenAI } from '@google/genai'

export default function TodayFocus({ onUpdateQuote }) {
  const [focusText, setFocusText] = useState(() => {
    return localStorage.getItem('dashboard_focus_text') || ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (focusText) {
      localStorage.setItem('dashboard_focus_text', focusText)
    } else {
      localStorage.removeItem('dashboard_focus_text')
    }
  }, [focusText])

  const handleStartEdit = () => {
    setInputValue(focusText)
    setIsEditing(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedVal = inputValue.trim()
    setFocusText(trimmedVal)
    setIsEditing(false)

    if (!trimmedVal || !onUpdateQuote) return

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      console.warn('Gemini API key is missing in .env')
      return
    }

    try {
      const ai = new GoogleGenAI({ apiKey })
      const prompt = `사용자가 입력한 오늘의 핵심 일과 또는 관심사: "${trimmedVal}".
이와 관련하여 마음에 깊은 영감과 울림을 주는 유명한 명언 1구절(한국어 60자 이내)과 그 명언을 남긴 '실제 인물(작가, 철학자, 위인, 기업가 등)의 실명'을 한국어로 작성해 주세요.

[중요 지침]
1. 저자 자리에는 '성장', '동기부여', '격언', '개발자' 같은 주제/카테고리나 역할을 절대 쓰지 마세요.
2. 반드시 실존 인물(예: 스티브 잡스, 알베르트 아인슈타인, 윈스턴 처칠, 프리드리히 니체, 괴테, 공자 등)의 이름을 한국어로 명시하세요.
3. 출력 형식은 부가 설명 없이 오직 아래 형식으로만 출력하세요:
명언 내용 | 인물 이름

예시:
단순함이 궁극의 정교함이다. | 레오나르도 다빈치
승리는 가장 끈기 있는 자에게 돌아간다. | 나폴레옹 보나파르트`
      
      let response
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        })
      } catch (innerErr) {
        console.warn('Gemini 2.5-flash failed, retrying with gemini-3.6-flash...', innerErr)
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt
        })
      }

      const text = response.text || (typeof response.text === 'function' ? response.text() : '')
      if (text) {
        const parts = text.split('|')
        if (parts.length >= 2) {
          const rawQuote = parts[0].trim().replace(/^["'“”]+|["'“”]+$/g, '')
          const rawAuthor = parts[1].replace(/[－\s\-—]/g, '').trim()
          onUpdateQuote({
            text: rawQuote,
            author: rawAuthor || '작자 미상',
            category: `－ ${rawAuthor || '작자 미상'} －`
          })
        } else {
          onUpdateQuote({
            text: text.trim().replace(/^["'“”]+|["'“”]+$/g, ''),
            author: '작자 미상',
            category: '－ 작자 미상 －'
          })
        }
      }
    } catch (err) {
      console.error('Failed to generate quote via Gemini:', err)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleClear = (e) => {
    e.stopPropagation() // Prevent triggering edit mode
    setFocusText('')
    setIsEditing(false)
  }

  return (
    <div className="card focus-card" style={{ justifyContent: 'center' }}>
      <div className="focus-badge-top">
        <span className="focus-badge-text">TODAY FOCUS</span>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="focus-card-content" style={{ cursor: 'default' }}>
          <div className="focus-input-wrapper">
            <input
              type="text"
              className="focus-card-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="오늘 집중 할 핵심 일과를 입력하세요..."
              autoFocus
              maxLength={80}
            />
            <button type="submit" className="btn-todo-add">설정</button>
            {focusText && (
              <button type="button" className="btn-todo-add" style={{ backgroundColor: '#64748b' }} onClick={handleCancel}>
                취소
              </button>
            )}
          </div>
        </form>
      ) : focusText ? (
        <div className="focus-card-content" onClick={handleStartEdit}>
          <div className="focus-display">
            <span className="focus-task-text">"{focusText}"</span>
          </div>
          <button 
            type="button" 
            className="btn-todo-delete" 
            style={{ position: 'absolute', top: '16px', right: '16px' }}
            onClick={handleClear}
            title="지우기"
          >
            x
          </button>
        </div>
      ) : (
        <div className="focus-card-content" onClick={handleStartEdit}>
          <span className="focus-placeholder-text">
            오늘 집중 할 핵심 일과가 없습니다.<br />이곳을 클릭해 추가해 보세요.
          </span>
        </div>
      )}
    </div>
  )
}
