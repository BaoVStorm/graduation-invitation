import { useId, useState, type FormEvent } from 'react'
import { sfx } from '../lib/audio'
import { invite } from '../lib/invite'
import { GoldButton } from './ui'

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'inactive'

/**
 * Gửi lời chúc thẳng vào email của tân khoa.
 * Địa chỉ nhận nằm trong GitHub Secret SECRET_WISH_EMAIL, được prerender nhúng vào trang dưới dạng endpoint.
 * Chưa cấu hình secret → form không hiện.
 */
export function WishForm({ defaultName = '', onSent }: { defaultName?: string; onSent?: () => void }) {
  const id = useId()
  const [name, setName] = useState(defaultName)
  const [message, setMessage] = useState('')
  const [honey, setHoney] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const endpoint = invite.wish?.endpoint

  if (!endpoint) return null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim() || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          'Người gửi': name.trim(),
          'Lời chúc': message.trim(),
          'Trang': location.href,
          _subject: `🎓 Lời chúc tốt nghiệp từ ${name.trim()}`,
          _template: 'box',
          _captcha: 'false',
          _honey: honey,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string }
      if (!res.ok || String(data.success) !== 'true') {
        console.warn('[WishForm] gửi không thành công', res.status, data)
        // FormSubmit trả lỗi này cho tới khi chủ hộp thư bấm "Activate Form" trong email xác nhận
        if (/activat/i.test(data.message ?? '')) return setStatus('inactive')
        throw new Error('send failed')
      }
      setStatus('sent')
      sfx('confetti')
      onSent?.()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="py-4 text-center">
        <p className="font-name text-3xl italic text-[#f4ead2]">Cảm ơn {name.trim()}!</p>
        <p className="mt-2 text-sm text-white/70">Lời chúc đã được gửi tới tân khoa.</p>
        <GoldButton
          ghost
          className="mt-5"
          onClick={() => {
            setMessage('')
            setStatus('idle')
          }}
        >
          Viết thêm lời chúc
        </GoldButton>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5 text-left">
      <div>
        <label htmlFor={`${id}-name`} className="field-label">
          Tên của bạn
        </label>
        <input
          id={`${id}-name`}
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor={`${id}-msg`} className="field-label">
          Lời chúc
        </label>
        <textarea
          id={`${id}-msg`}
          className="field"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1500}
          required
        />
      </div>
      {/* bẫy spam: người thật không thấy ô này */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={honey} onChange={(e) => setHoney(e.target.value)} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-white/45">{message.length}/1500</p>
        <GoldButton type="submit" arrow disabled={status === 'sending'}>
          {status === 'sending' ? 'Đang gửi…' : 'Gửi lời chúc'}
        </GoldButton>
      </div>
      {status === 'error' && <p className="text-sm text-[#ff9b9b]">Chưa gửi được, bạn thử lại sau ít phút nhé.</p>}
      {status === 'inactive' && (
        <p className="text-sm text-[#ffd98a]">Hộp thư nhận lời chúc đang chờ kích hoạt, bạn thử lại sau một lát nhé.</p>
      )}
    </form>
  )
}
