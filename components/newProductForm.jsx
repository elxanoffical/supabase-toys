'use client'

import { useState } from 'react'
import supabase from '@/lib/supabase'

export default function NewProductForm({ onCreated }) {
  // form state-ləri
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [inStock, setInStock] = useState(true)
  const [file, setFile] = useState(null)

  // Form submit edildikdə çağırılır:
  // 1) Storage-a şəkil yükləyir
  // 2) toys cədvəlinə yeni row insert edir
  // 3) uğurlu olduqda parent komponenti (AdminPage) xəbərdar edir
  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) return alert('Şəkil seçin')

    // --- 1) Şəkili Supabase Storage-a upload et ---
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error: upErr } = await supabase
      .storage
      .from('images')
      .upload(fileName, file)
    if (upErr) return alert('Upload xətası: ' + upErr.message)

    // --- 2) Yeni məhsulu toys cədvəlinə yaz ---
    const { data, error: dbErr } = await supabase
      .from('toys')
      .insert([{
        name,
        description,
        price: Number(price),
        in_stock: inStock,
        image_url: fileName
      }])
      .single()
    if (dbErr) {
      console.error('Insert Error:', dbErr)
      return alert(`Insert xətası: ${dbErr.message ?? dbErr.details}`)
    }

    // --- 3) Uğurlu insert-dən sonra parent komponenti yenilə ---
    onCreated(data)

    // Formu sıfırla
    setName(''); setDescription(''); setPrice(''); setInStock(true); setFile(null)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        grid grid-cols-6 gap-4 p-6 
        bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 
        rounded-2xl shadow-xl backdrop-blur-sm
      "
    >
      {/* Məhsul adını daxil edən input */}
      <input
        className="
          col-span-2
          bg-white bg-opacity-60 placeholder-gray-600 
          border-0 rounded-lg py-3 px-4
          focus:outline-none focus:ring-4 focus:ring-purple-200
          transition duration-200
        "
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      {/* Məhsul təsvirini daxil edən input */}
      <input
        className="
          col-span-2
          bg-white bg-opacity-60 placeholder-gray-600 
          border-0 rounded-lg py-3 px-4
          focus:outline-none focus:ring-4 focus:ring-purple-200
          transition duration-200
        "
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />

      {/* Qiymət üçün input */}
      <input
        className="
          col-span-1
          bg-white bg-opacity-60 placeholder-gray-600 
          border-0 rounded-lg py-3 px-4
          focus:outline-none focus:ring-4 focus:ring-purple-200
          transition duration-200
        "
        type="number"
        min="0"
        placeholder="Price"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />

      {/* Stok vəziyyəti checkbox */}
      <label
        className="
          flex items-center col-span-1 
          bg-white bg-opacity-60 rounded-lg py-3 px-4
        "
      >
        <input
          type="checkbox"
          checked={inStock}
          onChange={e => setInStock(e.target.checked)}
          className="form-checkbox h-5 w-5 text-purple-500 transition duration-150"
        />
        <span className="ml-2 text-gray-700">In Stock</span>
      </label>

      {/* Şəkil yükləmək üçün file input */}
      <input
        className="
          col-span-3
          bg-white bg-opacity-60 placeholder-gray-600 
          border-0 rounded-lg py-3 px-4
          focus:outline-none focus:ring-4 focus:ring-purple-200
          transition duration-200
        "
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files[0])}
        required
      />

      {/* Submit düyməsi: Add Product */}
      <button
        className="
          col-span-3
          py-3 rounded-lg
          bg-gradient-to-r from-purple-500 to-pink-500
          text-white font-semibold
          shadow-lg hover:shadow-xl
          transform hover:-translate-y-0.5
          transition-all duration-200
          cursor-pointer
        "
        type="submit"
      >
        Add Product
      </button>
    </form>
  )
}
