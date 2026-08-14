import { Quote } from 'lucide-react';
import { Reveal } from '../../components/Reveal';

export function DirectorMessage() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-[380px_1fr]">
          <Reveal direction="left">
            <div className="relative mx-auto max-w-sm">
              <img src="/images/director.svg" alt="Director, NITER" className="w-full rounded-2xl border border-ink-100 shadow-lift" />
              <div className="absolute -bottom-4 left-1/2 w-64 -translate-x-1/2 rounded-xl bg-ink-950 px-5 py-3 text-center text-white shadow-lift">
                <p className="font-semibold">Director, NITER</p>
                <p className="text-xs text-ink-300">National Institute of Textile Engineering and Research</p>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right">
            <Quote size={40} className="text-gold-400" />
            <h2 className="h-display mt-3">Message from the Director</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-600">
              Welcome to the National Institute of Textile Engineering and Research — a community where engineering,
              technology and creativity come together to shape the future. Our commitment is to nurture every student
              into a skilled, ethical and innovative professional who contributes meaningfully to the nation and beyond.
            </p>
            <p className="mt-4 leading-relaxed text-ink-500">
              With the NITER Smart Campus ecosystem, we are bringing academics, transport, communication and campus life
              into a single connected digital experience — so that our students and teachers can focus on what matters most:
              learning, research and growth.
            </p>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-ink-100 bg-ink-50/50 px-5 py-4">
              <div>
                <p className="font-semibold text-ink-900">Director, NITER</p>
                <p className="text-xs text-ink-500">Welcome message · 2026</p>
              </div>
              <button className="btn btn-outline">Read Full Message</button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
