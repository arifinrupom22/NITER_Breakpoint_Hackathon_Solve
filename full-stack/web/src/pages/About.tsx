import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/ui';

export default function About() {
  return (
    <>
      <PageHero title="About NITER" crumb="About NITER" desc="The National Institute of Textile Engineering and Research — committed to excellence in engineering education, research and innovation." img="/images/about.svg" />
      <section className="section">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-2">
            <Reveal direction="left">
              <SectionHeading eyebrow="Who We Are" title="Excellence in Textile and Engineering Education" />
              <p className="leading-relaxed text-ink-600">
                The National Institute of Textile Engineering and Research is committed to excellence in engineering education,
                research, innovation, and the development of skilled professionals for the textile and technology sectors.
              </p>
              <p className="mt-4 leading-relaxed text-ink-500">
                Located in Nayarhat, Savar, NITER provides a modern learning environment with well-equipped laboratories,
                experienced faculty and strong industry partnerships. Our programs span computer science, electrical and
                electronic engineering, textile engineering, fashion design and industrial & production engineering.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[['5+', 'Departments'], ['150+', 'Faculty'], ['5000+', 'Students'], ['20+', 'Labs']].map(([v, l]) => (
                  <div key={l} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4 text-center">
                    <p className="font-display text-2xl font-semibold text-niter-700">{v}</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{l}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal direction="right">
              <img src="/images/about.svg" alt="NITER campus" className="w-full rounded-2xl border border-ink-100 shadow-lift" />
            </Reveal>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              { t: 'Mission', d: 'To provide quality engineering education that develops skilled, ethical and innovative professionals for the textile and technology sectors.' },
              { t: 'Vision', d: 'To be a leading institution in textile and engineering education and research, recognized nationally and internationally.' },
              { t: 'Values', d: 'Academic integrity, innovation, collaboration, sustainability and a student-first culture.' },
            ].map((x, i) => (
              <Reveal key={x.t} delay={i * 70}>
                <div className="card card-hover h-full p-6">
                  <h3 className="font-semibold text-ink-900">{x.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{x.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
