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
      const prompt = `사용자가 입력한 오늘의 핵심 일과 또는 감정: "${trimmedVal}". 이와 관련하여 마음에 영감을 주거나 동기를 부여하는 명언 1구절(한글 50자 이내)과 저자(또는 저자 카테고리) 정보를 한국어로 작성해 주세요. 출력 형식은 다른 설명 없이 반드시 "명언 | 저자" 처럼 파이프 기호(|)로만 구분해 주세요. 예: "끝까지 해내는 자가 승리한다. | 격언"`
      
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

      const text = response.text || response.text()
      if (text) {
        const parts = text.split('|')
        if (parts.length >= 2) {
          onUpdateQuote({
            text: parts[0].trim(),
            category: `－ ${parts[1].trim()} －`
          })
        } else {
          onUpdateQuote({
            text: text.trim(),
            category: '－ AI WORKSPACES －'
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
