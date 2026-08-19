import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'

export default function IdeaDashboard() {
  const [content, setContent] = useState(() => {
    return localStorage.getItem('dashboard_idea_pad') ?? '자유로운 생각이나 임시 텍스트 조각을 모아두는 공간입니다.'
  })

  const [savingStatus, setSavingStatus] = useState('자동 저장 완료')

  useEffect(() => {
    localStorage.setItem('dashboard_idea_pad', content)
  }, [content])

  const handleChange = (e) => {
    setContent(e.target.value)
    setSavingStatus('저장 중...')
    
    // Simulate short auto-save visual feedback
    const timer = setTimeout(() => {
      setSavingStatus('자동 저장 완료')
    }, 600)

    return () => clearTimeout(timer)
  }

  return (
    <div className="card">
      <div className="idea-dashpad-container">
        {/* Header */}
        <div className="idea-header-row">
          <div className="idea-title-left">
            <FileText size={18} style={{ color: '#0284c7' }} />
            <span style={{ fontWeight: 600 }}>아이디어 대시패드</span>
          </div>
          <span className="idea-status">{savingStatus}</span>
        </div>

        {/* Textarea */}
        <textarea
          className="idea-textarea"
          value={content}
          onChange={handleChange}
          placeholder="여기에 자유로운 생각이나 임시 텍스트를 적어보세요..."
        />
      </div>
    </div>
  )
}
