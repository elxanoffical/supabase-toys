'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase'
import NewProductForm from '@/components/newProductForm'
import ProductItem    from '@/components/productItem'

export default function AdminPage() {
  // Başlanğıc state-lər
  const [toys, setToys]             = useState([])    // həmişə array
  const [loading, setLoading]       = useState(true)  // yüklənmə flag
  const [fetchError, setFetchError] = useState('')    // xəta mesajı

  // Komponent mount olanda toys-ları çək
  useEffect(() => { fetchToys() }, [])

  // Supabase-dən data gətirən funksiya
  async function fetchToys() {
    setLoading(true)
    const { data, error } = await supabase
      .from('toys')
      .select('*')
      .order('id', { ascending: false }) // created_at yox, id-ə görə sıralayırsan

    if (error) {
      console.error('Fetch toys xətası:', error.message, error.details)
      setFetchError(error.message || 'Naməlum xəta')
      setToys([])   // boş array qoy ki, kənarlaşdırma baş versin
    } else {
      setFetchError('')
      // null/undefined-ləri süzürük
      setToys((data || []).filter(item => item != null))
    }

    setLoading(false)
  }

  // Yeni toy əlavə ediləndə state-i yenilə
 const handleCreated = newToy => {
    if (newToy && newToy.id) {
      // yeni gəldiyi an list-in başına əlavə et
      setToys(prev => [ newToy, ...prev ])
    } else {
      // əgər id yoxdursa, bəlkə DB-dən təzədən götürmək daha məqsədəuyğundur
      fetchToys()
    }
  }
  // Mövcud toyu yeniləyəndə state-i əvəzlə
  const handleUpdated = updatedToy => {
    if (!updatedToy) return
    setToys(prev =>
      prev
        .map(t => (t.id === updatedToy.id ? updatedToy : t))
        .filter(item => item != null)
    )
  }

  // Toy silindikdə state-dən çıxar
  const handleDeleted = id => {
    setToys(prev =>
      prev.filter(t => t.id !== id)
    )
  }

 

  // Hələ yüklənirsə
  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg backdrop-blur-sm">
        <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          Admin Panel
        </h1>
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  // Əgər fetch zamanı xəta baş veribsə
  if (fetchError) {
    return (
      <div className="p-8 max-w-5xl mx-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg backdrop-blur-sm">
        <h1 className="text-4xl font-extrabold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          Admin Panel
        </h1>
        <p className="text-center text-red-600 font-medium">
          Xəta: {fetchError}
        </p>
      </div>
    )
  }

  // Əsas render
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl backdrop-blur-sm">
      <h1 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
        Admin Panel
      </h1>

      {/* Yeni toy əlavə etmə formu */}
      <div className="bg-white bg-opacity-70 p-6 rounded-xl shadow-inner">
        <NewProductForm onCreated={handleCreated} />
      </div>

      {/* Mövcud toys-ların siyahısı */}
      <div className="space-y-4">
        {toys.map(t =>
          t && (
            <ProductItem
              key={t.id}
              product={t}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          )
        )}
      </div>
    </div>
  )
}
