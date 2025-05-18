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
    if (newToy) {
      setToys(prev =>
        [newToy, ...prev]
          .filter(item => item != null)
      )
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
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center">Admin Panel</h1>
        <p className="p-6">Yüklənir…</p>
      </div>
    )
  }

  // Əgər fetch zamanı xəta baş veribsə
  if (fetchError) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center">Admin Panel</h1>
        <p className="text-red-600">Xəta: {fetchError}</p>
      </div>
    )
  }

  // Əsas render
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Admin Panel</h1>

      {/* Yeni toy əlavə etmə formu */}
      <NewProductForm onCreated={handleCreated} />

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
