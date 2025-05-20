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

  // yüklənir spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin h-12 w-12 border-4 border-t-purple-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
          Our Products
        </h1>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {items.map(i => (
            <div
              key={i.id}
              className="
                group 
                bg-white bg-opacity-80 
                rounded-2xl overflow-hidden 
                shadow-lg hover:shadow-2xl 
                transition-transform duration-300 transform hover:-translate-y-1 
                cursor-pointer
              "
            >
              {/* Məhsul şəkli */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={i.imageUrl}
                  alt={i.name}
                  loading="lazy"
                  className="
                    w-full h-full 
                    object-contain object-center 
                    transition-transform duration-300 group-hover:scale-110 
                    cursor-pointer
                  "
                />
              </div>
              {/* Məhsul məlumat bloku */}
              <div className="p-6">
                <h2 className="
                  text-2xl font-semibold mb-2 
                  group-hover:text-purple-600 
                  transition-colors duration-300
                ">
                  {i.name}
                </h2>
                <p className="text-gray-700 text-sm mb-4">{i.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{i.price} ₼</span>
                  {i.in_stock ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
