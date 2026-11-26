import {useEffect, useState} from 'react'

export function useTextContent(filePath) {
  const [state, setState] = useState({content: '', loading: !!filePath, error: ''})

  useEffect(() => {
    if (!filePath) {
      setState({content: '', loading: false, error: ''})
      return
    }

    let active = true
    const reader = new FileReader()
    setState({content: '', loading: true, error: ''})
    reader.onload = event => {
      if (active) setState({content: event.target.result, loading: false, error: ''})
    }
    const fail = () => {
      if (active) setState({content: '', loading: false, error: '文档读取失败，请重新选择文件'})
    }
    reader.onerror = fail
    try {
      reader.readAsText(new Blob([filePath]), 'utf-8')
    } catch (error) {
      fail()
    }

    return () => {
      active = false
      if (reader.readyState === 1) reader.abort()
    }
  }, [filePath])

  return state
}
