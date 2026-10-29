import Icon from './Icon'

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={light ? 'brand admin-brand brand-light' : 'brand admin-brand'}>
      <span className="brand-mark"><Icon name="vault" /></span>
      <span className="brand-name">vault<span className="brand-accent">core</span></span>
      <small>FINANCIAL</small>
    </div>
  )
}
