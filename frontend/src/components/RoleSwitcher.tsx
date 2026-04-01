import type { Role } from '../services/api'
import { Shield, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react'

const RoleSwitcher = ({ onRoleChange = () => {} }: { onRoleChange?: (role: Role) => void }) => {
  const roles: { role: Role; label: string; icon: any }[] = [
    { role: 'ADMIN', label: 'Admin', icon: ShieldCheck },
    { role: 'ANALYST', label: 'Analyst', icon: ShieldAlert },
    { role: 'VIEWER', label: 'Viewer', icon: Shield },
  ]

  const handleChange = (role: Role) => {
    onRoleChange(role)
  }

  return (
    <div className="role-switcher">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw size={14} className="text-soft" />
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Test Perspective</span>
      </div>
      <div className="flex flex-col gap-1">
        {roles.map((r) => (
          <button 
            key={r.role}
            onClick={() => handleChange(r.role)}
            className="btn btn-ghost w-full"
            style={{ 
              justifyContent: 'flex-start', 
              fontSize: '0.75rem', 
              padding: '0.4rem 0.8rem',
              color: 'white',
              background: 'rgba(255,255,255,0.1)'
            }}
          >
            <r.icon size={14} />
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default RoleSwitcher
