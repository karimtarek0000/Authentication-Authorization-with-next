'use client'

import { api } from '@/lib/auth'
import { useState } from 'react'

const Data = () => {
  const [data, setData] = useState<any>()

  async function getData() {
    try {
      const data = await api.get('/data')
      setData(data)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <>
      <h1>{data?.data?.userId}</h1>
      <h1>{data?.data?.name}</h1>
      <h1>{data?.data?.course}</h1>
      <button onClick={getData}>Get data</button>
    </>
  )
}

export default Data
