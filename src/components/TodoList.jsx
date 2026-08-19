import { useState, useEffect } from 'react'
import { CheckSquare, Trash2 } from 'lucide-react'

export default function TodoList() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('dashboard_todos')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing todos:', error)
        return []
      }
    }
    return []
  })
  
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    localStorage.setItem('dashboard_todos', JSON.stringify(todos))
    window.dispatchEvent(new Event('todos-updated'))
  }, [todos])

  const handleAddTodo = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false
    }
    setTodos(prev => [...prev, newTodo])
    setInputValue('')
  }

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id, e) => {
    e.stopPropagation()
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  return (
    <div className="card">
      <div className="todo-container">
        {/* Header */}
        <div className="todo-header-row">
          <div className="todo-title-left">
            <CheckSquare size={18} style={{ color: '#000000' }} />
            <span style={{ fontWeight: 600 }}>오늘 할 일</span>
          </div>
          <div className="todo-stats">
            <span>완료</span>
            <span style={{ fontWeight: 600 }}>{completedCount}</span>
            <span>/</span>
            <span>전체</span>
            <span style={{ fontWeight: 600 }}>{totalCount}</span>
          </div>
        </div>

        {/* List */}
        {todos.length > 0 ? (
          <ul className="todo-items-list">
            {todos.map(todo => (
              <li 
                key={todo.id} 
                className="todo-list-item"
                onClick={() => toggleTodo(todo.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="todo-item-text-wrapper">
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.completed}
                    readOnly
                  />
                  <span className={`todo-item-text ${todo.completed ? 'completed' : ''}`}>
                    {todo.text}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => deleteTodo(todo.id, e)} 
                  className="btn-todo-delete"
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748b', fontSize: '13px' }}>
            등록된 할 일이 없습니다. 아래에서 추가해 보세요.
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAddTodo} className="todo-input-row">
          <input
            type="text"
            className="todo-input-field"
            placeholder="새로운 테스크를 입력하세요."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={100}
          />
          <button type="submit" className="btn-todo-add">
            추가
          </button>
        </form>
      </div>
    </div>
  )
}
