'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase'
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa'

export default function ProductItem({ product, onUpdated, onDeleted }) {
  // edit rejimi və draft state-i
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({
    name:        product.name,
    description: product.description,
    price:       product.price,
    in_stock:    product.in_stock,
    file:        null,
    preview:     ''           // yerli və ya storage-dən gələn image URL
  })

  // Komponent mount olanda və ya product.image_url dəyişdikdə preview üçün publicUrl al
  useEffect(() => {
    if (product.image_url) {
      const { data } = supabase
        .storage
        .from('images')
        .getPublicUrl(product.image_url)
      setDraft(d => ({ ...d, preview: data.publicUrl }))
    }
  }, [product.image_url])

  // input dəyişikliklərini draft-a yazır
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setDraft(d => ({
      ...d,
      [name]: type === 'checkbox'
        ? checked
        : name === 'price'
        ? Number(value)
        : value
    }))
  }

  // Yeni şəkil seçiləndə local preview yaratmaq üçün
  const handleFile = e => {
    const f = e.target.files[0]
    setDraft(d => ({
      ...d,
      file:    f,
      preview: URL.createObjectURL(f)
    }))
  }

  // Edit rejimində “Submit” düyməsi: confirm-dan sonra update et
  const save = async () => {
    if (!confirm('Siz buna əminsiniz?')) return

    let image_url = product.image_url
    // əgər yeni fayl yüklənibsə, əvvəl storage-a upload et
    if (draft.file) {
      const ext      = draft.file.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error: upErr } = await supabase
        .storage
        .from('images')
        .upload(fileName, draft.file)
      if (upErr) return alert('Upload xətası: ' + upErr.message)
      image_url = fileName
    }

    // toys cədvəlindəki row-u yenilə
    const { data, error } = await supabase
      .from('toys')
      .update({
        name:        draft.name,
        description: draft.description,
        price:       draft.price,
        in_stock:    draft.in_stock,
        image_url
      })
      .eq('id', product.id)
      .single()
    if (error) {
      console.error('Update Error:', error)
      return alert(`Update xətası: ${error.message ?? error.details}`)
    }

    onUpdated(data)      // parent-in list state-ni yenilə
    setIsEditing(false)  // edit rejimini bağla
  }

  // Sil düyməsi: “Silməyə əminsiniz?” confirm → delete row
  const remove = async () => {
    if (!confirm('Siz buna əminsiniz?')) return
    const { error } = await supabase
      .from('toys')
      .delete()
      .eq('id', product.id)
    if (error) {
      console.error('Delete Error:', error)
      return alert(`Delete xətası: ${error.message ?? error.details}`)
    }
    onDeleted(product.id) // parent-in list-dən çıxar
  }

  // Edit rejimini ləğv edən funksiya
  const cancel = () => {
    setDraft({
      name:        product.name,
      description: product.description,
      price:       product.price,
      in_stock:    product.in_stock,
      file:        null,
      preview:     draft.preview
    })
    setIsEditing(false)
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg bg-white">
      {/* Məhsul şəkli (preview) */}
      {draft.preview && (
        <img
          src={draft.preview}
          alt={product.name}
          className="w-20 h-20 object-cover rounded"
        />
      )}

      {/* Məhsul məlumat input-ları */}
      <div className="flex-1 grid grid-cols-5 gap-2">
        <input
          name="name"
          value={draft.name}
          onChange={handleChange}
          disabled={!isEditing}
          className={`border p-2 rounded ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
        />
        <input
          name="description"
          value={draft.description}
          onChange={handleChange}
          disabled={!isEditing}
          className={`col-span-2 border p-2 rounded ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
        />
        <input
          name="price"
          type="number"
          value={draft.price}
          onChange={handleChange}
          disabled={!isEditing}
          className={`border p-2 rounded ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
        />
        <label className={`flex items-center p-2 border rounded ${isEditing ? 'bg-white' : 'bg-gray-100'}`}>
          <input
            name="in_stock"
            type="checkbox"
            checked={draft.in_stock}
            onChange={handleChange}
            disabled={!isEditing}
            className="mr-1"
          />
          In Stock
        </label>

        {/* Yeni fayl seçimi yalnız edit rejimində görünür */}
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="col-span-5 border p-2 rounded"
          />
        )}
      </div>

      {/* Edit/Delete və Submit/Cancel icon-ları */}
      <div className="flex-shrink-0 flex flex-col gap-2">
        {!isEditing ? (
          <>
            {/* Edit düyməsi: edit rejimini açır */}
            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800 cursor-pointer">
              <FaEdit size={18}/>
            </button>
            {/* Delete düyməsi: sil funksiyasını çağırır */}
            <button onClick={remove} className="text-red-600 hover:text-red-800 cursor-pointer">
              <FaTrash size={18}/>
            </button>
          </>
        ) : (
          <>
            {/* Submit icon-u: dəyişiklikləri saxla */}
            <button onClick={save} className="text-green-600 hover:text-green-800 cursor-pointer">
              <FaCheck size={18}/>
            </button>
            {/* Cancel icon-u: dəyişiklikləri ləğv et */}
            <button onClick={cancel} className="text-gray-600 hover:text-gray-800 cursor-pointer">
              <FaTimes size={18}/>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
