// Bouton WhatsApp flottant, visible sur les pages publiques du site.
// Objectif : repondre instantanement aux questions des delegations qui
// hesitent avant de valider leur inscription (cf. numero deja utilise pour
// le contact et le suivi de dossier ailleurs sur le site).
const WHATSAPP_NUM = '2290169303019'
const MESSAGE = "Bonjour, j'ai une question à propos de COPAF 2026."

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      style={{
        position: 'fixed', bottom: 22, right: 22, zIndex: 900,
        width: 58, height: 58, borderRadius: '50%',
        background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(37,211,102,0.45)', textDecoration: 'none',
        animation: 'copaf-wa-pulse 2.4s ease-in-out infinite',
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12.014 2C6.486 2 2 6.486 2 12.014c0 1.988.573 3.845 1.562 5.41L2 22l4.688-1.531A9.96 9.96 0 0 0 12.014 22C17.542 22 22 17.542 22 12.014 22 6.486 17.542 2 12.014 2zm0 18.09a8.05 8.05 0 0 1-4.32-1.253l-.31-.185-2.762.902.914-2.7-.201-.312a8.05 8.05 0 0 1-1.245-4.298c0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.09-8.09 8.09z"/>
      </svg>

      <style>{`
        @keyframes copaf-wa-pulse {
          0%, 100% { box-shadow: 0 8px 24px rgba(37,211,102,0.45); }
          50% { box-shadow: 0 8px 24px rgba(37,211,102,0.75), 0 0 0 8px rgba(37,211,102,0.15); }
        }
      `}</style>
    </a>
  )
}
