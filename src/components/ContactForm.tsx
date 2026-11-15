import { useState, type FormEvent } from 'react'
import { SERVICES, SITE } from '../data/site'

/**
 * Contact form UI. NO BACKEND: on submit it opens the visitor's mail client via mailto: with the
 * fields composed into the body. Swap `submit` for a real endpoint later (no monthly-fee services).
 */
export default function ContactForm() {
  const [err, setErr] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const v = (k: string) => String(f.get(k) ?? '').trim()
    const errs: Record<string, string> = {}
    if (!v('name')) errs.name = 'Please enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(v('email'))) errs.email = 'Please enter a valid email.'
    if (!v('message')) errs.message = 'Tell us a little about the workflow.'
    setErr(errs)
    if (Object.keys(errs).length) {
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus()
      return
    }
    const body = [`Name: ${v('name')}`, `Email: ${v('email')}`, `Company: ${v('company')}`, `Interested in: ${v('topic')}`, '', v('message')].join('\n')
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Consultation request: ' + (v('company') || v('name')))}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  const field = 'mt-2 block w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 text-lg text-ink placeholder:text-mute/70 focus:border-red'
  const label = 'text-sm font-medium text-ink-2'
  return (
    <form onSubmit={submit} noValidate className="grid gap-8 sm:grid-cols-2" aria-describedby="form-note">
      <div>
        <label htmlFor="f-name" className={label}>Name</label>
        <input id="f-name" name="name" autoComplete="name" className={field} aria-invalid={!!err.name} aria-describedby={err.name ? 'e-name' : undefined} />
        {err.name && <p id="e-name" className="mt-2 text-sm text-red-ink">{err.name}</p>}
      </div>
      <div>
        <label htmlFor="f-email" className={label}>Email</label>
        <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" className={field} aria-invalid={!!err.email} aria-describedby={err.email ? 'e-email' : undefined} />
        {err.email && <p id="e-email" className="mt-2 text-sm text-red-ink">{err.email}</p>}
      </div>
      <div>
        <label htmlFor="f-company" className={label}>Company <span className="text-mute">(optional)</span></label>
        <input id="f-company" name="company" autoComplete="organization" className={field} />
      </div>
      <div>
        <label htmlFor="f-topic" className={label}>Interested in</label>
        <select id="f-topic" name="topic" className={field} defaultValue="Not sure yet">
          <option>Not sure yet</option>
          {SERVICES.map((s) => <option key={s.slug}>{s.name}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="f-message" className={label}>What would you like to automate?</label>
        <textarea id="f-message" name="message" rows={5} className={`${field} resize-y`} aria-invalid={!!err.message} aria-describedby={err.message ? 'e-message' : undefined} />
        {err.message && <p id="e-message" className="mt-2 text-sm text-red-ink">{err.message}</p>}
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p id="form-note" className="text-sm text-mute">Opens your email app, addressed to {SITE.email}.</p>
        <button type="submit" className="btn btn-red">Send request <span aria-hidden>→</span></button>
      </div>
      <p role="status" aria-live="polite" className="text-sm text-ink-2 sm:col-span-2">{sent ? 'Your email app should open now. If it did not, write to ' + SITE.email + '.' : ''}</p>
    </form>
  )
}
