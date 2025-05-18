'use client'

import { useState } from 'react'
import supabase from '@/lib/supabase'

export default function NewProductForm({ onCreated }) {
  // form state-ləri
  const [name, setName]           = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice]         = useState('')
  const [inStock, setInStock]     = useState(true)
  const [file, setFile]           = useState(null)

  // Form submit edildikdə çağırılır:
  // 1) Storage-a şəkil yükləyir
  // 2) toys cədvəlinə yeni row insert edir
  // 3) uğurlu olduqda parent komponenti (AdminPage) xəbərdar edir
  const handleSubmit = async e => {
    e.preventDefault()
    if (!file) return alert('Şəkil seçin')

    // --- 1) Şəkili Supabase Storage-a upload et ---
    const ext      = file.name.split('.').pop()
    const fileName = `${Date.now()}.${ext}`
    const { error: upErr } = await supabase
      .storage
      .from('images')
      .upload(fileName, file)
    if (upErr) return alert('Upload xətası: ' + upErr.message)

    // --- 2) Yeni məhsulu toys cədvəlinə yaz ---
    const { data, error: dbErr } = await supabase
      .from('toys')               // Supabase-dəki cədvəl adı
      .insert([{
        name,
        description,
        price:     Number(price),
        in_stock:  inStock,
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
      className="grid grid-cols-6 gap-4 p-4 mb-6 border rounded-lg bg-gray-50"
    >
      {/* Məhsul adını daxil edən input */}
      <input
        className="col-span-2 border p-2 rounded"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      {/* Məhsul təsvirini daxil edən input */}
      <input
        className="col-span-2 border p-2 rounded"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      {/* Qiymət üçün input */}
      <input
        className="col-span-1 border p-2 rounded"
        type="number"
        min="0"
        placeholder="Price"
        value={price}
        onChange={e => setPrice(e.target.value)}
        required
      />
      {/* Stok vəziyyəti checkbox */}
      <label className="flex items-center col-span-1">
        <input
          type="checkbox"
          checked={inStock}
          onChange={e => setInStock(e.target.checked)}
          className="mr-2"
        />
        In Stock
      </label>

      {/* Şəkil yükləmək üçün file input */}
      <input
        className="col-span-3 border p-2 rounded"
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files[0])}
        required
      />

      {/* Submit düyməsi: Add Product */}
      <button
        className="col-span-3 bg-green-600 text-white py-2 rounded hover:bg-green-700 cursor-pointer"
        type="submit"
      >
        Add Product
      </button>
    </form>
  )
}
