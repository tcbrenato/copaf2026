import { useEffect } from 'react'
import { supabase } from './supabase'

const getDevice = () => {
  const ua = navigator.userAgent
  if (/mobile/i.test(ua)) return 'Mobile'
  if (/tablet|ipad/i.test(ua)) return 'Tablette'
  return 'Desktop'
}

const getSource = () => {
  const ref = document.referrer
  if (!ref) return 'Direct'
  if (ref.includes('google')) return 'Google'
  if (ref.includes('facebook')) return 'Facebook'
  if (ref.includes('linkedin')) return 'LinkedIn'
  if (ref.includes('twitter')) return 'Twitter'
  if (ref.includes('whatsapp')) return 'WhatsApp'
  return 'Autre'
}

const useTracker = () => {
  useEffect(() => {
    const track = async () => {
      await supabase.from('visites').insert([{
        page: window.location.pathname,
        device: getDevice(),
        source: getSource(),
      }])
    }
    track()
  }, [])
}

export default useTracker