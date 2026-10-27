import Icon from './Icon'

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={light ? 'brand admin-brand brand-light' : 'brand admin-brand'}>
      <span className="brand-mark"><Icon name="bank" /></span>
      <span>northstar<span className="brand-accent">.</span></span>
      <small>ADMIN</small>
    </div>
  )
}
