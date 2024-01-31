import qrcode from 'qrcode'
import { useEffect, useState } from 'react'

const QRCode: React.FC<{
  text: string
}> = ({ text }) => {
  const [dataUrl, setDataUrl] = useState<string>()

  useEffect(() => {
    if (!text) return
    qrcode.toDataURL(text, (err: any, url: string) => {
      if (!err) {
        setDataUrl(url)
      }
    })
  }, [text])

  return dataUrl ? <img src={dataUrl} alt={text} /> : null
}

export default QRCode
