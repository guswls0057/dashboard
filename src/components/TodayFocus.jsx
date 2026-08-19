import { useState, useEffect } from 'react'

export default function TodayFocus() {
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

  const handleSubmit = (e) => {
    e.preventDefault()
    setFocusText(inputValue.trim())
    setIsEditing(false)
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
    <div className="card" style={{ justifyContent: 'center' }}>
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
            <span className="focus-label-bottom">TODAY FOCUS</span>
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
