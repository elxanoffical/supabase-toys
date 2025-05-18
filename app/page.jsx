'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase'

export default function HomePage() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)

  // Komponent mount olanda məhsulları çək
  useEffect(() => { load() }, [])

  // toys cədvəlindən data alır, hər item üçün publicUrl qurur
  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('toys')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) {
      const withUrls = data.map(i => {
        const { data: { publicUrl } } = supabase
          .storage
          .from('images')
          .getPublicUrl(i.image_url)
        return { ...i, imageUrl: publicUrl }
      })
      setItems(withUrls)
    } else {
      console.error('Fetch Error:', error)
    }
    setLoading(false)
  }

  if (loading) return <p className="p-6">Yüklənir...</p>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 text-center">Our Products</h1>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {items.map(i => (
          <div
            key={i.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            {/* Məhsul şəkli */}
            <img
              src={i.imageUrl}
              alt={i.name}
              className="w-full h-48 object-cover"
            />
            {/* Məhsul məlumat bloku */}
            <div className="p-4">
              <h2 className="font-bold text-xl">{i.name}</h2>
              <p className="text-gray-600 mt-1">{i.description}</p>
              <p className="mt-2">
                <span className="font-semibold">{i.price} ₼</span>{' '}
                {i.in_stock
                  ? <span className="text-green-600">In Stock</span>
                  : <span className="text-red-600">Out of Stock</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
