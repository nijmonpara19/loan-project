import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ledger:prediction-history'

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useHistory() {
  const [history, setHistory] = useState(readHistory)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  }, [history])

  const addEntry = useCallback((entry) => {
    setHistory((prev) => [
      { id: crypto.randomUUID(), timestamp: Date.now(), ...entry },
      ...prev,
    ].slice(0, 50)) // keep the most recent 50
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])

  return { history, addEntry, clearHistory }
}
