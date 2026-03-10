import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const PoliticaIA = () => {
  const { t } = useLanguage();
  const p = t("politicaIA");

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">{t("blog.breadcrumbHome")}</Link> &gt; {p.breadcrumb}
      </nav>

      <h1 className="font-display text-3xl font-bold text-foreground mb-2">{p.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">{p.lastUpdated}</p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/90 leading-relaxed">

        <section>
          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">{p.s1Title}</h2>
          <p>{p.s1Intro}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>{p.s1b1Title}</strong> {p.s1b1Text}</li>
            <li><strong>{p.s1b2Title}</strong> {p.s1b2Text}</li>
            <li><strong>{p.s1b3Title}</strong> {p.s1b3Text}</li>
            <li><strong>{p.s1b4Title}</strong> {p.s1b4Text}</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">{p.s2Title}</h2>
          <p>{p.s2IntroA}<strong>{p.s2Bold}</strong>{p.s2IntroB}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s2b1}</li>
            <li>{p.s2b2}</li>
            <li>{p.s2b3A}<strong>{p.s2b3Strong}</strong>{p.s2b3B}</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">{p.s3Title}</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s3b1}</li>
            <li>{p.s3b2}</li>
            <li>{p.s3b3}</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">{p.s4Title}</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s4b1}</li>
            <li>{p.s4b2}</li>
            <li>
              {p.s4b3}{" "}
              <Link to="/politica-privacidad" className="text-secondary hover:underline">
                {p.s4privacyLink}
              </Link>.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">{p.s5Title}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse mt-2">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold">{p.s5th1}</th>
                  <th className="text-left py-2 pr-4 font-semibold">{p.s5th2}</th>
                  <th className="text-left py-2 font-semibold">{p.s5th3}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-4">{p.s5r1c1}</td>
                  <td className="py-2 pr-4">{p.s5r1c2}</td>
                  <td className="py-2">{p.s5r1c3}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">{p.s5r2c1}</td>
                  <td className="py-2 pr-4">{p.s5r2c2}</td>
                  <td className="py-2">{p.s5r2c3}</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">{p.s5r3c1}</td>
                  <td className="py-2 pr-4">{p.s5r3c2}</td>
                  <td className="py-2">{p.s5r3c3}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">{p.s6Title}</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>{p.s6b1}</li>
            <li>{p.s6b2}</li>
            <li>{p.s6b3A}<strong>{p.s6b3Strong}</strong>{p.s6b3B}</li>
            <li>{p.s6b4}</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground mt-8 mb-3">{p.s7Title}</h2>
          <p>
            {p.s7Text}{" "}
            <a href="mailto:contacto@guiadelsalon.com" className="text-secondary hover:underline">
              contacto@guiadelsalon.com
            </a>{" "}
            {p.s7Or}{" "}
            <Link to="/contacto" className="text-secondary hover:underline">
              {p.s7Link}
            </Link>.
          </p>
        </section>

      </div>
    </div>
  );
};

export default PoliticaIA;
