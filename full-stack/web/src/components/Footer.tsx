import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Youtube, Linkedin, Instagram, ArrowUp, Bus } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  const col = 'space-y-2.5';
  const link = 'block text-sm text-ink-300 transition hover:text-gold-300';
  const head = 'mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white';

  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={48} dark />
            <div>
              <p className="font-display text-base font-semibold leading-tight text-white">NITER Smart Campus Management System</p>
              <p className="mt-1 text-xs text-ink-400">Empowering Education, Innovation & Excellence</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed">
            National Institute of Textile Engineering and Research
            <br />
            Nayarhat, Savar, Dhaka, Bangladesh
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { icon: Facebook, label: 'Facebook' },
              { icon: Youtube, label: 'YouTube' },
              { icon: Linkedin, label: 'LinkedIn' },
              { icon: Instagram, label: 'Instagram' },
            ].map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-300 transition hover:border-gold-400 hover:text-gold-300 hover:-translate-y-0.5">
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className={head}>Quick Links</p>
          <div className={col}>
            <Link to="/about" className={link}>About NITER</Link>
            <Link to="/academics" className={link}>Academic Programs</Link>
            <Link to="/departments" className={link}>Departments</Link>
            <Link to="/notices" className={link}>Notices</Link>
            <Link to="/news-events" className={link}>News and Events</Link>
            <Link to="/student-services" className={link}>Student Services</Link>
          </div>
        </div>

        <div>
          <p className={head}>Portal</p>
          <div className={col}>
            <Link to="/portal/student" className={link}>Student Portal</Link>
            <Link to="/portal/teacher" className={link}>Teacher Portal</Link>
            <Link to="/portal/admin" className={link}>Admin Portal</Link>
            <Link to="/transport" className="flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition hover:text-gold-200">
              <Bus size={14} /> Smart Transport
            </Link>
          </div>
        </div>

        <div>
          <p className={head}>Contact</p>
          <div className="space-y-3 text-sm">
            <a href="mailto:info@niter.edu.bd" className="flex items-center gap-2.5 transition hover:text-gold-300"><Mail size={15} className="text-gold-400" /> info@niter.edu.bd</a>
            <a href="tel:+88027791094" className="flex items-center gap-2.5 transition hover:text-gold-300"><Phone size={15} className="text-gold-400" /> +880 2-7791094</a>
            <span className="flex items-start gap-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-gold-400" /> Nayarhat, Savar, Dhaka-1340, Bangladesh</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-400 sm:flex-row">
          <p>© 2026 NITER Smart Campus Management System. All Rights Reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 transition hover:border-gold-400 hover:text-gold-300"
          >
            Back to Top <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}
